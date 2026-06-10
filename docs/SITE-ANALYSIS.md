# Understanding the Existing Website — phxindia.com

> **Status of this document.** This is the research foundation for the rebuild.
> Direct access to `phxindia.com` is blocked from this build environment
> (egress proxy returns `403 — host_not_allowed` for the domain, for the
> Wayback Machine, and for all general web hosts). Everything below was
> assembled through search-engine snippets, indexed page titles/URLs, and
> third-party profiles (ArchDaily, Buildofy, ZaubaCorp, LinkedIn, Love That
> Design, Archello, Hospitality Snapshots). Each claim is tagged:
> **[Confirmed]** = seen verbatim in an indexed title/URL or multiple
> independent sources; **[Inferred]** = reasonable conclusion from evidence,
> flagged for verification once someone with browser access can compare.

---

## 1. Who they are

| Field | Value | Evidence |
|---|---|---|
| Trading name | **Photographix** (parent brand **PHX India**) | [Confirmed] |
| Legal entity | PHX India Imaging Services LLP (LLP ID AAE-8081) | [Confirmed] — ZaubaCorp, D&B |
| Incorporated | 23 December 2015, RoC Mumbai | [Confirmed] |
| Homepage `<title>` | `PHX India – Imaging Services LLP` | [Confirmed] — indexed title |
| Business | Imaging services for architecture, interior design & allied design fields: **photography, videography, styling, digital media** | [Confirmed] |
| Specialties | Interiors, Architecture, Hospitality/Hotels, Realty, Products | [Confirmed] |
| Coverage | Pan-India — Mumbai (HQ), Gujarat/Ahmedabad, South division | [Confirmed] |

Origin story repeated across profiles: *"Starting off as a pure photography
studio, it has now burgeoned into an imaging services company engaged in
photography, videography, styling and digital media expertise for
professionals from the architectural, interior design and allied design
fields."* Their stated philosophy: the job is *"much more than just taking
good exposures — it involves thought, planning, composing, styling,
arranging, rearranging, adding and subtracting."*

## 2. Site map of the existing site

URLs below were observed verbatim in search indexes (title — URL):

| Page title (as indexed) | URL | Notes |
|---|---|---|
| PHX India – Imaging Services LLP | `/` | Homepage |
| About – PHX India | `/about/` | Company story |
| Team – PHX India | `/team/` | Partner bios |
| Contact – PHX India | `/contact/` | Has a **"Book a shoot"** function |
| Photographix – PHX India | `/photography/` | Photography division landing |
| Photographix – Architecture – PHX India | `/photography/architecture/` | Photo category page |
| Motiongraphix – PHX India | `/videography/` | Videography division landing |
| Motiongraphix – Residential – PHX India | `/videography/residencial/` | **Slug typo on the live site** ("residencial") |
| Motiongraphix – Commercial – PHX India | `/videography/motiongraphix-commercial/` | Inconsistent slug on the live site |
| Styling – PHX India | `/styling/` | Styling division |

**[Inferred]** Additional photography category pages beyond Architecture
(e.g. Interiors, Hospitality, Products) very likely exist, because their
stated photography areas are "Interior-Architecture, Hotels, Realty and
Products" — but only `/photography/architecture/` surfaced in the index.
The rebuild includes Interiors / Hospitality / Products category pages to
cover those functions; placeholders are clearly marked.

**Information architecture.** Two-level hierarchy: division landing pages
(`Photography`, `Videography`, `Styling`) → category pages. Sub-brand
naming: **Photographix** (stills), **Motiongraphix** (motion). Page titles
use an en-dash separator (`Page – PHX India`).

## 3. Functions the site performs

These are the functions a faithful rebuild must keep:

1. **Portfolio display** — galleries of interior/architecture photography,
   organized by category.
2. **Division presentation** — distinct sections for Photography
   (Photographix), Videography (Motiongraphix), Styling.
3. **Videography showcase** — Residential and Commercial reels/films
   (video embeds).
