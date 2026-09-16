# The image prompts — three masters, two pens, filled per topic

**As of:** 2026-09-16 · **Owner decision (2026-09-16, morning):** built imagery on this portal is **Otto Zuckerman's** (organizacia HARD_RULES §4d, since 2026-09-05). **Owner decision (2026-09-16, the same day, second word):** every topic leads with a **person and the reader's own question**. Three masters now, each born native in its own ratio, each from its own pen (§4e-1a):

| Master | Pen | What it is | Ratio · native size |
|---|---|---|---|
| **Card** | **Lisa** (`lisa-image`) | a real face from `refs/characters/` living the topic's ordinary moment, with one third of the frame kept empty on purpose — the question is set into that air afterwards, by code | **3:2** · master **1440×960** |
| **Preview** | **Lisa** (`lisa-image`) | the macro micro-world, shot-looking — the organism or structure as if photographed six millimetres away | **3:2** · master **1440×960** |
| **Plate** | **Otto Zuckerman** (`otto-infographic`) | a striking 3D scientific infographic of the topic's mechanism — built volumes, no people; a band of brand paper is composed beneath it, carrying three numbered beats | **16:9** · master **2400×1350**, delivered 4:3 with the band |

**The engine never writes a letter.** Every word on every surface is laid afterwards by `tools/plates/build.py`, per language, into a field `tools/plates/measure.py` proved is empty. A wrong word costs one line of JSON; a new language costs no generation at all.

**Queue (§4e-1, never reshuffled):** Magnus names mechanism, morphology, the one sourced number **and the question** in `image-brief.md` → Roberta shapes the brief's words, Alexandra holds the Russian → **Marika names slot, ratio, focus and the empty field** → the pen writes the engine words and generates → Otto measures, then sets the words → Marika accepts the frame, then the frame on the live page. No brief, or no slot, focus and empty field → nothing is generated.

**Engine:** the **card** is generated on **Higgsfield** (`nano_banana_2`, `--aspect_ratio 3:2 --resolution 2k --image <REF>`), because the face must be locked to a real REF (§4b · §4e-3). The **preview** and the **plate** are platform-native generation — Codex `$imagegen` or Grok `/imagine` — **not Higgsfield**. Ceiling: one frame per master, two at most, the second only as a real choice for Marika (§4e-2).

All other files (og, thumb, 1x sizes) are script derivations of the three masters — `tools/images.mjs`. The card, its og band and the plate exist **once per language**, because their pixels carry words; the preview, the thumb and the hero of record are one set for all 18 locales.

---

## Card — Lisa's paragraph (3:2, REF as image input)

Assembled per topic by `tools/plates/make-prompts.mjs` from the brief's card block and the casting sheet, so forty-four frames obey the same invariants and the tool adds nothing of its own:

