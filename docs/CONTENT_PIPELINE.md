# Content pipeline — from a paper to a page in 18 languages

**As of:** 2026-09-02 · Lead: Magnus Larsen · Law: organizacia HARD_RULES §0b · §4 · §4c · §4d · §4e-1 · §7a · §9c

```
 1 SWEEP ──► 2 PICK ──► 3 WRITE EN ──► 4 REFUTE ──► 5 GATE EN ──► 6 WRITE RU ──► 7 BRIEF
                                                                                    │
 12 PUBLISH ◄── 11 CHECK ◄── 10 TRANSLATE ◄── 9 ACCEPT ◄── 8 GENERATE (Lisa) ◄──────┘
```

| # | Step | Who | Tool / file | Done when |
|---|---|---|---|---|
| 1 | **Sweep** the registry rows (PubMed queries, RSS) | Magnus (script) | `src/sweep.mjs` → `data/sweep/<date>.json` · weekly `.github/workflows/sweep.yml` | every candidate has a registry row id and a URL that opens; a failed row is a listed gap |
| 2 | **Pick** what a wide public will find interesting | Magnus | scout pass over the sweep | ≤ 8 items per week, spread across lanes, each with one line "why" |
| 3 | **Write EN** — Greger voice: evidence first, study named, caveat out loud | Magnus (`blog-writer` borrowed from Kobayashi, `marketolog` from Roberta) | `content/<type>/<slug>/en.md` + `en.speech.md` | title 50–70 · meta 120–160 · answer ≤ 60 words · every number `[sN]` · three hook variants scored |
| 4 | **Refute** — an adversarial reader tries to break every number against its source | independent checker | edits the file; `gates.factCheck = "verified <date> — …"` | unsourced numbers removed, mis-stated findings corrected, taxonomy checked against NCBI |
| 5 | **Gate EN** — marketolog hook lock + segment-check (8 fixed readers) | Magnus | `organizacia/SKILLS/segment-check/SKILL.md`; `gates.segmentCheck` | PASS (7–8/8) or "PASS с оговоркой" (6/8); REWORK/FAIL is rewritten in the same register, never simplified away |
| 6 | **Write RU** — Komarovsky voice, same facts and sources, own segment-check | Magnus | `ru.md` + `ru.speech.md` | native Russian, no calques, PASS recorded |
| 7 | **Brief** the two images in plain words | Magnus | `image-brief.md` (template in `docs/BRAND_IMAGE_SPEC.md` §5) | organism morphology named, hero scene named, REF named or asked for; **no prompt** |
| 8 | **Generate** preview (3:2, macro, no people) + hero (16:9, one house character from R2 `refs/characters/`) | Lisa (Higgsfield only, §4b) | R2 `dasexperten-images/mbf/<type>/<slug>/<slug>-preview.webp`, `-hero.webp`, `-og.jpg` | both files on R2, ratio born native, never cropped from the other |
| 9 | **Accept** | Marika | checklist in `docs/BRAND_IMAGE_SPEC.md` §3 | URLs written into `images.preview` / `images.hero` (+ alt texts) |
| 10 | **Translate** into the other 16 locales | Magnus with Jurgen's keyword per locale | `<lang>.md` per locale; slug policy `docs/SEO_BRIEF.md` §1.2 | a locale file exists only when it is really written; the keyword is measured in that locale, never translated (§7a) — ja/ko have no measurement on file yet |
| 11 | **Check** | script | `npm run build && npm run check` | 0 FAIL |
| 12 | **Publish** | Roberta (EN register, go), Alexandra (RU register) → push → deploy from `main` | `gates.register`, `status: published`, `tools/deploy.sh` | live URL opens and matches the tree |

**Product referrals** (none in the seed batch): only after Maya's consult line (`referral.mayaLog`) and a `benefit-gate` PASS line, one natural link, after the mechanism, never in the first half (Magnus CHARTER MB4, LEARNING MG-LAW-260902-03).

**What the machine does and what it does not.** Scripts sweep, build, check and deploy. Writing, refuting, gating and briefing are seat work — run in this session as an orchestrated workflow (one agent per article per step, Magnus's VOICE and laws loaded in each), recorded in the file's `gates.*` fields so the next session can see what passed.

**Seed batch of 2026-09-02:** 17 bacteria pages (6 phyla · 2 genera · 9 species) + 8 news items from the day's PubMed sweep + 7 topic hubs, EN + RU. Other locales: chrome only until their files exist.
