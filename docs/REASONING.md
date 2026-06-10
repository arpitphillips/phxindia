# Reasoning Document — Rebuilding phxindia.com

This document records the thinking behind every significant decision in the
rebuild: what was considered, what was chosen, what was rejected, and why.
Companion document: [SITE-ANALYSIS.md](./SITE-ANALYSIS.md) (research into the
existing site).

---

## 1. The brief, restated

> Make a fresh new version of phxindia.com that is highly responsive,
> beautiful, classic, minimal, and faithfully keeps all the functions of the
> existing website. Folders per industry best practice. Use a mix of
> HTML / TS / Python / Rust where each best serves the function.

Decomposed into hard requirements:

1. **Function parity** — every function in SITE-ANALYSIS.md §3 must exist:
   portfolio galleries, three divisions, video showcase, about, team,
   contact + "Book a shoot", social links, SEO-friendly page structure.
2. **Responsive** — phones → ultrawide, no horizontal scroll, touch-friendly.
3. **Classic & minimal aesthetic** — restraint, typography-led, whitespace.
4. **Best-practice repo layout** — separation of source, build artifacts,
   docs, services, tooling.
5. **Polyglot where justified** — language choice must map to a real
   functional need, not box-ticking.

A constraint discovered during research: **the live site is unreachable from
this build environment** (network allowlist). Consequences: (a) content was
reconstructed from indexed sources; (b) real photographs could not be
downloaded — and shouldn't be wholesale copied anyway (copyright belongs to
PHX). The rebuild therefore ships with **clearly-marked placeholder art**
labeled with their real, published project names, and a documented drop-in
path for the studio's own images.

## 2. Architecture: what kind of site should this be?

### Options considered

| Option | Verdict | Why |
|---|---|---|
| WordPress (parity with current stack) | **Rejected** | Inherits the weight and maintenance burden the redesign is an opportunity to shed. Needs PHP hosting, plugin upkeep, and is the opposite of "minimal". |
| React/Next.js SPA | **Rejected** | A portfolio site is documents, not an application. A JS framework adds build complexity, hurts time-to-first-paint on image-heavy pages, and is fragile over years. Photography sites live or die on first paint. |
| Static site generator (Astro/Eleventy/Hugo) | **Seriously considered, rejected for v1** | Good fit, but adds a framework dependency and templating DSL for ~13 pages. At this scale, hand-authored HTML with a shared CSS/JS bundle is simpler to maintain and has zero supply-chain surface. If the page count grows past ~30, revisit. |
| **Static HTML + modern CSS + TypeScript, small Python API, Rust build tooling** | **Chosen** | Maximum speed, longevity, and hostability (any static host). Each dynamic need is isolated into the smallest tool that solves it. |

### Where each language earns its place

- **HTML/CSS** — the site itself. Semantic, accessible, indexable documents.
  No framework needed to render text and images beautifully.
- **TypeScript** (`src/ts/` → compiled to plain JS in `site/assets/js/`) —
  the interactive layer: mobile navigation, gallery lightbox, gallery
  filtering, scroll-reveal, booking-form validation/submission. TS gives
  type-checked DOM code; the output is dependency-free vanilla JS (~7 KB),
  and the site degrades gracefully if JS never loads.
- **Python** (`api/` — FastAPI) — the one genuinely server-side function:
  receiving "Book a shoot" submissions. FastAPI + Pydantic gives validated,
  documented, async form handling in ~150 lines. The front-end form **works
  without it** (falls back to a pre-filled `mailto:`), so the static site
  never hard-depends on the API being up.
- **Rust** (`tools/sitecheck/`) — build-time quality gate: walks `site/`,
  verifies every internal link and asset reference resolves, checks
  required SEO tags, and generates `sitemap.xml`. Written std-only (zero
  crates) deliberately: it compiles anywhere, forever, with no registry
  access. Rust is the right tool here because the checker is pure
  CPU/filesystem work distributed as a single static binary.

**Rejected polyglot ideas:** a Rust image-optimization pipeline (the `image`
crate was unfetchable from this environment — crates.io is blocked — and an
unverifiable tool must not ship); a Python static-site generator (premature
at 13 pages, see SSG row above).

## 3. URL structure: faithful, with corrections

The rebuild mirrors the original IA so existing inbound links and search
equity map 1:1, with two deliberate fixes:

| Original | Rebuild | Reasoning |
|---|---|---|
| `/photography/architecture/` | same | Keep |
| `/videography/residencial/` | `/videography/residential/` | The original slug is a typo. Fixed; deployment should 301 the old slug (documented in README). |
| `/videography/motiongraphix-commercial/` | `/videography/commercial/` | Normalized to match its sibling. 301 the old slug. |
| *(unknown)* | `/photography/interiors/`, `/photography/hospitality/`, `/photography/products/` | Their stated photography areas. Marked inferred in SITE-ANALYSIS §2. |

Every page keeps the original `Page – PHX India` en-dash title convention —
it is part of the brand's search identity.

`index.html`-per-directory is used (e.g. `about/index.html`) so the site
serves clean trailing-slash URLs from any static host with zero rewrite
configuration — same URLs as the WordPress original.

## 4. Design system: "classic, minimal, beautiful"

### Principles

1. **The chrome recedes; the work leads.** A photography studio's site is a
   frame. Near-monochrome palette; color enters only through photographs.
2. **Typography does the talking.** Classic = a refined serif for display
   (Cormorant Garamond — high-contrast, old-style, gallery-catalogue feel)
   paired with a quiet grotesque (Inter) for UI and body. Both loaded from
   Google Fonts with `font-display: swap` and full system-stack fallbacks,
   so the site renders instantly and works offline.