> The person in the reference photograph, same face, same age, same hair, one person only and nobody else in the frame: **{who they are in this moment, from the brief's card line}**. The moment: **{the ordinary hour the topic lives in}**. Wardrobe and place: **{…}**. The empty field, kept clear on purpose: **{which third stays calm, and what plain pale plane it is}**. She stands or sits on the opposite third of the frame from that empty field, her head and shoulders inside the middle horizontal band, the top and bottom eleventh of the frame left as air. Photographic and matte, natural skin, one light source, shallow depth of field on the person with the empty field softly out of focus; ground, wall and cloth in warm greige `#EFEBE7` to paper `#F7F5F2`, at most one quiet accent colour in the whole frame. Landscape 3:2 composition, born at that ratio. Absolutely no text of any kind anywhere in the frame: no letters, no numerals, no signage, no labels, no packaging text, no watermark, no invented glyphs, nothing written on clothing, mugs, jars, packets or in the background. No product, no packaging, no bottle, no capsule, no pill, no sachet, no jar, no brand mark. No second person, no other face, no lab coat, no scrubs, no clinic, no hospital, no microscope. No medical horror. No black background, no neon, no studio gloss. The photograph fills the whole frame edge to edge: no letterbox, no bars, no border, no frame within the frame, no vignette.

The last sentence is not decoration: two of the first forty-four came back letterboxed and had to be shot again.

## Plate — Otto's paragraph (16:9)

> A striking, physically-lit 3D scientific infographic that explains **{the mechanism in one clause, from the article's answer paragraph}** for a curious reader who is not a scientist: the frame is built around **{the organism or structure, with its real morphology in plain words from field 4 of the brief}**, rendered as clean matte 3D volumes with soft subsurface translucency and one warm directional light, arranged so the eye walks the process in one path from left to right — **{what happens first} → {what happens next} → {the outcome}** — with **{the one sourced number, shown by scale, quantity or proportion}** carried visually and never written; the ground is warm greige `#EFEBE7` to paper `#F7F5F2`, the forms charcoal `#363636`, deep navy `#1F2A3E` and teal `#1B5F56`, with at most one accent — gold `#C7A24B`, coral `#E2725B` or lime `#D9EB99` — placed only on **{the element the reader must notice}**; a wide 16:9 composition born at that ratio, the process reading across the frame with calm air around it; absolutely no text, letters, numerals, labels, arrows with words, scale bars, watermarks or invented microscope or screen interfaces; no product, packaging, capsule, bottle or brand mark; no people, faces, hands or bodies; no organ cut-away; no medical horror; no black background, no blue neon glow, no false-colour micrograph cliché, no stock DNA helix; calm laboratory daylight and quiet authority, the visual language of a modern science magazine — an illustration honest about being an illustration; sharp, matte, no vignette, no border.

## Preview — Lisa's paragraph (3:2)

> A warm macro photograph-like view of **{the organism or structure, with its real morphology in plain words from field 4}** in **{its own world: the surface, film or medium named in the brief}**, one plane of focus, shallow depth of field, the subject filling 55–70 % of the frame and held entirely inside the middle horizontal band so a 1.91:1 crop loses only air; **{its own light and temperature for this topic — hour, direction, warmth}**; ground warm greige `#EFEBE7` to paper `#F7F5F2`, forms charcoal `#363636`, navy `#1F2A3E` and teal `#1B5F56`, at most one small accent — gold `#C7A24B`, coral `#E2725B` or lime `#D9EB99` — on **{the element the reader must notice}**; a quiet, alive, close feeling like a laboratory bench in morning light; no text, letters, numerals, labels, scale bars or microscope interface; no product, packaging or brand mark; no people, faces, hands or bodies; no medical horror; no black background, no blue neon glow, no false-colour micrograph cliché, no stock DNA helix; a 3:2 frame born at that ratio, never cropped from another.

---

## Fields Magnus supplies, Roberta words

| Brace | Where it comes from |
|---|---|
| mechanism in one clause | the article's `answer` field |
| organism and morphology | field 4 of the brief — truth, never invented. A *Lactobacillus* topic never gets spheres |
| the three-beat process | the article's H2 skeleton, named in the brief's plate fields — the same three beats are the band's numbered lines |
| the question, 3–6 words | the brief's `card question` line per language: what the reader is holding, never the title repeated |
| the face, the moment, the empty field | the brief's card block and `docs/CASTING_CARDS_2026-09-16.md`; the face is a REF, never a description of a person |
| the number | one sourced figure from `keyFacts`, with its source id. **No figure in keyFacts — the clause is dropped, nothing is invented** |
| world, light, temperature (preview) | field 5 of the brief; Marika checks the set side by side so ten cards never read as ten crops of one plate |
| accent element | the brief, confirmed by Marika's focus line |
| ratio and size | Marika's slot: card 3:2 · preview 3:2 · plate 16:9 + band (`docs/BRAND_IMAGE_SPEC.md` §1) |

## Rules that outlive any engine

1. **No text the engine made** — no letters, numerals, labels, worded arrows, scale bars, invented microscope UI, in any frame. Words are laid by code afterwards, per language, and only on the card and the plate's band.
2. A number is shown by scale, quantity or proportion, never printed inside the picture, and only when sourced.
3. Morphology is truth, from field 4 of the brief.
4. Each frame its own world, light and temperature — and on the cards, its own face, room and hour. The set is compared side by side before acceptance.
5. No product, packaging or brand mark; no black ground, blue neon, false-colour micrograph, stock DNA helix, medical horror. No faces or hands in the preview or the plate at all; on the card, exactly one person, and only a REF face.
6. Masters are never cropped into each other. og:image is the centre band of the **card** master, so the person and the empty field stay inside the middle 1.91:1 band — and the words are set again at the band's own size, never scaled down from the card's.
7. Type sits only where the pixels were measured: worst-2 % contrast ≥ 3.0:1, no shape behind a line (§4k), zero tracking (§4h), a number never split from its unit (§4h-2), and a missing glyph is a refusal rather than a silent substitution.
8. Marika accepts twice: the frame, then the frame on the live page at 1440 and 390 px.
