# BRAND IMAGE SPEC — microbiomefriendly.me · slots, proportions, acceptance

**Who:** Marika Nowicka — head of Brand Studio · **For:** Magnus Larsen (briefs), Otto Zuckerman (hero), Lisa (preview), Mina (deploy)
**Why:** Owner brief 2026-09-02 — two images per topic: a *preview* (micro-world, no people) and a *hero*. **Owner 2026-09-16, morning — the lane is settled:** the hero is **Otto Zuckerman's 3D scientific infographic, no people** (built imagery is Otto's since 2026-09-05, §4d); the preview is **Lisa's macro world**. **Owner 2026-09-16, same day, second word — the shape changed again, and this is the live one:** every topic now leads with a **character card** — a real person from `refs/characters/`, Lisa's frame, carrying **the topic's question in each language, set into the frame by code**. The two frames above keep every pixel and **move into the body of the article**. Three images per topic, not two. The character hero of 2026-09-02 is therefore not withdrawn any more; it is back, as the card, under REF law.
**Law:** HARD_RULES §4 · §4b · §4d · §4e · §4e-1 · §4f · §4h · §4h-2 · §4i. This file is the slot brief. Until the slot and the ratio below are named, nothing is generated (§4f · §4e-1).

I looked first. Below is the place and the proportion for every image the portal will carry. One surface — one slot — one native ratio. A frame is born in its ratio; it is never stretched or cropped into a neighbour's frame.

---

## 1. Slots and proportions

The portal is one brand with one card grid, so every article and every encyclopedia entry takes the same three masters. **Two of the four served slots are per language**, because they carry words in their pixels: the card and the plate. The other files are one set for all locales, and only `alt` changes.

| Slot | Where on the page | Ratio | 1x | 2x | Weight cap (webp) | Format | File |
|---|---|---|---|---|---|---|---|
| **Character card** | `.card-cover` in the feed; `.article-card` at the top of the article, directly under H1 and lead | **3:2** | **720×480** | **1440×960** | 1x ≤ 110 KB · 2x ≤ 220 KB | webp | `<slug>-card-<lang>.webp` · `-card-<lang>@2x.webp` |
| **og:image** | `<meta property="og:image">` + twitter card | **1.91:1** | **1200×630** | — | ≤ 280 KB | **jpg only** (scrapers do not read webp reliably) | `<slug>-og-<lang>.jpg` |
| **Macro world** | `figure.figworld` **inside the article body**, before the 2nd `## ` | **3:2** | **720×480** | **1440×960** | 1x ≤ 110 KB · 2x ≤ 220 KB | webp + jpg fallback | `<slug>-preview.webp` · `-preview@2x.webp` · `-preview.jpg` |
| **Infographic plate** | `figure.figplate--band` **inside the article body**, before the 4th `## ` | **4:3** | **1200×900** | **2400×1800** | 1x ≤ 170 KB · 2x ≤ 340 KB | webp | `<slug>-plate-<lang>.webp` · `-plate-<lang>@2x.webp` |
| **Thumb** | related-articles rail, encyclopedia index rows, search results | 3:2 | 360×240 | 720×480 | ≤ 40 KB | webp | `<slug>-thumb.webp` |
| **Hero, master of record** | not served on the page any more; the plate is built from it | 16:9 | 1200×675 | 2400×1350 | — | webp + jpg | `<slug>-hero.webp` · `-hero@2x.webp` · `-hero.jpg` |

**The fallback chain in `src/build.mjs`, so that a topic without a card still renders exactly as it did:**

```
top image    = images.card || images.preview
in-body 3:2  = images.preview,  only when images.card exists
in-body 4:3  = images.plate || images.hero
og           = images.og || images.card || images.preview
```

**Masters, born native:** card **3:2 at 1440×960** — **Lisa**, engine **Higgsfield `nano_banana_2`** with the R2 REF as image input, because identity lock is the whole point of that frame (§4b · §4e-3); preview **3:2 at 1440×960** — **Lisa**; hero **16:9 at 2400×1350** — **Otto**. For the two text-free, people-free masters the engine is platform-native generation (Codex `$imagegen` or Grok `/imagine`), **not Higgsfield** (Owner 2026-09-16, morning). Where the engine only renders sizes on its own grid, it renders the same ratio exactly and `tools/images.mjs` scales to the master size — scale, never crop. Everything in the table is a *resize* of its own master, never a crop — with one exception, named aloud:

- **og:image is the centre band of the card master** (1440×960 → 1440×754 → 1200×630), and now there *is* a body in that frame. The condition is therefore stricter, not waived: the person's head and shoulders sit inside the **middle 1.91:1 band** and the empty field does too, so the band crop loses only air and never slices a face. **The words are set after the crop, at the band's own size** — baked type is never resized into a second surface, because a 1440-wide line scaled to 1200 is a line nobody measured.
- **The plate is the accepted hero plus a composed band, not a crop of it** — the 16:9 master keeps every pixel at the top of a 4:3 sheet, and 450 px of brand paper are added underneath. Nothing is painted over the art.
- The hero is **never** the source of the preview, and the preview is never the source of the hero. Three masters, three worlds (Owner 2026-09-02, Lisa `LZ-MEM-260902-01`).

**CSS canon.** `.card-cover{aspect-ratio:3/2;overflow:hidden}` · `.article-card{aspect-ratio:3/2;max-width:860px}` · `.prose .figworld{aspect-ratio:3/2}` · `.prose .figplate--band{aspect-ratio:4/3}` · `img{width:100%;height:100%;object-fit:cover;display:block}` with `width`/`height` attributes set to the 1x size. `aspect-ratio` sits on the cell, not on the `<img>`. `loading="lazy"` on cards and thumbs, `fetchpriority="high"` on the article card.

**Where words are baked, the cell ratio equals the frame ratio, or the words are not shown.** `object-fit:cover` in a cell of a different proportion eats the line before anyone notices. Two consequences, both live:

- Hover on a worded card is **switched off** — `.card-cover--worded img{transform:none}`. The old quiet `scale(1.03)` moved the question under the cell edge.
- The **home hero cell keeps the text-free preview**, not the card. That cell stretches on desktop and `.hero__cap` already prints the title over it; the card there would be cropped type under a second voice saying the same thing.

**In-body figures are `<figure>`, never `<div>`.** A `<div>` inside `.prose` silently truncates the NBSP gate in `src/check.mjs`; the gate is the reason the rule exists.

**No figure on this lane carries a `<figcaption>`** — each for its own reason: the card's words are already in the frame, the plate's are on its band, and the macro world's belong in its `alt`. A caption that repeats a baked line is a defect, not an omission: it is the same sentence said twice, once in pixels nobody can select and once in text. The only exception is the fallback case — a topic that still has a bare `hero` and no band gets the old caption until its plate is built.

**Slug.** Language-neutral, ASCII, the English working slug of the article (`akkermansia-muciniphila-mucus-layer`). Encyclopedia entries take the binomial (`lactobacillus-rhamnosus`). One slug serves all locales.

**R2 path.** No separate bucket for this portal is on file — the org holds one image bucket, `dasexperten-images`. Proposal, prefix `mbf/`:

```
dasexperten-images/mbf/articles/<slug>/<slug>-preview.webp  (+ @2x, .jpg, -og.jpg, -hero.*, -thumb.webp)
dasexperten-images/mbf/bacteria/<binomial-slug>/...          (encyclopedia, same file set)
dasexperten-images/mbf/masters/<slug>/<slug>-preview-master.png · <slug>-hero-master.png   (engine output, not served)
```

Public base `https://pub-1d1b12958f2d4ea380276bd8d0a1ff02.r2.dev/mbf/...`; the portal serves through its own domain. If the Owner wants the portal's pixels in their own bucket, Mina creates `microbiomefriendly-images` with the same tree — the paths under the prefix do not change.

---

## 2. Visual language

### 2a-0. Card — the person and the reader's own question (feed, article top, social) · Owner 2026-09-16

The first thing anyone sees is a person having the moment the article is about, and the question they would ask, in their own language, standing in the air of that photograph. It is **Lisa's** frame (§4d — a living person in frame is hers) and **Otto's** type (§4d — he composes words; he never asks an engine for letters).

