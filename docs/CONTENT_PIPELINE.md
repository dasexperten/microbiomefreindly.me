# Content pipeline — from a paper to a page in 18 languages

**As of:** 2026-09-02 · image steps 7–9 rewritten 2026-09-16 · Lead: Magnus Larsen · Law: organizacia HARD_RULES §0b · §4 · §4b · §4c · §4d · §4e-1 · §4e-2 · §4e-3 · §4h · §4k · §7a · §9c

```
 1 SWEEP ──► 2 PICK ──► 3 WRITE EN ──► 4 REFUTE ──► 5 GATE EN ──► 6 WRITE RU ──► 7 BRIEF
                                                                                    │
 12 PUBLISH ◄── 11 CHECK ◄── 10 TRANSLATE ◄── 9 ACCEPT ◄── 8 GENERATE · MEASURE · SET ◄────┘
```

| # | Step | Who | Tool / file | Done when |
|---|---|---|---|---|
| 1 | **Sweep** the registry rows (PubMed queries, RSS) | Magnus (script) | `src/sweep.mjs` → `data/sweep/<date>.json` · weekly `.github/workflows/sweep.yml` | every candidate has a registry row id and a URL that opens; a failed row is a listed gap |
| 2 | **Pick** what a wide public will find interesting | Magnus | scout pass over the sweep | ≤ 8 items per week, spread across lanes, each with one line "why" |
| 3 | **Write EN** — Greger voice: evidence first, study named, caveat out loud | Magnus (`blog-writer` borrowed from Kobayashi, `marketolog` from Roberta) | `content/<type>/<slug>/en.md` + `en.speech.md` | title 50–70 · meta 120–160 · answer ≤ 60 words · every number `[sN]` · three hook variants scored |
| 4 | **Refute** — an adversarial reader tries to break every number against its source | independent checker | edits the file; `gates.factCheck = "verified <date> — …"` | unsourced numbers removed, mis-stated findings corrected, taxonomy checked against NCBI |
| 5 | **Gate EN** — marketolog hook lock + segment-check (8 fixed readers) | Magnus | `organizacia/SKILLS/segment-check/SKILL.md`; `gates.segmentCheck` | PASS (7–8/8) or "PASS с оговоркой" (6/8); REWORK/FAIL is rewritten in the same register, never simplified away |
| 6 | **Write RU** — Komarovsky voice, same facts and sources, own segment-check | Magnus | `ru.md` + `ru.speech.md` | native Russian, no calques, PASS recorded |
| 7 | **Brief** the three images in plain words | Magnus | `image-brief.md` (template in `docs/BRAND_IMAGE_SPEC.md` §5) | organism morphology named; infographic mechanism + three beats + one sourced number named (or the number dropped); the character card's person, scene, wardrobe and **empty field** named; the question and the three band lines written per locale; **no prompt** |
| 8 | **Generate**, every frame text-free | Lisa (character card, macro world) · Otto (infographic) | cards: Higgsfield `nano_banana_2`, REF as image input (§4b · §4e-3), `tools/plates/make-prompts.mjs` → `tools/plates/run-cards.sh`; macro world and infographic: platform-native engine, not Higgsfield | one generation per topic (§4e-2); the REF face unchanged; not a letter anywhere in any frame |
| 8a | **Measure** the empty field on the accepted card master | Otto | `tools/plates/measure.py` → `content/<type>/<slug>/overlay.json` | worst-2 % contrast ≥ 3.0:1, luminance std ≤ 26/255, gradient ≤ 7/255, box inside the middle 1.91:1 band. No field → the frame is reshot; the type is never shrunk to rescue a bad frame, and no shape is ever drawn behind it (§4k) |
| 8b | **Set the words** by code, per language | Otto | `tools/plates/make-lines.mjs` → `data/plates/lines.json` → `tools/plates/build.py` (Pillow · Nunito variable, OFL) | question on card and og; three numbered beats on the plate band; glyph coverage checked before a line is set; zero tracking (§4h); a number never split from its unit (§4h-2) |
| 8c | **Derive and upload** | Lisa | `tools/images.mjs --rendered` → `tools/r2-upload.sh` | slot files on R2 `dasexperten-images/mbf/<type>/<slug>/` — `-card-<lang>.webp` (+`@2x`), `-og-<lang>.jpg`, `-preview.webp`, `-plate-<lang>.webp` (+`@2x`), `-hero.webp`, `-thumb.webp` |
| 9 | **Accept** | Marika | checklist in `docs/BRAND_IMAGE_SPEC.md` §3 | identity matches the REF; the whole person and the whole line inside the middle 1.91:1 band; the words in real air; then the **live** page at 1440 and 390 px and a contact sheet of every card, so no face or world repeats on one feed. URLs wired by `tools/apply-images.mjs --local`, which merges and never erases an accepted key |
| 10 | **Translate** into the other 16 locales | Magnus with Jurgen's keyword per locale | `<lang>.md` per locale; slug policy `docs/SEO_BRIEF.md` §1.2 | a locale file exists only when it is really written; the keyword is measured in that locale, never translated (§7a) — ja/ko have no measurement on file yet |
| 11 | **Check** | script | `npm run build && npm run check` | 0 FAIL |
| 12 | **Publish** | Roberta (EN register, go), Alexandra (RU register) → push → deploy from `main` | `gates.register`, `status: published`, `tools/deploy.sh` | live URL opens and matches the tree |

**Three images, one law about words (Owner 2026-09-16).** The topic leads with Lisa's **character card** — a real person, the reader's own question set into the frame's own empty air. The **macro world** and the **infographic** keep their accepted pixels and move into the body of the article. The engine never writes a letter; every word is drawn afterwards by code, so a wrong word is a one-line fix and a new language costs no generation. The infographic's explanation is a band of brand paper composed **under** the frame, not type laid over the art: measured across the 44 accepted infographics, almost none had a calm field legible enough to hold a line, so type inside them would never have been honest — and no accepted frame was regenerated to make room.

**Open on this lane today.** Only `en` and `ru` are set. `ja`, `ko`, `ar` and `th` cannot be typeset on this machine — Pillow has FreeType but not raqm, so Arabic and Thai are never shaped — and they wait for Otto's headless-Chrome path. The RU register gate (Alexandra Vetrova) has not yet been passed on the baked lines.

**Product referrals** (none in the seed batch): only after Maya's consult line (`referral.mayaLog`) and a `benefit-gate` PASS line, one natural link, after the mechanism, never in the first half (Magnus CHARTER MB4, LEARNING MG-LAW-260902-03).

**What the machine does and what it does not.** Scripts sweep, build, check and deploy. Writing, refuting, gating and briefing are seat work — run in this session as an orchestrated workflow (one agent per article per step, Magnus's VOICE and laws loaded in each), recorded in the file's `gates.*` fields so the next session can see what passed.

**Seed batch of 2026-09-02:** 17 bacteria pages (6 phyla · 2 genera · 9 species) + 8 news items from the day's PubMed sweep + 7 topic hubs, EN + RU. Other locales: chrome only until their files exist.