4. **Company story** — About page.
5. **Team presentation** — partner bios across regions.
6. **Contact & booking** — contact details + a "Book a shoot" inquiry path.
7. **Social presence links** — Instagram, Facebook, X, LinkedIn.
8. **SEO identity** — indexed page-per-section structure, en-dash titles.

## 4. People

| Person | Role | Evidence |
|---|---|---|
| **Sebastian Zachariah** | Founder / Creative Director. Specialist in interior, architecture & hospitality photography; known for styling sense and attention to detail. Credited on ArchDaily as "Photographix \| Sebastian + Ira". | [Confirmed] |
| **Ira Gosalia** | Partner; architect (Balwant Sheth School of Architecture, NMIMS). Based in Ahmedabad; leads the Gujarat region. | [Confirmed] |
| **Parth Swaminath** | Partner, South division. 10+ years in photography, video & film production; documentaries and creative collateral. | [Confirmed] |
| **Aaditya Kulkarni** | Partner (newest); has built a loyal client base. Also a designated partner on the LLP record. | [Confirmed] |
| **Maitreyi Honaver** | Designated partner on the LLP record; public-facing role unconfirmed. | [Confirmed - registry only] |

## 5. Contact & social

- **Email:** mailbox@phxindia.in (note: `.in` mail domain while the site is `.com`)
- **Phone:** +91 98331 17339
- **Address:** 1st Floor, 120 Creative Industries Premises CSL, Sundar Nagar
  Road No. 2, Kalina, Santacruz (E), Mumbai, Maharashtra 400098
- **Instagram:** [@phxindia](https://www.instagram.com/phxindia/) (~111K followers)
- **Facebook:** [/phxindia](https://www.facebook.com/phxindia/)
- **X (Twitter):** [@Phxindia](https://x.com/phxindia)
- **LinkedIn:** [PHX India Imaging Services LLP](https://in.linkedin.com/company/phx-india-imging-services-llp)

## 6. Known clients & published work (used for placeholder content)

Real, verifiable collaborations found in third-party publications:

- **Studio Lagom** — The H Cube House (Surat, 2017), Skewed House,
  Think of it! Restaurant (2018) — all published on ArchDaily with
  photography credited to "Photographix | Sebastian + Ira".
- **Spasm Design**, **The Grid Architects**, **Design Work Group**,
  **Studio Node** — collaborators listed on their Buildofy profile.
- Work syndicated on **ArchDaily**, **Archello**, **Hospitality Snapshots**,
  **Love That Design**.

## 7. Technology of the existing site

**[Inferred — WordPress.]** Signals: en-dash title separator (WordPress
default), trailing-slash page permalinks, page-per-section IA, inconsistent
hand-typed slugs (`residencial`, `motiongraphix-commercial`) typical of
manually created WP pages. Could not be confirmed via `wp-json`/headers
because the domain is unreachable from this environment.

## 8. What could NOT be verified (do this with browser access)

- Exact homepage layout, hero imagery, and copywriting.
- The complete list of photography category pages.
- The exact "Book a shoot" form fields.
- Whether videos are hosted on Vimeo or YouTube.
- Theme/fonts/colors of the current design (the rebuild is a deliberate
  redesign, so this only matters for content parity, not visual parity).

## 9. Primary sources

- https://phxindia.com/ (indexed title/snippets only)
- https://phxindia.com/about/ · /team/ · /contact/ · /photography/ ·
  /photography/architecture/ · /videography/ · /videography/residencial/ ·
  /videography/motiongraphix-commercial/ · /styling/
- https://www.zaubacorp.com/PHX-INDIA-IMAGING-SERVICES-LLP-AAE-8081
- https://www.buildofy.com/architecture-photography-firms-india/phx-india-mumbai-maharashtra
- https://www.archdaily.com/photographer/phx-india
- https://archello.com/brand/phxindia
- https://hospitalitysnapshots.com/photographer/phx-india/
- https://www.lovethatdesign.com/company/phx-india/
- https://www.instagram.com/phxindia/ · https://www.facebook.com/phxindia/ ·
  https://x.com/phxindia · https://in.linkedin.com/company/phx-india-imging-services-llp