| Point | Rule |
|---|---|
| Who | A named face from R2 `refs/characters/`, identity-locked by passing the REF to the engine as image input (§4 · §4e-3). **Never an invented face.** **Magnus Larsen is excluded** — he is the portal's author, not a model — and so are the four SKU faces. The cast sheet is `docs/CASTING_CARDS_2026-09-16.md`: 44 rows, 44 distinct faces, each REF verified live before it was used |
| The moment | One ordinary person, one ordinary hour, doing or feeling the thing the topic is about. One person only. No second face, no lab coat, no clinic, no microscope |
| The empty field | Marika reserves it in the brief **before generation**: which third of the frame stays calm, and it must be a **plain pale plane** — a wall, a door, a sky, a blank cupboard. Never boards, tiles, foliage or anything with a joint in it. The person stands on the opposite third |
| The words | **The topic's question, 3–6 words**, per language, set into that field by `tools/plates/build.py`. Not the title — the question the reader is actually holding. The same string lives in `cardLine` in the front matter and inside `cardAlt`, so pixels and alt can never drift |
| Proof before type | `tools/plates/measure.py` measures the field on the accepted master and writes `overlay.json`: box, ink, luminance spread ≤ 26/255, local gradient ≤ 7/255, and the contrast on the **worst two percent** of the box — not an average, which hides a dark patch. Floor **3.0:1** for display type at 72 px and up (§4j reserves 4.5:1 for body). Below it, or no calm box at all, the **frame** is reshot. The typography never shrinks to rescue a bad frame, and **nothing is ever drawn behind a line** (§4k) |
| Type | Nunito variable (OFL, Latin + Cyrillic) in `tools/plates/fonts/`. Ink is chosen per frame from charcoal `#363636`, navy `#1F2A3E` or ivory `#F7F5F2` — whichever actually reads on that wall. **Zero tracking, ever** (§4h): a line that does not fit is set smaller, then shortened — never spaced out. A number never leaves its unit (§4h-2). A glyph the face does not carry is a refusal, not a silent swap |
| Light · palette | The photograph's own light, one source, matte, natural skin; ground, wall and cloth greige `#EFEBE7` to paper `#F7F5F2`, at most one quiet accent in the whole frame |
| Forbidden | Any letter, numeral or sign **made by the engine**; product, packaging, capsule, sachet, jar, brand mark; a second person; medical horror; black ground, neon, studio gloss; letterbox, bars, border or vignette — the photograph fills the frame edge to edge |
| Cost | **One generation per topic** (§4e-2); a second only with the reason written down. A wrong word afterwards costs no generation at all, and a new language costs none either — that is the whole reason the words are not in the engine's hands |

### 2a. Macro world — the zoomed world (now inside the article body)

"Zoomed things" in this brand means **macro biology photographed warmly**, not a sci-fi render. The reader should feel a laboratory bench in morning light, with the lens six millimetres from life.

| Point | Rule |
|---|---|
| Subject | The organism or structure the article is actually about: rod, coccus, Y-shaped bifidobacterium, biofilm on a surface, intestinal villi, mucus layer, kefir grain, fermentation bubbles, culture-plate colonies, root hair, mycelium. **Morphology is truth** — Magnus names the shape in the brief (field 4), Lisa does not invent it. A *Lactobacillus* article does not get spherical cells |
| Framing | Macro or stylised micrograph, one plane of focus, shallow depth. Subject fills 55–70 % of the frame, centre band (see §1) |
| Ground | Warm greige `#EFEBE7` to paper `#F7F5F2` (portal tokens §4a); warm, airy, one light source. **No black background, no blue neon glow, no false-colour SEM cliché** |
| Colour | Forms in charcoal `#363636`, navy `#1F2A3E`, teal `#1B5F56`. **One** accent per frame at most — gold `#C7A24B`, coral `#E2725B` or lime `#D9EB99` — on the element the reader must notice, never a wash |
| Each frame its own world | Own surface, own light, own temperature per topic (Owner 2026-09-01). Ten cards on one page must not read as ten crops of one plate |
| Forbidden | Text, letters, numerals, labels, worded arrows, scale bars, invented microscope UI, invented glyphs; product, packaging or brand mark of any kind; faces, hands, bodies; medical horror (pus, wounds, blood); stock "DNA helix" and "glowing pill" |
| Pen | **Lisa** (§4d — a shot-looking world). She writes her engine words from `docs/IMAGE_PROMPT.md` |
| Honesty | It is an illustration of a micro-world, never presented as a diagnostic image. `alt` says what is depicted, not "microscope photo of…" |

