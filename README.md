# Tamene Behailu — Portfolio

Personal portfolio site for **Tamene Behailu**, Full-Stack Software Engineer with QA experience.
Based in Addis Ababa, Ethiopia.

Built as a dependency-free static site: hand-written HTML, CSS and vanilla JavaScript. No
framework, no build step, no runtime dependencies.

---

## Stack

| Concern      | Choice                                  | Why                                                              |
| ------------ | --------------------------------------- | ---------------------------------------------------------------- |
| Markup       | Semantic HTML5                          | Single document, one `<h1>`, no skipped heading levels             |
| Styling      | Hand-written CSS, custom properties     | ~51 KB raw / 12 KB gzipped, no framework, no dead rules            |
| Behaviour    | Vanilla JS, ~15 KB                     | Progressive enhancement only — the page is complete without it     |
| Typeface     | Self-hosted Inter variable font         | One 47 KB file covers all weights; no Google Fonts round trip      |
| Icons        | Inline SVG                              | No icon library, no extra requests                                 |

First-load payload is **~85 KB gzipped across 8 requests** (183 KB uncompressed). The eight
project screenshots total 0.8 MB and are `loading="lazy"`, so they never enter the critical
path.

---

## Structure

```
index.html                  the entire site
404.html                    styled 404 for GitHub Pages / Netlify / Vercel
robots.txt                  allows crawling, points at the sitemap
sitemap.xml
site.webmanifest
assets/
  css/
    fonts.css               @font-face for the self-hosted Inter subsets
    styles.css              design system + all components
  js/
    main.js                 nav, scroll-spy, reveals, filters, dialogs, viewer
  fonts/
    inter-latin-var.woff2       latin subset (loaded)
    inter-latin-ext-var.woff2   latin-ext subset (loaded on demand only)
  images/
    logo.png                the personal logo, as supplied (1:1, near-white plate)
    logo-badge.png          112px downscale of the above — the header/footer mark
    1.png … 8.png           real project screenshots, two per project
  img/
    favicon.svg
    apple-touch-icon.png    180px logo for iOS home screens
    og-image.png            1200x630 social card
tools/
  make-og.py                regenerates og-image.png (needs Pillow)
```

`assets/images/logo.png` is the only asset in the repo the page never loads; it exists as the
source that `make-og.py` and the icon derivatives are generated from.

---

## Features

- **Sticky navigation** with the supplied logo on the left, a deterministic scroll-spy
  indicator, and a "Let's Talk" CTA.
- **Mobile navigation** as a slide-in panel: hamburger toggle, scrim, `Escape` to close,
  focus moved in on open and returned to the toggle on close, and Tab trapped while open.
- **Hero pipeline** — Frontend → API → Backend → Database → Cloud, with QA across the chain.
  Plain HTML and CSS: a horizontal rail on wide screens, a vertical one on phones. The only
  motion is one short element translating along the rail, so it composites cheaply, sits
  below the headline rather than behind it, and costs no layout.
- **Four real projects**, each with two screenshots, technology tags, live links, and a
  native `<dialog>` detail view (problem / solution / technology / result).
- **Screenshot gallery** where the first shot is shown, the second is revealed on hover or
  keyboard focus, and any frame opens one shared viewer. Touch devices get both shots
  stacked instead of a hover-only reveal.
- **Category filters** (All / Full-Stack / AI / ML / Automation / Creative AI) built on plain
  buttons with `aria-pressed`, over a list that is complete and readable without JS.
- **Scroll reveals** that fade content in, with a hard safety net so content can never
  get stuck invisible if a transition is dropped.
- **Fully responsive** from 320 px up. The mobile layout is a genuine reflow — two-column
  project and about layouts collapse, the skills grid re-wraps, the QA flow switches to a
  vertical sequence.
- **Accessible**: skip link, semantic landmarks, `aria-current` on the active nav item,
  `aria-expanded` on the toggle, visible focus rings, alt text on meaningful images, and a
  `prefers-reduced-motion` path that disables animation entirely.
- **Print stylesheet** so a recruiter can print a clean light-mode CV from the browser.
- Works with JavaScript disabled, and under `forced-colors` (Windows High Contrast).

---

## Measured results

Lighthouse 12, Chrome headless, served locally.

|           | Performance | Accessibility | Best Practices | SEO    |
| --------- | ----------- | ------------- | -------------- | ------ |
| Desktop   | **100**     | 100           | 100            | 100    |
| Mobile    | **91**      | 100           | 100            | 100    |

Mobile Core Web Vitals on the emulated mid-range profile:
FCP 1.7 s · LCP 2.0 s · TBT 270 ms · CLS 0.

Worst-case text contrast is 5.96:1, against the WCAG AA requirement of 4.5:1.

The remaining mobile cost is first-paint style and layout for the decorative hero layers
(grid mask, glows, sticky-header blur), not scripting: the page ships 4.6 KB gzipped of JS
and there is no library.

---

## Content rules

Every claim on the page is real. There are deliberately **no**:

- invented years of experience, clients, users, revenue or performance percentages
- fake testimonials, awards, certifications or employers
- percentage skill bars or "expert" proficiency labels
- placeholder copy
- fabricated GitHub repository links
- invented deployment URLs

Project screenshots are the running software, not mock-ups: two per project, in the order
they are captured. Skill groups are flat technology badges for the same reason as above — a
percentage bar would be a made-up number.

The Cardiomegaly project is described as an *AI-powered chest X-ray classification
system* with an explicit note that it is not a medical device and not a substitute for
professional diagnosis.

Only the Ethio Exchange and Cardiomegaly Detection projects are deployed; the LinkedIn
Automation and Stickman Video Director entries link to their repositories and carry no demo
link rather than an invented one.

---

## Deployment

Live at **https://portfolio-tamene-behailu.vercel.app/** (Vercel, no build step — the repo
root is the output directory).

It is a static site, so any of these work as-is:

```bash
# Netlify — drag the folder in, or:
npx netlify-cli deploy --prod --dir .

# Vercel
npx vercel --prod

# GitHub Pages — push to main, enable Pages on the branch root
# Cloudflare Pages — build command: none, output directory: .
```

The domain is declared in four files, and every one of them must match the host you deploy
to or search engines will be told the real site lives somewhere else:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
- `index.html` — the JSON-LD `Person` block (`url`, `image`)
- `robots.txt` — `Sitemap:`
- `sitemap.xml` — `<loc>` (and `lastmod`, which should be the date of the deploy)

The social card bakes the name, role and logo in rather than the domain, so it needs no
regeneration when the host changes. Rebuild it only if that copy changes:

```bash
python tools/make-og.py
```

---

## Browser support

Modern evergreen browsers. Uses `IntersectionObserver`, CSS custom properties,
`clamp()`, `aspect-ratio`, `overflow: clip`, `dvh`, and `:focus-visible`.
Reduced-motion, forced-colors and print are all handled explicitly.
