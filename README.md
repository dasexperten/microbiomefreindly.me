# microbiomefriendly.me — the portal

**What this repo is.** The single source of truth (SSOT) for the **Microbiome Friendly news portal**: a multilingual site that finds interesting microbiome, probiotic, enzyme and immunity science, rewrites it for a wide public, and keeps a plain-words **bacteria encyclopedia** (phyla, genera, species — what each one does for you and against you). Built as a static site, deployed to **Cloudflare Pages**, later moved onto the live domain **microbiomefriendly.me** (today a product brand site, EN + `/ru/`, source in `das-architektura/PROJECTS/microbiomefriendly`).

**Owner brief (2026-09-02):** portal first on Cloudflare, then the domain; 18 languages (the 16 of dasexperten.com + Japanese + Korean); generated images per topic; SEO/GEO wording with Jurgen and Julian; later phases: consulting (Lauda · Roberta · Alexandra) and a products section.

**Images — three per topic (Owner 2026-09-16).** The topic leads with a **character card**: a real person from the REF library, and the reader's own question — 3–6 words — set into the frame's own empty air, in that page's language. It is the feed card, the article's first image and the social image. The **macro world** (Lisa, no people) and the **3D scientific infographic** (Otto, no people) keep their accepted pixels and now sit *inside* the article, the infographic carrying three numbered beats on a band of brand paper composed beneath it. Every frame is generated text-free; every word is set afterwards by code, per language. *(Earlier that day the lane was two images and no people at all; the Owner changed it in the same day, and both decisions are dated in `docs/BRAND_IMAGE_SPEC.md`.)*

