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
       (End key, anchor deep-link, restored scroll position). Anything that has
       already reached the viewport gets shown regardless. Only runs on scroll:
       the observer's own initial callback covers what is visible at load, and
       eagerly measuring here would force a synchronous layout at parse time. */
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
  var headerH = 0;

  function buildTargets() {
    targets = navLinks.map(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      return { link: link, id: id, section: section };
    }).filter(function (t) { return !!t.section; });

    targets.forEach(function (t) {
      t.top = t.section.getBoundingClientRect().top + window.scrollY;
    });

    /* Cached here rather than read per frame: the header height only changes
       on resize, and measuring it during the scroll ticker would force a
       synchronous layout on every frame. */
    headerH = header ? header.getBoundingClientRect().height : 0;

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

  /* ------------------------------------------------------------------
     6. Project detail dialogs and the shared screenshot viewer.
     Native <dialog>, so the browser already provides the modal semantics,
     focus containment, Escape-to-close and inerting of the page behind.
     ------------------------------------------------------------------ */
  var lightbox   = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCap = document.getElementById('lightbox-cap');

  function openDialog(dlg) {
    if (!dlg) return;
    if (typeof dlg.showModal === 'function') {
      if (!dlg.open) dlg.showModal();
    } else {
      /* Very old browsers: fall back to a non-modal open. Still readable,
         just without the backdrop or focus containment. */
      dlg.setAttribute('open', '');
    }
  }

  function closeDialog(dlg) {
    if (!dlg || !dlg.open) return;
    if (typeof dlg.close === 'function') dlg.close();
    else dlg.removeAttribute('open');
  }

  /* "View Project" buttons. */
  var openers = document.querySelectorAll('[data-open]');
  Array.prototype.forEach.call(openers, function (btn) {
    btn.addEventListener('click', function () {
      openDialog(document.getElementById(btn.getAttribute('data-open')));
    });
  });

  /* Explicit close buttons, including ones inside the viewer. */
  var closers = document.querySelectorAll('[data-close]');
  Array.prototype.forEach.call(closers, function (btn) {
    btn.addEventListener('click', function () {
      closeDialog(btn.closest('dialog'));
    });
  });

  /* Clicking the backdrop (i.e. the dialog element itself, not its content)
     dismisses, matching the behaviour people expect from a lightbox. */
  var allDialogs = document.querySelectorAll('dialog');
  Array.prototype.forEach.call(allDialogs, function (dlg) {
    dlg.addEventListener('click', function (e) {
      if (e.target !== dlg) return;
      var r = dlg.getBoundingClientRect();
      var inside = e.clientX >= r.left && e.clientX <= r.right &&
                   e.clientY >= r.top  && e.clientY <= r.bottom;
      if (!inside) closeDialog(dlg);
    });
  });

  /* The shared viewer. Any element carrying data-zoom opens it. */
  function openViewer(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', alt || '');
    if (lightboxCap) lightboxCap.textContent = alt || '';
    openDialog(lightbox);
  }

  var zoomers = document.querySelectorAll('[data-zoom]');
  Array.prototype.forEach.call(zoomers, function (btn) {
    btn.addEventListener('click', function () {
      openViewer(btn.getAttribute('data-zoom'), btn.getAttribute('data-zoom-alt') || '');
    });
  });

  /* Card galleries. The frame is a <button> holding both screenshots: the
     first is shown, the second is revealed on hover or focus. Whichever frame
     was clicked opens in the viewer. Indexed per card, so each project starts
     on its own first screenshot. */
  var galleries = document.querySelectorAll('.project__shot');
  Array.prototype.forEach.call(galleries, function (shot) {
    var first = shot.querySelector('img');
    if (first) first.classList.add('is-on');

    shot.addEventListener('click', function (e) {
      var img = e.target && e.target.closest ? e.target.closest('img') : null;
      if (!img) img = first;
      openViewer(
        img ? img.getAttribute('src') : '',
        img ? img.getAttribute('alt') || '' : ''
      );
    });
  });

  /* ------------------------------------------------------------------
     7. Project filtering. Buttons only; the grid is a plain list of
     articles, so this is an enhancement over content already on the page.
     ------------------------------------------------------------------ */
  var filterBtns = document.querySelectorAll('.filter');
  var projects   = document.querySelectorAll('#project-list .project');
  var countEl    = document.getElementById('project-count');

  function applyFilter(cat) {
    var shown = 0;
    Array.prototype.forEach.call(projects, function (p) {
      var cats = (p.getAttribute('data-cats') || '').split(/\s+/);
      var match = cat === 'all' || cats.indexOf(cat) !== -1;
      p.classList.toggle('is-hidden', !match);
      if (match) shown++;
    });
    if (countEl) {
      countEl.textContent = cat === 'all'
        ? 'Showing all ' + shown + ' projects.'
        : 'Showing ' + shown + ' of ' + projects.length + ' projects.';
    }
  }

  Array.prototype.forEach.call(filterBtns, function (btn) {
    btn.addEventListener('click', function () {
      Array.prototype.forEach.call(filterBtns, function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
})();
