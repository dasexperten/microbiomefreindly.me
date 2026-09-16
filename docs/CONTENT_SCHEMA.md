# Content schema — how an article file is written

**As of:** 2026-09-02 · `images:` block rewritten 2026-09-16 · Owner of the format: Magnus Larsen (`magnus-larsen`) · Law behind it: organizacia `HARD_RULES.md` §0b (facts only), §4c (product facts via Maya), §7a (write the typed word), §9c (dated sources).

One article = one folder. One language = one Markdown file inside it. The build (`src/build.mjs`) turns every file into a page; a language file that does not exist is simply not published and not declared in hreflang.

```
content/
  news/<slug>/            news item rewritten from a named source
    en.md  ru.md  de.md …  one file per locale, same slug for every locale
    image-brief.md         Magnus's plain-words brief for Brand Studio (Marika → Lisa → Otto)
    overlay.json           the empty field measured on the accepted card master — written by tools/plates/measure.py, never by hand
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
images:                                                  # three images per topic (Owner 2026-09-16, second decision of that day)
  card: "…-card-en.webp"                                 # per locale — Lisa's character frame with the question set into it by code
  cardLine: "Can three days reset it?"                   # per locale — the exact words baked into that frame, 3–6 words
  cardAlt: "…"                                           # per locale — ≤ 125 chars, must contain cardLine verbatim
  og: "…-og-en.jpg"                                      # per locale — the centre band of the card master, question re-set at its own size
  preview: ""                                            # the macro world (Lisa, no people, no words) — unchanged file, now shown inside the body
  previewAlt: "…"
  plate: "…-plate-en.webp"                               # per locale — the accepted hero + a band of paper carrying three numbered beats
  plateLines: "first · second · third"                   # per locale — the three beats set on that band, separated by ` · `
  hero: ""                                               # unchanged, text-free master of record — the plate is built from it, it is not served alone
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

Plain words from Magnus to Brand Studio — the fields are in `docs/BRAND_IMAGE_SPEC.md` (Marika). Magnus never writes an engine prompt (§4e-1); Otto writes the infographic's, Lisa the macro world's and the character frame's, each generates; Marika accepts; the URLs then go into the `images:` block above.

Since **Owner 2026-09-16** every brief also carries the character card, in the same plain words:

| Field | What it says |
|---|---|
| `Card (Lisa · person)` | who stands in the frame — a named file from the REF library `refs/characters/` on R2, cast in `docs/CASTING_CARDS_2026-09-16.md`. Magnus Larsen is never cast: he is the author, not a model |
| `Card scene` | the one moment, in a sentence |
| `Wardrobe and place` | what she wears and where she is |
| `EMPTY FIELD` | which third of the frame stays calm, so the question has real air to sit in. It must name a **plain pale plane** — a wall, a door, a sky. Never a textured surface (fence boards, tile joints): the letters die in the texture and the frame comes back for a reshoot |
| `- en/ru card question:` | the question, 3–6 words, per locale — the words that will be baked |
| `- en/ru card alt:` | the alt text, per locale, ≤ 125 chars, containing the question verbatim |
| `- en/ru plate lines:` | the three beats of the infographic band, per locale, separated by ` · ` |

The words in the brief are the only source: `tools/plates/make-lines.mjs` carries them to the typesetter and `tools/alt-check.mjs` reads the same lines, so the pixels and the alt text cannot drift apart.

## Sections (Owner 2026-09-04)

Five article types now share this schema, the same gates and the same three images (two until **Owner 2026-09-16**, when the character card was added and the other two moved into the body):

| `type` | Folder | What it is | URL |
|---|---|---|---|
| `news` | `content/news/` | a paper rewritten for a wide public, source named | `/news/<slug>` |
| `bacteria` | `content/bacteria/` | encyclopedia entry, advantages and disadvantages | `/bacteria/<slug>` |
| `ask` | `content/ask/` | **Ask Magnus** — one reader question answered by name, opening by restating the question | `/ask/<slug>` |
| `myth` | `content/myth/` | **Myth check** — one claim tested, with an explicit verdict near the top: false, partly true, or true | `/myth/<slug>` |
| `routine` | `content/routine/` | **Food & routine** — what to do on a Tuesday, mechanism first and the action second | `/routine/<slug>` |
| `hubs` | `content/hubs/` | topic hub | `/topics/<topic>/` |

**Evidence** (`/evidence/`) is not an article type and has no folder. The build generates it from `data/sweep/*.json`: every paper the weekly sweep found, which ones became articles, which ones we passed over, and any registry row that failed to answer. It cannot drift from what really happened, because nobody writes it.