**Lead seat:** Magnus Larsen (`magnus-larsen`, `biome@dasexperten.com`) — writes, sweeps, briefs. Org law and roster: [dasexperten/organizacia](https://github.com/dasexperten/organizacia) (`HARD_RULES.md`, `agents/magnus-larsen/CHARTER.md`). See [AGENTS.md](./AGENTS.md) for the session protocol.

---

## Browse the repo

| Path | What you find there |
|---|---|
| [`content/`](./content/) | **The articles.** One folder per article, one Markdown file per language (`en.md`, `ru.md`, …), plus `<lang>.speech.md` (read-aloud version), `image-brief.md` (Magnus's plain-words brief for Brand Studio) and `overlay.json` (the empty field measured on the accepted card master — written by the tool, never by hand). `news/` · `bacteria/` · `hubs/` · `sources/registry.json` (the only allowed scrape list) |
| [`docs/CONTENT_SCHEMA.md`](./docs/CONTENT_SCHEMA.md) | The article file format: front-matter fields, gates, sources, images, referral rules |
| [`docs/CONTENT_PIPELINE.md`](./docs/CONTENT_PIPELINE.md) | Sweep → pick → write → refute → gate → RU → brief → images → translate → publish. Who holds each gate |
| [`docs/SEO_BRIEF.md`](./docs/SEO_BRIEF.md) | Jurgen Witt — URLs, hreflang, titles, JSON-LD, keyword-per-locale law, 10-line checklist |
| [`docs/GEO_BRIEF.md`](./docs/GEO_BRIEF.md) | Julian Farah — answer-engine citability, entity strategy, `llms.txt`, claim discipline, per-locale engines |
| [`docs/IMAGE_PROMPT.md`](./docs/IMAGE_PROMPT.md) | The one-paragraph image prompt, filled per article — character card and macro world by Lisa, 3D infographic by Otto, checked by Marika |
| [`docs/BRAND_IMAGE_SPEC.md`](./docs/BRAND_IMAGE_SPEC.md) | Marika Nowicka — the image slots (card 3:2 · macro world 3:2 · plate 4:3 · og 1.91:1), R2 paths, visual language, acceptance checklist, Magnus→Brand Studio brief template |
| [`docs/CASTING_CARDS_2026-09-16.md`](./docs/CASTING_CARDS_2026-09-16.md) | The cast: which REF face stands in which topic's card, one distinct face per topic, each file verified live |
| [`tools/plates/`](./tools/plates/) | The typesetting lane: `make-prompts.mjs` (engine task) · `run-cards.sh` (generation) · `measure.py` (proves the empty field) · `make-lines.mjs` (collects the words) · `build.py` (sets them) |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | How the site is built and served; locales; what lives on Cloudflare |
| [`docs/DEPLOY.md`](./docs/DEPLOY.md) | Deploy only from `origin/main`; the exact commands; how to verify live |
| [`docs/ROLES_AND_GATES.md`](./docs/ROLES_AND_GATES.md) | Which seat does what on this portal, and what each one never does |
| [`docs/LOCALES.md`](./docs/LOCALES.md) | The 18 locales, codes, priority order, what exists per locale |
| [`src/build.mjs`](./src/build.mjs) | The static site generator (`npm run build` → `dist/`) |
| [`src/check.mjs`](./src/check.mjs) | The pre-publish gate a script can run (`npm run check`) |
| [`src/sweep.mjs`](./src/sweep.mjs) | The news sweep: PubMed + RSS from the registry → `data/sweep/<date>.json` |
| [`src/i18n/`](./src/i18n/) | `locales.json` (codes, direction, order) · `ui.json` (interface strings, all 18 locales) |
| [`src/assets/`](./src/assets/) | Stylesheet (brand tokens of microbiomefriendly.me), logo, favicon |
| [`data/sweep/`](./data/sweep/) | Dated sweep results — candidates with their named source; nothing here is prose |
| [`tools/deploy.sh`](./tools/deploy.sh) | Build + check + `wrangler pages deploy` from a tree identical to `origin/main` |
| [`.github/workflows/`](./.github/workflows/) | `build-check` on every push/PR (deploys from `main` when the token secret exists) · `sweep` weekly → PR |

## Run it

```bash
npm install
npm run build          # → dist/   (PORTAL_ORIGIN=https://… to change the canonical host)
npm run check          # gate: exits 1 on any FAIL
npm run serve          # local preview on http://localhost:4321
INCLUDE_REVIEW=1 npm run build   # preview drafts that have not passed the gates yet
npm run sweep          # MB2 sweep → data/sweep/<today>.json
npm run deploy         # only from a clean checkout equal to origin/main (docs/DEPLOY.md)
```

## Live

| Surface | Where | State |
|---|---|---|
| Portal (this repo) | **`https://microbiomefriendly.me`** + `www` — Cloudflare Pages project `microbiomefriendly-portal` (also at `microbiomefriendly-portal.pages.dev`) | live on the domain since 2026-09-03 |
| Product site (formulas) | `https://formulas.microbiomefriendly.me` (EN + `/ru/`) — Pages project `microbiomefriendly`, source `das-architektura/PROJECTS/microbiomefriendly/public` | moved off the apex on 2026-09-03 when the portal took it; untouched by this repo |
| Redirects from the old brand URLs | `/products`, `/quiz`, `/akkermansia`, `/glp1`, `/standard`, `/strains`, `/akkermagic`, `/faq`, `/terms`, `/privacy` → the same path on `formulas.` | in `dist/_redirects`, generated by the build |

## Laws that shape every file here

- **Facts only.** A number without a named, reachable source is removed, not softened (organizacia HARD_RULES §0b). Every article ends with a generated Sources list; every number in the body carries a `[sN]` marker.
- **Product facts go through Maya first** (§4c); a product is mentioned at most once, after the mechanism, never in the first half, and only after `benefit-gate` (Magnus CHARTER). The seed batch carries no product mentions.
- **Write the typed word** (§7a): keywords are measured per locale, never translated. Where nothing is measured (ja, ko today) the page says so in its brief and is written to best understanding.
- **hreflang honesty:** only locales whose file exists are declared. Empty locales get a chrome page that says the articles are being prepared.
- **Images:** Magnus describes in plain words → Marika names slot, ratio, focus and the empty field → Lisa (character card, macro world) and Otto (3D infographic) write their own engine words and generate → Otto measures the field and sets every word by code, per language → Marika accepts the frame, then the live page. **No engine ever writes a letter**, no shape is invented behind a line of type (§4k), no face is invented — a person in a frame comes from `refs/characters/` on R2 or the frame is not made (§4, §4b, §4d, §4e-1a, §4e-2, §4e-3, §4f). No product or brand mark in any frame.
- **Typography:** no positive letter-spacing, numbers never split from their unit, no monospace numbers, IBM Plex Mono never (§4h, §4h-2).
- **GitHub-first, deploy from `main` only** (§0, §8.1). Done means the commit is on `origin/main` and, when live is needed, the live page shows it.
