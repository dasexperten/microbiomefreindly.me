# Roles and gates on this portal

**As of:** 2026-09-02 · Source of each line: the seat's `CHARTER.md` in organizacia (read live, not copied here).

| Seat | Does here | Never does here |
|---|---|---|
| **Magnus Larsen** (lead, free agent) | sweeps, picks, writes EN (Greger) and RU (Komarovsky), runs `blog-writer` gates as a borrower, refutes his own numbers, briefs visuals in plain words, keeps this repo | writes outside the lane (→ Kobayashi); publishes or deploys as the final word; writes an image prompt; states a product fact without Maya; spends money |
| **Kobayashi** | owns `blog-writer`; every topic outside microbiome · probiotic · enzyme · immunity | — |
| **Jurgen Witt** | SEO brief, keyword per locale (measured, never translated), site health after launch, 301 map for the domain move | design of any kind (§4d) |
| **Julian Farah** | GEO brief, claim canon, `llms.txt` shape, answer-engine panel | design of any kind (§4d) |
| **Roberta Di Maria** | publication gate, EN register, calendar slot, `marketolog` owner, portal content go/no-go | rendering visuals |
| **Alexandra Vetrova** | RU register gate | — |
| **Marika Nowicka** | slot + exact ratio before any image; design tokens; acceptance of every frame | still generation (that is Lisa's lane) |
| **Lisa** | engine prompt + generation of preview and hero (Higgsfield only); R2 upload | static layout (Marika's lane); inventing a face |
| **Taras Ryzhiy** | motion, if a topic ever needs it | stills |
| **Maya Krasochkina** | first gate on any product fact (§4c) | — |
| **Lauda Briana** | `benefit-gate` on anything that sells; consulting section design (later phase) | — |
| **Valentina Korolyeva** | legal risk in a claim or a named competitor; origin wording | — |
| **Justina Timber** | GA4 panel for piece performance; any spend proposal | — |
| **Mina Rutunya** | Pages project, DNS, secrets, the domain move | — |
| **Owner** | money · legal signature · irreversible infra (domain move, project deletion) · the seat's clock · who appears in a hero frame | approval of routine craft (§0h: reports, not gates) |

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