### 2b. Plate — Otto's 3D scientific infographic with its band (inside the article body) · Owner 2026-09-16

The plate explains the topic's mechanism as a **built image**: matte 3D volumes, one warm directional light, a process the eye walks in one path. It is Otto Zuckerman's lane (§4d — built imagery: molecules, enzymes, biofilm, cells, flows) and his pen (§4e-1a). **No people.** The frame itself stays exactly as it was accepted; what is new is the **band underneath**.

**The band (Owner's choice, 2026-09-16).** The accepted 16:9 frame sits at the top of a 4:3 sheet and 450 px of brand paper `#F7F5F2` carry **three numbered beats** — first → next → outcome, in the language of the page, teal numerals `#1B5F56`, Nunito 600 ink `#363636`, a single hairline `#D6CFC7` between art and paper.

The Owner chose the band over re-shooting, and the measurement is why it was the honest choice: `measure.py` was run over all 44 accepted infographics and **only one** had air calm and contrasty enough to hold a line of type inside the picture. Type laid into the other 43 would have needed a shape under it, and a shape that exists only to sit under a line of text is forbidden (§4k). **Zero accepted frames were regenerated, and zero credits were spent on this decision.**

| Point | Rule |
|---|---|
| Composition | **One frame, one path.** 16:9 reads wide: the process runs across the frame — first → next → outcome — with calm air around it. No collage, no split panel, no inset, no before/after tiles |
| Subject | The mechanism from the article's `answer`, built around the organism or structure with the morphology of field 4. A *Lactobacillus* hero never gets spheres |
| The number | One sourced figure from `keyFacts`, shown **by scale, quantity or proportion**, never printed. No figure in keyFacts → the clause is dropped, nothing is invented |
| Light · palette | Ground greige `#EFEBE7` to paper `#F7F5F2`; forms charcoal `#363636`, navy `#1F2A3E`, teal `#1B5F56`; at most one accent — gold `#C7A24B`, coral `#E2725B`, lime `#D9EB99` — on the element the reader must notice. Its own light and temperature, not the preview's |
| Words | **None inside the picture** — no letters, numerals, labels, worded arrows, scale bars, interfaces, logo. The engine is never asked for a glyph. The words live on the band below, set by code per language (`plateLines`, three parts separated by ` · `), and the alt carries them too |
| Forbidden | People, faces, hands, bodies; organ cut-aways; product, packaging, capsule-as-product, brand mark; black ground, blue neon, false-colour micrograph, stock DNA helix, medical horror; a plate that is a wider crop of the macro world |

---

## 3. Lane lock and acceptance

| Step | Who | What |
|---|---|---|
| 1 | **Magnus** | Plain words: mechanism, morphology (field 4), the one sourced number, the three beats — **and the question**, 3–6 words, the one the reader is actually holding. **Never prompt text** (§4e-1). Roberta words the brief; Roberta and Alexandra hold the EN and RU register of every line that will be baked |
| 2 | **Marika** | Slot + ratio — this file — **the focus of each frame, and the empty field the words will sit in**, written per topic in the brief before generation (§4f) |
| 3 | **Lisa** (card, preview) · **Otto** (plate) | Each writes their own engine words (§4e-1a); the card generates on **Higgsfield** with the REF locked, the two people-free frames on the platform-native engine; native ratio; one frame per master, two at most with a named reason (§4e-2); nobody accepts their own work |
| 4 | **Otto** | Measures the field, then sets every word by code, per language — card, social band and plate band. He writes into no other file |
| 5 | **Marika** | Accepts the frame, **then** its look in the live cell — twice, not once (§4n), with a `Look-accepted:` line in the commit that changes CSS or templates |
| 6 | Mina | Uploads to R2, wires `<img>`, `og:image`, `ImageObject`, image sitemap |

**Acceptance checklist — every item measured, none intended:**

1. **Identity** — on the card, the face matches its R2 REF side by side; "resembles" is a reject. One person, nobody else. On the macro world and the plate: **no face, hand or body at all**.
2. **No product re-synthesis** — no tube, box, brush, jar with a brand look anywhere in the frame; no invented packaging.
3. **Ratio born right** — file dimensions equal the master size in §1 (1440×960 / 2400×1350); no stretch; no crop other than the social band; no letterbox, bar or border inside the photograph.
4. **Safe band** — on the card, the person's head and shoulders **and** the empty field inside the middle 1.91:1; the social crop loses only air and never a face or a line.
5. **No text the engine made** — zero letters, zero glyphs, zero invented labels in any generated frame (the engine composes writing; it never copies it — Lisa `LZ-LAW-260902-02`). Every word on the page's pixels was laid by `tools/plates/build.py`.
6. **Baked type** — set into a field `measure.py` proved empty, worst-2 % contrast ≥ 3.0:1 recorded in `overlay.json`, **no shape of any kind behind a line** (§4k), the question 3–6 words, `cardLine` identical to the pixels and contained verbatim in `cardAlt`.
7. **No tracking** — search the page template, the plate builder and any overlay for the spacing property: zero positive matches (§4h). A number never split from its unit (§4h-2), re-joined at the last moment before the line is set.
8. **Weight** — under the caps in §1, checked on the exported file, not the master, and the webp quality floor holds at 66 so the step-down loop never smears a baked letter.
9. **Truth** — the organism's morphology matches field 4 of the brief; Maya's consult is logged when a product or a health claim is nearby (§4c).
10. **Live cell** — screenshots of the real page at **1440 and 390 px**: the question legible, nothing cut by `object-fit:cover`, no horizontal overflow.
11. **Set, side by side** — the cards of a wave on one contact sheet, the worlds on another: each frame its own face, room, hour, light and temperature; no two read as crops of one plate, and no face appears twice on one feed page.
12. **Palette** — ground greige to paper, forms charcoal / navy / teal, at most one accent on the element the reader must notice.

A frame with an invented face, an invented hand or an invented product is rejected without correction and the batch is not shown to the Owner (§4).

---

## 4. Portal design tokens

**Confirmed: the portal runs the microbiomefriendly.me system, not Das Experten's.** Navy `#1B3856` is the only navy. Ivory `#F1EADC`, ivory2 `#E7DECB`, science `#FBFAF6`, ink `#16203A`, ink-2 `#565E78`, line `#D9CFBC`; accents green `#2F7D55`, gold `#C7A24B`, violet `#6B5CCB`, teal `#178B7A`, coral `#E2725B`. Display **Bricolage Grotesque**, body **Hanken Grotesk** 16 px / 1.62 / 500. Nothing from the apothecary book — no Archivo, no Fraunces, no Schwarz/Rot/Gold — crosses over. Colours only as tokens (§4i).

**Contrast, measured on the ivory ground:** navy 10.1:1, ink-2 5.4:1 — text. Green 4.3:1, teal 3.5:1 — large text (≥ 24 px / 700) and rules only. Gold and coral never carry text on ivory; they are rules, marks and hover states. Dark sections are navy with ivory text (10:1); ink-2 never sits on navy.

**Script fallback policy — system fonts per script, no second display family.** Bricolage Grotesque and Hanken Grotesk ship Latin, Latin Extended and Vietnamese. They carry **no CJK, no Arabic — and by my reading of the upstream specimens no Cyrillic either** (same finding as `TYPE_CYRILLIC_GAP_20260802` on Archivo; verify by cmap before launch). We do not license or load a second family; we let the operating system set those scripts, declared once per `:lang()`:

```css
:root{--display:"Bricolage Grotesque",system-ui,sans-serif;--body:"Hanken Grotesk",system-ui,sans-serif}
:lang(ja){--display:system-ui,"Hiragino Sans","Yu Gothic","Noto Sans JP",sans-serif;--body:var(--display);line-height:1.8}
:lang(ko){--display:system-ui,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;--body:var(--display);line-height:1.8}
:lang(zh){--display:system-ui,"PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif;--body:var(--display);line-height:1.8}
:lang(ar){--display:system-ui,"SF Arabic","Segoe UI","Geeza Pro","Noto Naskh Arabic",sans-serif;--body:var(--display);line-height:1.9}
:lang(ru),:lang(uk){--display:system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;--body:var(--display)}
```

Display weight on fallback scripts is **700**, not 800 — system CJK and Arabic faces rarely carry 800 and would fake-bold. Italics are never used on ja/ko/zh/ar. **Arabic is RTL:** `<html dir="rtl" lang="ar">`, layout in logical properties (`margin-inline-start`, `padding-inline`, `inset-inline`), the card grid and the hero mirror by themselves; images are **not** mirrored; numbers keep the direction of the copy Alexandra sets; `text-align:start`, never `left`.

**Ban list (portal, permanent):**
- **IBM Plex Mono — never.** No monospace face anywhere, including code-looking labels, dates, DOIs and CFU counts.
- **No monospace numbers.** Numbers are set in Hanken Grotesk; `tabular-nums` is allowed only inside a data table.
- **No positive tracking** (§4h). Zero is the ceiling; `-.01em…-.03em` on display ≥ 40 px allowed. No uppercase micro-labels — drop the transform, gain size and weight.
- **Number never split from its unit** (§4h-2): `10&nbsp;⁹&nbsp;CFU`, `37&nbsp;°C`, `2&nbsp;g`, `1&nbsp;844`; `white-space:nowrap` on the span; checked at 320 px.
- No second display family, no gradient text, no navy other than `#1B3856`.
- **Text baked into images** was banned here until 2026-09-16 and is now allowed in exactly two places — the card and the plate band — under the conditions in §2a-0 and §2b: laid by code, never by an engine; per language; into measured air; with no shape underneath. Everywhere else the ban stands.

---

## 5. Article image brief — Magnus fills, Otto and Lisa work from it without a second question

Copy the block into `content/<type>/<slug>/image-brief.md` in the portal repo. Plain words only; no prompt language.

```
1. Slug (ASCII, language-neutral):             akkermansia-muciniphila-mucus-layer
2. Article title (EN) + one-line summary:      …
3. Organism / structure in the preview:        Akkermansia muciniphila
4. Morphology, in words (truth, Magnus/Maya):  oval short rods, single or in pairs, non-motile, in a mucus layer over villi
5. Preview mood (one line, warm science):      pale mucus film catching morning light, cells resting in it
6. Plate mechanism (the answer, one clause):   Akkermansia grazes the mucus layer and the gut wall renews it
7. Three beats (first → next → outcome):       cells settle in mucus → they feed on it → the lining thickens its mucus
8. The one number (keyFacts, source id):       shown by proportion only — or "none in keyFacts, clause dropped"
9. Must not appear:                            any product, any text, second person, blue neon
10. Locales + alt text per locale (RU via Alexandra): en / ru / de / ja / ar — one alt line each

— the card block, added 2026-09-16 —
Card (Lisa · person):      the named face from refs/characters/ and who they are in this moment
Card scene:                one sentence — the ordinary hour the topic lives in
Wardrobe and place:        …
EMPTY FIELD:               left third, a plain pale wall — a flat plane, never boards, tiles or foliage
Card must not appear:      any letter the engine makes, product, second person, letterbox or border
- en card question:        Can three days reset it?      (3–6 words)
- ru card question:        Три дня что-то меняют?
- en card alt:             … (≤125 chars, contains the question verbatim)
- ru card alt:             …
- en plate lines:          First — food shifts it in a day · Then — back in two days · Outcome — 60 % of strains stay for years
- ru plate lines:          …
```

Fields 1–5 produce Lisa's macro world, 6–8 Otto's plate and its band, 9–10 belong to both, and the card block produces the frame the reader meets first. A brief missing field 4 or 6 is returned — an organism without a shape and a plate without a mechanism are the two ways this portal would end up inventing something, and we do not invent. A brief whose **EMPTY FIELD** names a textured surface is returned too: five of the first forty-four named fence boards and tile joints, and all five had to be reshot after the measurement refused them. Before generation Marika adds one line per master: slot, ratio, focus and that empty field.

— Marika Nowicka · Brand Studio · 2026-09-02, slots rewritten to the three-image shape 2026-09-16

---

## 4a. Portal tokens — Owner 2026-09-02: "design change to this fit https://omnibioticlife.com/"

The Owner's word replaces §4 for the **portal** (the brand site keeps its own tokens until the domain move). Reference studied 2026-09-02: greige ground `#efebe7`, charcoal text `#363636`, deep navy blocks `#1f2a3e`, teal solid CTA, soft lime `#d9eb99` as a small note, proprietary serif display ("theseasons", fallback Cormorant) with DM Sans text, uppercase small nav, hairlines, near-square corners, photographic hero left-text / right-image. Their nav uses +2 px tracking — **we do not** (§4h): the same feel is carried by size, weight and case.

| Token | Value | Use |
|---|---|---|
| `--ground` | `#EFEBE7` | page ground |
| `--ground-2` | `#E6DFD8` | alternate sections, empty image cells |
| `--paper` | `#F7F5F2` | cards, fact boxes |
| `--band` | `#E2D8CD` | header band, hero image cell |
| `--ink` | `#363636` | text |
| `--ink-2` / `--ink-3` | `#6B6B6B` / `#8A8580` | secondary text · meta (≥ 4.5:1 on ground for `--ink-2`; `--ink-3` only at ≥ 12 px uppercase meta) |
| `--line` / `--line-2` | `#D6CFC7` / `#C2BEB8` | hairlines |
| `--navy` | `#1F2A3E` | footer, active chips |
| `--teal` / `--teal-2` | `#1B5F56` / `#174F48` | action, links, answer rule (white on teal 7.2:1) |
| `--lime` | `#D9EB99` | a single small note (footer hover) — never a wash |
| display | **Nunito** 900 (H1, hero, card titles) · body **Nunito** 600 | Owner 2026-09-02 final: "Nunito is perfect choice" |
| subtitles / sections | **Jost** 600/700 | Owner: "for subtitles or sections you can use Jost" — kickers, nav, leads, answer, H2/H3, labels, ribbon codes |
| radius | 4 px (6 px on cards) | near-square |
| shadow | none (language switcher only, 8 % charcoal) | flat |

**Images under the new look (§2 amended):** preview ground is the greige/paper of the page, not ivory; subject colours charcoal, navy, teal, warm greys; one small accent (lime, rose `#A8324F`, or gold) at most; hero scene warm and photographic, matte, daylight — the reference's photography is real-room, natural light, no studio gloss. Everything else in §2 (morphology as truth, no text, no product, REF-only faces, one scene one frame) stands.

**Hero cell (home):** Marika's site law — two equal halves, text left, one image right, image covers its cell. Today the right cell is an empty framed band until an accepted hero exists; it is not a fake photo.

## 4b. No underline — standing rule (Owner 2026-09-03)

**Owner's word:** never use an underline on a Das Experten surface — not on this portal, not on any other project — unless he asks for one explicitly.

| Point | Rule |
|---|---|
| Links | Marked by colour and weight (teal, 700), never by `text-decoration: underline` and never by a border that imitates one |
| Current page in a menu | A filled chip, never a line under the word |
| "Read more" and similar | Colour and weight only |
| What is still allowed | Hairlines that **separate rows or sections** (`border-top` / `border-bottom` on a card, a table row, a byline, a header band). They are structure, not underlines |
| Enforcement | `text-decoration: underline` does not appear in any stylesheet of ours; a review that finds one treats it as a defect, not a style choice |

Candidate for organizacia `HARD_RULES.md` §4h (typography), where the letter-spacing and number-unit laws live. An agent does not write that file; the line is ready for the Owner's word.
