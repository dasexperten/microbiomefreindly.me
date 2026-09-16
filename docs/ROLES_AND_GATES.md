# Roles and gates on this portal

**As of:** 2026-09-02 · Brand Studio rows and the image gates rewritten 2026-09-16 · Source of each line: the seat's `CHARTER.md` in organizacia (read live, not copied here).

| Seat | Does here | Never does here |
|---|---|---|
| **Magnus Larsen** (lead, free agent) | sweeps, picks, writes EN (Greger) and RU (Komarovsky), runs `blog-writer` gates as a borrower, refutes his own numbers, briefs visuals in plain words, keeps this repo | writes outside the lane (→ Kobayashi); publishes or deploys as the final word; writes an image prompt; states a product fact without Maya; spends money |
| **Kobayashi** | owns `blog-writer`; every topic outside microbiome · probiotic · enzyme · immunity | — |
| **Jurgen Witt** | SEO brief, keyword per locale (measured, never translated), site health after launch, 301 map for the domain move | design of any kind (§4d) |
| **Julian Farah** | GEO brief, claim canon, `llms.txt` shape, answer-engine panel | design of any kind (§4d) |
| **Roberta Di Maria** | publication gate, EN register, calendar slot, `marketolog` owner, portal content go/no-go | rendering visuals |
| **Alexandra Vetrova** | RU register gate | — |
| **Marika Nowicka** | slot + exact ratio before any image; **the empty field the words will sit in**, named per topic before generation; design tokens; acceptance of every frame, then of the live page at 1440 and 390 px | still generation (that is Lisa's lane) |
| **Otto Zuckerman** | infographic master: 16:9 3D scientific infographic, no people — his own engine words (§4e-1a), platform-native engine, not Higgsfield. **Every word on every surface** (Owner 2026-09-16): the question on card and og, the three beats on the plate band — measured, set by code, per language | a living person or a shot scene (Lisa's); accepting his own frame; asking an engine for a letter; a shape invented behind a line of type (§4k) |
| **Lisa** | macro-world master: 3:2 micro-world, shot-looking, no people — platform-native engine, not Higgsfield. **Character card master** (Owner 2026-09-16): 3:2, a real person from `refs/characters/`, identity-locked on Higgsfield (§4b · §4e-3), one generation per topic (§4e-2), text-free; her own engine words; R2 upload | static layout (Marika's lane); built imagery (Otto's); **inventing a face** — the face comes from the REF or the frame is not made; casting Magnus Larsen, who is the author, not a model |
| **Taras Ryzhiy** | motion, if a topic ever needs it | stills |
| **Maya Krasochkina** | first gate on any product fact (§4c) | — |
| **Lauda Briana** | `benefit-gate` on anything that sells; consulting section design (later phase) | — |
| **Valentina Korolyeva** | legal risk in a claim or a named competitor; origin wording | — |
| **Justina Timber** | GA4 panel for piece performance; any spend proposal | — |
| **Mina Rutunya** | Pages project, DNS, secrets, the domain move | — |
| **Owner** | money · legal signature · irreversible infra (domain move, project deletion) · the seat's clock · who appears in a frame at all, and who may not (Magnus Larsen, 2026-09-16) | approval of routine craft (§0h: reports, not gates) |

## The gates in the file

Every article carries its gates in front-matter (`docs/CONTENT_SCHEMA.md`):

| Field | Set by | Meaning |
|---|---|---|
| `gates.marketolog` | Magnus | three title variants of three hook types were scored; the chosen type is named |
| `gates.factCheck` | independent refuter | every number traced to its source; count removed / corrected |
| `gates.segmentCheck` | Magnus (skill: `segment-check`) | PASS 7–8/8 · PASS с оговоркой 6/8 · REWORK · FAIL — only PASS publishes |
| `gates.register` | Roberta (EN) · Alexandra (RU) | "pending …" until the seat has read it; then their line |
| `referral.mayaLog` · `referral.benefitGate` | Maya · Lauda | required whenever `referral.product` is set |
| `status` | Magnus after the gates; Roberta's go for the portal as a whole | only `published` is built |

`src/check.mjs` refuses to pass a `published` file whose segment-check is not PASS or whose fact-check is not verified.

## The image gates in the script (Owner 2026-09-16)

All six content types are read (`news` · `bacteria` · `ask` · `myth` · `routine` · `hubs` — the last three were ungated until this date). On top of the content gates, `src/check.mjs` fails the build when:

| Gate | Why it exists |
|---|---|
| `images.card` does not end in this page's own locale | a Russian page must not show the English question |
| `images.card` without `cardLine`, or `cardAlt` that does not repeat `cardLine` verbatim | the alt text and the pixels are one statement, or they are a lie to a screen reader |
| `cardAlt` longer than 125 chars | it is read aloud |
| the question is not 3–6 words (non-CJK), or repeats the title word for word | the card and the headline must not say the same thing twice |
| `images.plate` without `plateLines`, or not this locale's file | the band's words are the page's words |
| any `/assets/img/…` URL is not on disk, or has no `@2x` sibling | a `srcset` that 404s is invisible to every other gate |
| a `<div>` inside `.prose`, or more than one lead figure | the NBSP scan is balanced-tag, and a second lead means the layout slipped |

`tools/alt-check.mjs` runs beside it and fails when a live locale is missing its own card line, card alt or three band lines.
