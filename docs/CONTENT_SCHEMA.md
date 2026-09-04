# Content schema — how an article file is written

**As of:** 2026-09-02 · Owner of the format: Magnus Larsen (`magnus-larsen`) · Law behind it: organizacia `HARD_RULES.md` §0b (facts only), §4c (product facts via Maya), §7a (write the typed word), §9c (dated sources).

One article = one folder. One language = one Markdown file inside it. The build (`src/build.mjs`) turns every file into a page; a language file that does not exist is simply not published and not declared in hreflang.

```
content/
  news/<slug>/            news item rewritten from a named source
    en.md  ru.md  de.md …  one file per locale, same slug for every locale
    image-brief.md         Magnus's plain-words brief for Brand Studio (Marika → Lisa)
  bacteria/<slug>/        encyclopedia entry (phylum · genus · species)
    en.md  ru.md …
    image-brief.md
  hubs/<topic>/           topic hub page (gut · oral · immunity · enzymes · metabolic · skin · brain)
    en.md  ru.md …
  sources/registry.json   the sweep registry — only rows here may be scraped (§0b)
```

Locale codes (file names): `en ar de es fr ms pl pt-BR ro ru th tl tr uk vi zh-Hans ja ko` — the 16 of dasexperten.com plus `ja` and `ko` (Owner 2026-09-02). `en` is the root and `x-default`.

## Front-matter (YAML between `---` lines)

```yaml
title: "The 1 % microbe your metabolism answers to"     # Search Title, 50–70 chars
meta: "…"                                                # Meta Description, 120–160 chars
kicker: "Akkermansia"                                    # short section label shown above H1
type: news | bacteria | hub
topic: gut | oral | immunity | enzymes | metabolic | skin | brain
lang: en
slug: akkermansia-glp1-pilot                             # equals the folder name
date: 2026-09-02                                         # publication date
asOf: 2026-09-02                                         # §9c — the date the facts were checked
author: magnus-larsen
voice: greger | komarovsky                               # EN = Michael Greger cadence · RU = Dr. Komarovsky (charter DOES 2)
answer: "≤ 60 words that answer the headline directly."  # GEO answer-first paragraph, rendered under H1
keyFacts:                                                # every fact carries a source id from `sources`
  - fact: "…"
    source: s1
faq:
  - q: "…"
    a: "…"
sources:                                                 # a number without a row here is removed (§0b)
  - id: s1
    name: "Depommier C. et al., Nature Medicine, 2019"
    url: "https://doi.org/10.1038/s41591-019-0495-2"
    doi: "10.1038/s41591-019-0495-2"
    pmid: "31263284"
entity:                                                  # bacteria pages only
  latin: "Akkermansia muciniphila"
  rank: species
  synonyms: ["Verrucomicrobia"]
  wikidata: "Q…"                                         # leave empty if not verified — never invent
  ncbiTaxId: "239935"
images:
  preview: ""                                            # R2 public URL of the preview (macro / "zoomed") image — filled by Lisa after Marika accepts
  hero: ""                                               # R2 public URL of the hero with a house character REF
  previewAlt: "…"
  heroAlt: "…"
referral:                                                # at most one product mention, after the mechanism, never in the first half
  product: ""                                            # empty = no referral in this piece (honest "no mention")
  mayaLog: ""                                            # line id in the Maya consult log (MB3) — required when product is set
  benefitGate: ""                                        # PASS line id — required when product is set
gates:
  marketolog: "3 variants scored — chosen: <type>"
  segmentCheck: "PASS 7/8"                               # PASS · PASS с оговоркой · REWORK · FAIL — REWORK/FAIL are not published
  factCheck: "verified 2026-09-02 — every number traced"
  register: "pending Roberta (EN)"                       # EN → Roberta · RU → Alexandra Vetrova; portal go/no-go → Roberta
status: draft | review | published                       # only `published` is built into the site
```

## Body

Markdown after the front-matter. Rules:

- One H1 is generated from `title` — do **not** write `#` in the body. Use `##` and `###`.
- The first paragraph of the body is the story; the `answer` field already gave the direct answer.
- A number is followed by its source marker `[s1]`; the build turns it into a footnote link.
- Product referral: only where `referral.product` is set, only after the mechanism, only in the second half, as one natural link.
- End with `## Sources` generated automatically — do not write it by hand.
- Numbers never split from their unit: write `4 × 10¹⁰ CFU` with a non-breaking space; the build enforces `white-space: nowrap` on `.num`.

## Speech version

`<lang>.speech.md` next to the article — the fourth mandatory section of `blog-writer` (Search Title · Meta · Body · Speech-optimized version). Plain text, no headings, read-aloud rhythm. It is not built into HTML; it ships with the piece to Roberta.

## Image brief (`image-brief.md`)

Plain words from Magnus to Brand Studio — the fields are in `docs/BRAND_IMAGE_SPEC.md` (Marika). Magnus never writes an engine prompt (§4e-1); Lisa writes it and generates; Marika accepts; the two R2 URLs then go into `images.preview` / `images.hero`.

## Sections (Owner 2026-09-04)

Five article types now share this schema, the same gates and the same two images:

| `type` | Folder | What it is | URL |
|---|---|---|---|
| `news` | `content/news/` | a paper rewritten for a wide public, source named | `/news/<slug>` |
| `bacteria` | `content/bacteria/` | encyclopedia entry, advantages and disadvantages | `/bacteria/<slug>` |
| `ask` | `content/ask/` | **Ask Magnus** — one reader question answered by name, opening by restating the question | `/ask/<slug>` |
| `myth` | `content/myth/` | **Myth check** — one claim tested, with an explicit verdict near the top: false, partly true, or true | `/myth/<slug>` |
| `routine` | `content/routine/` | **Food & routine** — what to do on a Tuesday, mechanism first and the action second | `/routine/<slug>` |
| `hubs` | `content/hubs/` | topic hub | `/topics/<topic>/` |

**Evidence** (`/evidence/`) is not an article type and has no folder. The build generates it from `data/sweep/*.json`: every paper the weekly sweep found, which ones became articles, which ones we passed over, and any registry row that failed to answer. It cannot drift from what really happened, because nobody writes it.
