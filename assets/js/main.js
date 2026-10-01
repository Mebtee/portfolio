/* ==========================================================================
   Tamene Behailu — Portfolio
   Progressive enhancement only. Every feature here degrades gracefully:
   without JS the page is fully readable, navigable and completely visible.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav    = document.getElementById('primary-nav');
  var scrim  = document.getElementById('nav-scrim');

  /* ------------------------------------------------------------------
     Shared rAF-tick. One scroll handler, one layout read per frame.
     ------------------------------------------------------------------ */
  var tickers = [];
  var scheduled = false;
  function onScroll() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      for (var i = 0; i < tickers.length; i++) tickers[i]();
    });
  }

  /* ------------------------------------------------------------------
     1. Sticky header state
     ------------------------------------------------------------------ */
  if (header) {
    tickers.push(function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    });
    header.classList.toggle('is-stuck', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* ------------------------------------------------------------------
     2. Reveal on scroll
     ------------------------------------------------------------------ */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var pendingReveals = revealables.slice();

  /* Elements revealed so far but not yet guaranteed-visible. A single shared
     timer finalises the whole set, so a dropped or coalesced transition can
     never leave content stuck at opacity 0. */
  var awaitingFinal = [];
  var finalTimer = null;
  function scheduleFinalise() {
    if (finalTimer) window.clearTimeout(finalTimer);
    finalTimer = window.setTimeout(function () {
      for (var i = 0; i < awaitingFinal.length; i++) {
        awaitingFinal[i].classList.add('is-final');
      }
      awaitingFinal = [];
      finalTimer = null;
    }, 700);
  }
  function show(el) {
    el.classList.add('is-visible');
    awaitingFinal.push(el);
    scheduleFinalise();
  }

  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    pendingReveals.forEach(show);
    pendingReveals = [];
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        show(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });

    pendingReveals.forEach(function (el) { revealObserver.observe(el); });

    /* Safety net: never leave content permanently invisible. An observer
       callback can be skipped during very fast scrolling or on jump-scroll
       (End key, anchor deep-link, restored scroll position). Anything that
       has already reached the viewport gets shown regardless. */
    tickers.push(function () {
      if (!pendingReveals.length) return;
      var limit = window.scrollY + window.innerHeight + 120;
      var rest = [];
      for (var i = 0; i < pendingReveals.length; i++) {
        var el = pendingReveals[i];
        if (el.getBoundingClientRect().top + window.scrollY <= limit) {
          show(el);
          revealObserver.unobserve(el);
        } else {
          rest.push(el);
        }
      }
      pendingReveals = rest;
    });
    onScroll();
  }

  /* ------------------------------------------------------------------
     3. Mobile navigation
     ------------------------------------------------------------------ */
  var isOpen = false;

  function focusFirstInPanel() {
    if (!nav) return;
    var first = nav.querySelector('a[href], button:not([disabled])');
    if (first) first.focus();
  }

  function openNav() {
    if (!nav || !toggle || isOpen) return;
    isOpen = true;
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
    if (scrim) {
      scrim.hidden = false;
      window.requestAnimationFrame(function () { scrim.classList.add('is-open'); });
    }
    document.body.style.overflow = 'hidden';
    // The panel is `visibility: hidden` until the class change has been
    // style-resolved; focusing before then silently fails.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(focusFirstInPanel);
    });
  }

  function closeNav(returnFocus) {
    if (!nav || !toggle || !isOpen) return;
    isOpen = false;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
    if (scrim) {
      scrim.classList.remove('is-open');
      window.setTimeout(function () { scrim.hidden = true; }, 260);
    }
    document.body.style.overflow = '';
    if (returnFocus && toggle) toggle.focus();
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      if (isOpen) closeNav(true); else openNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !isOpen) return;
      e.preventDefault();
      closeNav(true);
    });

    /* Keep Tab inside the open panel. */
    nav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !isOpen) return;
      var all = Array.prototype.slice.call(nav.querySelectorAll('a[href]'));
      if (!all.length) return;
      var first = all[0];
      var last  = all[all.length - 1];
      var active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    });

    /* Any in-page link closes the panel. */
    nav.addEventListener('click', function (e) {
      var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (link) closeNav(false);
    });

    if (scrim) scrim.addEventListener('click', function () { closeNav(true); });
  }

  var desktop = window.matchMedia('(min-width: 901px)');
  function onBreakpoint(e) { if (e.matches) closeNav(false); }
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else if (desktop.addListener) desktop.addListener(onBreakpoint);

  /* ------------------------------------------------------------------
     4. Scroll-spy
     Deterministic: the last navigable section whose top has passed the
     header line. Always resolves to exactly one link, including at the very
     bottom of the document where a viewport-band observer falls into a gap.
     ------------------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link[href^="#"]'));
  var targets = [];

  function buildTargets() {
    targets = navLinks.map(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      return { link: link, id: id, section: section };
    }).filter(function (t) { return !!t.section; });

    targets.forEach(function (t) {
      t.top = t.section.getBoundingClientRect().top + window.scrollY;
    });

    /* The nav order is Home, About, Experience, Projects, Skills, Contact,
       which is not the document order. `currentSection` relies on ascending
       document position, so sort before using it as a lookup. */
    targets.sort(function (a, b) { return a.top - b.top; });
  }

  function setActive(id) {
    for (var i = 0; i < targets.length; i++) {
      var on = targets[i].id === id;
      targets[i].link.classList.toggle('is-active', on);
      if (on) targets[i].link.setAttribute('aria-current', 'true');
      else targets[i].link.removeAttribute('aria-current');
    }
  }

  function currentSection() {
    if (!targets.length) return;
    var headerH = header ? header.getBoundingClientRect().height : 0;

    // At the document bottom, always highlight the last section: the final
    // one may be shorter than the viewport and never reach the probe.
    var doc = document.documentElement;
    if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
      return targets[targets.length - 1].id;
    }

    /* Highlight the last section that has scrolled past a line ~30% down the
       viewport, not merely past the header. A deep link lands its target just
       below the header (due to scroll-padding-top), so probing at the header
       alone would leave the previous link highlighted. */
    var probe = window.scrollY + Math.max(headerH + 24, window.innerHeight * 0.3);

    var id = targets[0].id;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].top <= probe) id = targets[i].id;
      else break;
    }
    return id;
  }

  if (navLinks.length) {
    buildTargets();

    /* Re-measure and re-apply: fonts and images settle after load, and a
       fragment deep-link (#projects) or a restored back/forward position
       lands after first paint, so the first sync can read a stale scroll. */
    function syncSpy() {
      buildTargets();
      setActive(currentSection());
    }

    window.addEventListener('load', function () {
      syncSpy();
      window.setTimeout(syncSpy, 300);
    });
    window.addEventListener('pageshow', syncSpy);
    window.addEventListener('resize', syncSpy, { passive: true });

    tickers.push(function () { setActive(currentSection()); });
    setActive(currentSection());
  }

  /* ------------------------------------------------------------------
     5. Hash handling — deep links and browser back/forward
     ------------------------------------------------------------------ */
  window.addEventListener('hashchange', function () {
    var id = window.location.hash.slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
  });
})();
