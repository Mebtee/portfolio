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
| Styling      | Hand-written CSS, custom properties     | ~24 KB, no framework, no dead code shipped                         |
| Behaviour    | Vanilla JS, ~7 KB                       | Progressive enhancement only — the page is complete without it     |
| Typeface     | Self-hosted Inter variable font         | One 47 KB file covers all weights; no Google Fonts round trip      |
| Icons        | Inline SVG + one sprite-free system font| No icon library, no extra requests                                 |

Total first-load payload is roughly **140 KB** across 8 requests.

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
    main.js                 nav, scroll-spy, reveals, hash handling
  fonts/
    inter-latin-var.woff2       latin subset (loaded)
    inter-latin-ext-var.woff2   latin-ext subset (loaded on demand only)
  img/
    favicon.svg
    og-image.png            1200x630 social card
    project-*.svg           abstract interface previews
tools/
  make-og.py                regenerates og-image.png (needs Pillow)
```

---

## Features

- **Sticky navigation** that becomes opaque once you scroll, with an active-section
  indicator driven by a deterministic scroll-spy.
- **Mobile navigation** as a slide-in panel: hamburger toggle, scrim, `Escape` to close,
  focus moved in on open and returned to the toggle on close, and Tab trapped while open.
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

Lighthouse 13, Chrome headless, served locally.

|           | Performance | Accessibility | Best Practices | SEO    |
| --------- | ----------- | ------------- | -------------- | ------ |
| Desktop   | **100**     | 100           | 100            | 100    |
| Mobile    | **98**      | 100           | 100            | 100    |

Mobile Core Web Vitals on the emulated mid-range profile:
FCP 1.6 s · LCP 1.8 s · TBT 80 ms · CLS 0.

Worst-case text contrast is 5.96:1, against the WCAG AA requirement of 4.5:1.

---

## Content rules

Every claim on the page is real. There are deliberately **no**:

- invented years of experience, clients, users, revenue or performance percentages
- fake testimonials, awards, certifications or employers
- percentage skill bars or "expert" proficiency labels
- placeholder copy
- fabricated GitHub repository links

Project previews are labelled *abstract interface preview* because they are abstract
wireframes, not screenshots. Skill groups are flat technology badges for the same reason —
a percentage bar would be a made-up number.

The Cardiomegaly project is described as an *AI-powered chest X-ray classification
system* with an explicit note that it is not a medical device and not a substitute for
professional diagnosis.

---

## Deployment

It is a static site, so any of these work as-is:

```bash
# Netlify — drag the folder in, or:
npx netlify-cli deploy --prod --dir .

# Vercel
npx vercel --prod

# GitHub Pages — push to main, enable Pages on the branch root
# Cloudflare Pages — build command: none, output directory: .
```

Before deploying, replace the placeholder domain. It currently appears in four places:

- `index.html` — `<link rel="canonical">`, `og:url`, `og:image`, `twitter:image`
- `index.html` — the JSON-LD `Person` block (`url`)
- `robots.txt` — `Sitemap:`
- `sitemap.xml` — `<loc>`

If you deploy to a different domain, also regenerate the social card so the URL baked into
the image metadata matches:

```bash
python tools/make-og.py
```

---

## Browser support

Modern evergreen browsers. Uses `IntersectionObserver`, CSS custom properties,
`clamp()`, `aspect-ratio`, `overflow: clip`, `dvh`, and `:focus-visible`.
Reduced-motion, forced-colors and print are all handled explicitly.
