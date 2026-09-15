# The image prompts — two masters, two pens, filled per topic

**As of:** 2026-09-16 · **Owner decision (2026-09-16):** built imagery on this portal is **Otto Zuckerman's** (organizacia HARD_RULES §4d, since 2026-09-05). Every topic carries two masters, each born native in its own ratio, each from its own pen (§4e-1a):

| Master | Pen | What it is | Ratio · native size |
|---|---|---|---|
| **Hero** | **Otto Zuckerman** (`otto-infographic`) | a striking 3D scientific infographic of the topic's mechanism — built volumes, no people | **16:9** · master **2400×1350** |
| **Preview** | **Lisa** (`lisa-image`) | the macro micro-world, shot-looking — the organism or structure as if photographed six millimetres away | **3:2** · master **1440×960** |

A hero that shows a person returns only on the Owner's word, and then it is Lisa's frame under REF law (§4, §4e-3) — not this paragraph.

**Queue (§4e-1, never reshuffled):** Magnus names mechanism, morphology and the one sourced number in `image-brief.md` → Roberta shapes the brief's words → **Marika names slot, ratio and focus** → the pen writes the engine words and generates → Marika accepts the frame, then the frame on the live page. No brief, or no slot and focus → nothing is generated.

**Engine:** platform-native generation for this lane — Codex `$imagegen` or Grok `/imagine` — **not Higgsfield**. Ceiling: one frame per master, two at most, the second only as a real choice for Marika (§4e-2).

All other files (card, og, thumb, 1x hero) are script resizes of the two masters — `tools/images.mjs`. One image set serves all 18 locales; only `alt` changes.

---

## Hero — Otto's paragraph (16:9)

> A striking, physically-lit 3D scientific infographic that explains **{the mechanism in one clause, from the article's answer paragraph}** for a curious reader who is not a scientist: the frame is built around **{the organism or structure, with its real morphology in plain words from field 4 of the brief}**, rendered as clean matte 3D volumes with soft subsurface translucency and one warm directional light, arranged so the eye walks the process in one path from left to right — **{what happens first} → {what happens next} → {the outcome}** — with **{the one sourced number, shown by scale, quantity or proportion}** carried visually and never written; the ground is warm greige `#EFEBE7` to paper `#F7F5F2`, the forms charcoal `#363636`, deep navy `#1F2A3E` and teal `#1B5F56`, with at most one accent — gold `#C7A24B`, coral `#E2725B` or lime `#D9EB99` — placed only on **{the element the reader must notice}**; a wide 16:9 composition born at that ratio, the process reading across the frame with calm air around it; absolutely no text, letters, numerals, labels, arrows with words, scale bars, watermarks or invented microscope or screen interfaces; no product, packaging, capsule, bottle or brand mark; no people, faces, hands or bodies; no organ cut-away; no medical horror; no black background, no blue neon glow, no false-colour micrograph cliché, no stock DNA helix; calm laboratory daylight and quiet authority, the visual language of a modern science magazine — an illustration honest about being an illustration; sharp, matte, no vignette, no border.

## Preview — Lisa's paragraph (3:2)

> A warm macro photograph-like view of **{the organism or structure, with its real morphology in plain words from field 4}** in **{its own world: the surface, film or medium named in the brief}**, one plane of focus, shallow depth of field, the subject filling 55–70 % of the frame and held entirely inside the middle horizontal band so a 1.91:1 crop loses only air; **{its own light and temperature for this topic — hour, direction, warmth}**; ground warm greige `#EFEBE7` to paper `#F7F5F2`, forms charcoal `#363636`, navy `#1F2A3E` and teal `#1B5F56`, at most one small accent — gold `#C7A24B`, coral `#E2725B` or lime `#D9EB99` — on **{the element the reader must notice}**; a quiet, alive, close feeling like a laboratory bench in morning light; no text, letters, numerals, labels, scale bars or microscope interface; no product, packaging or brand mark; no people, faces, hands or bodies; no medical horror; no black background, no blue neon glow, no false-colour micrograph cliché, no stock DNA helix; a 3:2 frame born at that ratio, never cropped from another.

---

## Fields Magnus supplies, Roberta words

| Brace | Where it comes from |
|---|---|
| mechanism in one clause | the article's `answer` field |
| organism and morphology | field 4 of the brief — truth, never invented. A *Lactobacillus* topic never gets spheres |
| the three-beat process | the article's H2 skeleton, named in the brief's hero fields |
| the number | one sourced figure from `keyFacts`, with its source id. **No figure in keyFacts — the clause is dropped, nothing is invented** |
| world, light, temperature (preview) | field 5 of the brief; Marika checks the set side by side so ten cards never read as ten crops of one plate |
| accent element | the brief, confirmed by Marika's focus line |
| ratio and size | Marika's slot: preview 3:2 · hero 16:9 (`docs/BRAND_IMAGE_SPEC.md` §1) |

## Rules that outlive any engine

1. No text in any frame — no letters, numerals, labels, worded arrows, scale bars, invented microscope UI. Caption and alt carry the words, so one image set serves every locale.
2. A number is shown by scale, quantity or proportion, never printed, and only when sourced.
3. Morphology is truth, from field 4 of the brief.
4. Each frame its own world, light and temperature. The set is compared side by side before acceptance.
5. No product, packaging or brand mark; no black ground, blue neon, false-colour micrograph, stock DNA helix, medical horror. No faces or hands in previews at all; no people in heroes.
6. Masters are never cropped into each other. og:image is the centre band of the preview master, so the preview subject stays inside the middle 1.91:1 band.
7. Marika accepts twice: the frame, then the frame on the live page.