3. **Hairlines and whitespace instead of boxes and shadows.** 1px rules on
   a warm paper background (`#fbfaf8`), generous `clamp()`-based spacing.
4. **Motion is a whisper.** Single reveal-on-scroll effect, 0.6s ease-out,
   fully disabled under `prefers-reduced-motion`.

### Tokens (defined once in `:root`)

- Paper `#fbfaf8` · Ink `#141414` · Muted `#6f6a64` · Hairline `#e7e3dd`
- Type scale via `clamp()` so headings track viewport between breakpoints.
- Spacing: a `--gutter` of `clamp(20px, 5vw, 72px)` governs all margins.

### Layout decisions

- **Galleries:** CSS Grid, `repeat(auto-fill, minmax(...))` — responsive
  without media-query forests. Portrait 4:5 tiles (matches interior
  photography norms and their Instagram crop).
- **Lightbox:** native `<dialog>` element — free focus management, ESC
  handling and backdrop, with arrow-key navigation added in TS.
- **Navigation:** sticky header; on mobile a full-screen overlay menu
  (button-driven, `aria-expanded` managed in TS).
- **Images:** `loading="lazy"` + `aspect-ratio` reserved boxes — no layout
  shift. Placeholders are inline-SVG duotone art so the repo is
  self-contained; swapping to real photos is a one-attribute change
  documented in the README.

### Accessibility (non-negotiable best practice)

Skip link on every page; landmark roles; one `<h1>` per page; alt text on
all imagery; `:focus-visible` styles; color contrast ≥ 4.5:1 (`#141414` on
`#fbfaf8` ≈ 15:1, muted text ≈ 5.4:1); keyboard-operable lightbox and menu;
form fields with real `<label>`s and `aria-live` status messages.

### SEO

Per-page `<title>` + meta description + canonical; Open Graph and Twitter
cards; JSON-LD `ProfessionalService` schema on the homepage with the real
NAP (name/address/phone) data; `robots.txt`; `sitemap.xml` generated by the
Rust tool at build time.

## 5. The booking flow ("Book a shoot")

The original site's contact page exposes a booking function. Design:

1. Form fields: name, email, phone, service (photography/videography/
   styling), project location, message. Required: name, email, message.
2. TS validates inline, then `POST`s JSON to `/api/booking`.
3. FastAPI validates again (Pydantic, server-side — never trust the
   client), stores the inquiry as JSON-lines on disk, and returns the
   booking reference. An SMTP hook is stubbed and documented — credentials
   are deployment-time configuration and must not live in the repo.
4. **If the API is unreachable**, TS converts the submission into a
   pre-filled `mailto:mailbox@phxindia.in` link and tells the user — the
   function degrades, never disappears. With JS disabled entirely, the form's
   plain `action="mailto:..."` still works.

Rejected: third-party form services (Formspree etc.) — adds an external
dependency and data-sharing question the studio hasn't agreed to.

## 6. Repository layout

```
phxindia/
├── README.md             ← project front door: run, build, deploy
├── CHANGELOG.md          ← Keep a Changelog 1.1, SemVer
├── docs/                 ← SITE-ANALYSIS.md, REASONING.md (this file)
├── site/                 ← the deployable artifact (static root)
│   ├── …/index.html      ← pages mirroring original URL structure
│   └── assets/           ← css/, js/ (compiled), img/
├── src/ts/               ← TypeScript sources (only hand-edited JS code)
├── api/                  ← FastAPI booking service (independent deployable)
├── tools/sitecheck/      ← Rust QA tool: link check + sitemap generation
├── scripts/              ← build.sh, serve.py (stdlib preview server)
├── package.json          ← TS toolchain pinning + npm scripts
└── tsconfig.json
```

Rationale: the deployable static root (`site/`) is isolated, so deployment
is "upload one folder" / point Netlify-Pages-nginx at it. Sources that
compile (`src/ts`) live outside the artifact to keep build inputs and
outputs separate. The API and the QA tool are self-contained units with
their own dependency manifests — they version and deploy independently.
Compiled JS **is** committed (a deliberate exception to "don't commit build
artifacts") so the static site works straight from a checkout with zero
toolchain — appropriate for a small studio site repo.

## 7. Quality gates

- `tsc --noEmit`-style strictness via `"strict": true` — TS compiles clean.
- `tools/sitecheck` must pass: zero broken internal links/assets, required
  meta tags present on every page, sitemap regenerated.
- API: compiles (`py_compile`), runs, and answers a smoke-test booking
  round-trip locally.
- Manual checks: pages served locally and fetched at key breakpoints'
  markup level; lightbox/menu/form logic reviewed.

## 8. Honest limitations & future work

1. **Placeholder imagery.** Until PHX supplies originals, tiles are duotone
   SVG art labeled with real published project names (ArchDaily-verified).
   Swap path documented in README §Content.
2. **Inferred category pages** (interiors/hospitality/products) need
   confirmation against the live site.
3. **Copy is reconstructed**, not copied: it is faithful to their published
   self-description but should be approved by the studio.
4. **Video embeds** are structural placeholders — the studio's real
   Vimeo/YouTube IDs drop into one `data-` attribute each.
5. **Redirects** for the two corrected slugs must be configured at the host
   (examples for Netlify/nginx in README).
6. If the page count grows, graduate to Eleventy/Astro using these pages as
   templates — the CSS/TS carry over unchanged.
