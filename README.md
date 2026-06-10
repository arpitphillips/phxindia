# PHX India — Website Rebuild

A fresh, fully responsive, classic-minimal rebuild of
[phxindia.com](https://phxindia.com/) — the website of **Photographix
(PHX India Imaging Services LLP)**, an interior, architecture and
hospitality imaging studio (photography · videography · styling) with
studios in Mumbai, Ahmedabad and South India.

- **What the existing site is and how it was researched:** [docs/SITE-ANALYSIS.md](docs/SITE-ANALYSIS.md)
- **Every design & engineering decision, with rationale:** [docs/REASONING.md](docs/REASONING.md)
- **History of changes:** [CHANGELOG.md](CHANGELOG.md)

## Repository layout

```
site/              The deployable static site (point any static host here)
src/ts/            TypeScript sources → compiled to site/assets/js/
api/               FastAPI booking service ("Book a shoot" backend, optional)
tools/sitecheck/   Rust QA tool: link checker + sitemap generator (std-only)
scripts/           build.sh, serve.py (preview), gen_placeholders.py
docs/              Site analysis & reasoning documents
```

## Quick start

```bash
# Preview the site locally
python3 scripts/serve.py            # → http://127.0.0.1:8000/

# Full build (TypeScript + QA gate + sitemap)
bash scripts/build.sh

# Run the booking API (optional — the form falls back to mailto without it)
cd api && pip install -r requirements.txt && uvicorn main:app --port 8001
```

Requirements: Node ≥ 18 with `tsc` (TypeScript 5), Python ≥ 3.10,
Rust ≥ 1.70. Only needed for development — `site/` is deployable as-is.

## Pages

| URL | Page |
|---|---|
| `/` | Home |
| `/photography/` (+ `/interiors/`, `/architecture/`, `/hospitality/`, `/products/`) | Photographix — galleries with filtering & lightbox |
| `/videography/` (+ `/residential/`, `/commercial/`) | Motiongraphix — films |
| `/styling/` | Styling division |
| `/about/` · `/team/` · `/contact/` | Studio, partners, booking form |

URL structure mirrors the original site (including the en-dash page-title
convention). Two original slugs were typos/inconsistencies and were
normalized — configure 301 redirects at the host:

```
/videography/residencial/             → /videography/residential/
/videography/motiongraphix-commercial/ → /videography/commercial/
```

(Netlify `_redirects`: `/videography/residencial/ /videography/residential/ 301`)

## Content: swapping in real photography

Gallery tiles currently use **generated placeholder art**
(`scripts/gen_placeholders.py`) labeled with the studio's real, published
project names — the studio's photographs are copyrighted and were not
bundled. To use real images:

1. Drop optimized images into `site/assets/img/`.
2. Replace the `<img src="/assets/img/ph-work-XX.svg">` references in the
   gallery pages (keep `width`/`height` and `alt` accurate).
3. For films, put the Vimeo/YouTube embed URL into each
   `.film-frame`'s `data-embed` attribute and add the `<iframe>`.
4. Run `bash scripts/build.sh` — the QA gate verifies nothing broke.

## Booking form

`/contact/` posts JSON to `/api/booking` (see [api/README.md](api/README.md)).
If the API is down or not deployed, the form falls back to a pre-filled
`mailto:mailbox@phxindia.in` — the function never disappears. With JS
disabled, the plain `mailto:` form action still works.

## Quality gates

`bash scripts/build.sh` runs: strict TypeScript compilation → Rust
`sitecheck` (every internal link/asset must resolve; every page must have
title, meta description, viewport and canonical tags) → sitemap
regeneration. The build fails on any broken reference.
