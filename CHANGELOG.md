# Changelog

All notable changes to this project are documented in this file.
Format: [Keep a Changelog 1.1](https://keepachangelog.com/en/1.1.0/);
versioning: [SemVer](https://semver.org/).

## [Unreleased]

### To do
- Replace generated placeholder art with the studio's real photography.
- Confirm the inferred photography categories (interiors / hospitality /
  products) against the live site.
- Add real Vimeo/YouTube embed URLs to the Motiongraphix pages.
- Studio sign-off on all reconstructed copy.

## [1.0.0] — 2026-06-10

### Added
- **Research** — `docs/SITE-ANALYSIS.md`: full reconstruction of the
  existing site's structure, functions, people, contact data and platform
  (live site unreachable from the build environment; assembled from search
  indexes and third-party profiles, every claim source-tagged).
- **Reasoning** — `docs/REASONING.md`: all architecture, design-system,
  URL, accessibility and language-choice decisions with rejected
  alternatives.
- **Static site** (`site/`) — 14 hand-authored responsive pages mirroring
  the original URL structure: home, about, team, contact,
  photography (+ 4 category galleries), videography (+ residential,
  commercial), styling, 404. Classic-minimal design system
  (Cormorant Garamond / Inter, paper-and-ink palette, hairline rules);
  semantic, accessible markup (skip links, landmarks, `aria-current`,
  keyboard-operable everything, `prefers-reduced-motion` support); per-page
  SEO meta, Open Graph, JSON-LD `ProfessionalService`, robots.txt,
  generated sitemap.xml.
- **TypeScript layer** (`src/ts/` → `site/assets/js/`) — mobile navigation,
  gallery category filtering, `<dialog>`-based lightbox with keyboard
  navigation, scroll-reveal, booking-form validation with API submission
  and `mailto:` fallback. Strict mode, zero runtime dependencies.
- **Booking API** (`api/`) — FastAPI service for "Book a shoot" inquiries:
  Pydantic validation, JSONL storage, optional SMTP forwarding via
  environment variables, CORS, health endpoint.
- **Quality tooling** (`tools/sitecheck/`) — std-only Rust CLI that fails
  the build on broken internal links/assets or missing required head tags,
  and generates `sitemap.xml`.
- **Scripts** — `build.sh` (full pipeline), `serve.py` (stdlib preview
  server with custom-404 semantics), `gen_placeholders.py` (deterministic
  SVG placeholder art).
- Project meta: README, this changelog, `.gitignore`, `.editorconfig`,
  `package.json`, `tsconfig.json`.

### Changed
- Normalized two original slugs (`/videography/residencial/` →
  `/videography/residential/`; `/videography/motiongraphix-commercial/` →
  `/videography/commercial/`) — 301 redirects documented in README.

[Unreleased]: ./CHANGELOG.md
[1.0.0]: ./CHANGELOG.md
