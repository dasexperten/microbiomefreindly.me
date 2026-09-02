# BRAND IMAGE SPEC — microbiomefriendly.me · slots, proportions, acceptance

**Who:** Marika Nowicka — head of Brand Studio · **For:** Magnus Larsen (briefs), Lisa (generation), Mina (deploy)
**Why:** Owner brief 2026-09-02 — two images per topic: a *preview* (micro-world, no people) and a *hero* (one scene with a house character from R2).
**Law:** HARD_RULES §4 · §4b · §4d · §4e · §4e-1 · §4f · §4h · §4h-2 · §4i. This file is the slot brief. Until the slot and the ratio below are named, nothing is generated (§4f · §4e-1).

I looked first. Below is the place and the proportion for every image the portal will carry. One surface — one slot — one native ratio. A frame is born in its ratio; it is never stretched or cropped into a neighbour's frame.

---

## 1. Slots and proportions

The portal is one brand with one card grid, so every article and every encyclopedia entry takes the same two masters. Locales share the image set; only `alt` changes per language.

| Slot | Where on the page | Ratio | 1x | 2x | Weight cap (webp) | Format | File |
|---|---|---|---|---|---|---|---|
| **Card preview** | `.card-cover`, first node inside the card, above kicker + title. Grid 3-up desktop (`minmax(0,1fr)` ×3), 1-up mobile | **3:2** | **720×480** | **1440×960** | 1x ≤ 110 KB · 2x ≤ 220 KB | webp + jpg fallback | `<slug>-preview.webp` · `-preview@2x.webp` · `-preview.jpg` |
| **og:image** | `<meta property="og:image">` + twitter card | **1.91:1** | **1200×630** | — | ≤ 280 KB | **jpg only** (scrapers do not read webp reliably) | `<slug>-og.jpg` |
| **Article hero** | `.article-hero`, full content width directly under H1 and lead, before the first paragraph | **16:9** | **1200×675** | **2400×1350** | 1x ≤ 170 KB · 2x ≤ 340 KB | webp + jpg fallback | `<slug>-hero.webp` · `-hero@2x.webp` · `-hero.jpg` |
| **Thumb** | related-articles rail, encyclopedia index rows, search results | 3:2 | 360×240 | 720×480 | ≤ 40 KB | webp | `<slug>-thumb.webp` |

**Master sizes Lisa generates natively:** preview **3:2 at 1440×960** (Higgsfield `aspect_ratio` 3:2, 2k); hero **16:9 at 2400×1350** (`aspect_ratio` 16:9, 2k). Everything in the table is a *resize* of its own master, never a crop — with one exception, named aloud:

- **og:image is the centre band of the preview master** (1440×960 → 1440×754 → 1200×630). I allow it because the preview carries **no people and no product** — §4f exists so that bodies do not come out unnatural, and a bacterial colony has no body. Condition: Lisa keeps the subject inside the **middle 1.91:1 band** of the 3:2 frame (top and bottom 11 % are air). If the subject touches that margin, the frame is reshot, not the CSS.
- The hero is **never** the source of the preview, and the preview is never the source of the hero. Two masters, two worlds (Owner 2026-09-02, Lisa `LZ-MEM-260902-01`).

**CSS canon.** `.card-cover{aspect-ratio:3/2;overflow:hidden}` · `.article-hero{aspect-ratio:16/9}` · `img{width:100%;height:100%;object-fit:cover;display:block}` with `width`/`height` attributes set to the 1x size. `aspect-ratio` sits on the cell, not on the `<img>`. Hover on cards: `scale(1.03)` — quiet, it is a reading surface. `loading="lazy"` on cards and thumbs, `fetchpriority="high"` on the hero.

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

### 2a. Preview — the zoomed world (cards, og:image)

"Zoomed things" in this brand means **macro biology photographed warmly**, not a sci-fi render. The reader should feel a laboratory bench in morning light, with the lens six millimetres from life.

| Point | Rule |
|---|---|
| Subject | The organism or structure the article is actually about: rod, coccus, Y-shaped bifidobacterium, biofilm on a surface, intestinal villi, mucus layer, kefir grain, fermentation bubbles, culture-plate colonies, root hair, mycelium. **Morphology is truth** — Magnus names the shape in the brief (field 4), Lisa does not invent it. A *Lactobacillus* article does not get spherical cells |
| Framing | Macro or stylised micrograph, one plane of focus, shallow depth. Subject fills 55–70 % of the frame, centre band (see §1) |
| Ground | Ivory `#F1EADC` / science `#FBFAF6` light; warm, airy, one light source. **No black background, no blue neon glow, no false-colour SEM cliché** |
| Colour | Subject in navy `#1B3856`, teal `#178B7A`, green `#2F7D55`. **One** accent per frame at most — gold `#C7A24B`, violet `#6B5CCB` or coral `#E2725B` — as a small note, never a wash |
| Each frame its own world | Own surface, own light, own temperature per topic (Owner 2026-09-01). Ten cards on one page must not read as ten crops of one plate |
| Forbidden | Text, labels, scale bars, invented microscope UI, invented glyphs; product of any brand; faces, hands, bodies; medical horror (pus, wounds, blood); stock "DNA helix" and "glowing pill" |
| Honesty | It is an illustration of a micro-world, never presented as a diagnostic image. `alt` says what is depicted, not "microscope photo of…" |

### 2b. Hero — one scene, one frame, our character (article page)

| Point | Rule |
|---|---|
| Composition | **One scene, one frame, one moment.** No collage, no split panel, no inset. 16:9 reads wide: the character occupies the left or right 40 % with the article's subject world on the other side — bench, culture plates, ferment jar, kitchen, field. Eyes in the upper third |
| Character | **Only a REF from R2 `dasexperten-images/refs/characters/`** (the Owner brief writes `efs/characters/` — same key, the leading `r` dropped; the bucket has `refs/characters/`, 132 objects as of 2026-09-02, Mina). Identity-locked in Higgsfield with that file as reference input. Never a described face, never stock, never "someone like Magnus" |
| Default cast | For Magnus's lane the house face is **`refs/characters/MagnusLarsen.jpg`** (Owner photograph; accepted portrait master `MagnusLarsen_portrait.jpg`). A second person only when the Owner names one (§4 — *who appears is the Owner's word*) |
| REF names on file in org docs | `MagnusLarsen`, `Kobayashi`, `Michellanghela`, `Ruda`, `Haide`, `Gerardina`, `Coli`, `MayaKrasochkina`, `RobertaDiMaria`, `JulianFarah`, `Andrea`, `Joanna`, `Kozlovskaya`, `Tupa`, `Alfred`, `Aresta`, `Bati`, `Haala`, `Oda`, `Shmeia`, `ObnorskayaFB`, `JustinaTimber`, `ValentinaKorolyeva`, `Helga1`, `Aura(schwarz)5`, `Gozde(termo)3`, `Marianna(detox)6`, `Rubi(schwarzfloss)`. **The full 132-key list is not on file in the org docs** — it lives only in the R2 listing and Higgsfield `characters_mapping.json`; Lisa reads it from R2, not from memory. Aura and Helga are never auto-picked (Owner 2026-07-20) |
| Wardrobe · place | Plain, contemporary, credible for a microbiologist: lab coat over a visible collar (both layers visible, §4g), knit, apron at a ferment bench. No logos, no brand marks, no Das Experten product anywhere in the frame — this is a science portal, not a shop |
| Light · palette | Same warm ground as the preview; skin true to REF; navy/teal/green in the scene, one accent |
| Forbidden | Invented face or hand; two frames glued; text in image; product re-synthesis of any kind; a hero that is a wider crop of the preview |

---

## 3. Lane lock and acceptance

| Step | Who | What |
|---|---|---|
| 1 | **Magnus** | Plain words: what the article is about, which organism, what the reader should feel. **Never prompt text** (§4e-1) |
| 2 | **Marika** | Slot + ratio — this file. Per article I answer only if a field deviates |
| 3 | **Lisa** | Writes the engine prompt, generates in **Higgsfield only** (§4b), native ratio, REF as input, two variations per slot, does not accept herself |
| 4 | **Marika** | Accepts the frame **and** its look in the live cell — twice, not once |
| 5 | Mina | Uploads to R2, wires `<img>`, `og:image`, `ImageObject`, image sitemap |

**Acceptance checklist — every item measured, none intended:**

1. **Identity** — face matches the R2 REF file side by side: eyes, brow, nose, hairline, skin. "Resembles" is a reject.
2. **No product re-synthesis** — no tube, box, brush, jar with a brand look anywhere in the frame; no invented packaging.
3. **Ratio born right** — file dimensions equal the master size in §1 (1440×960 / 2400×1350); no stretch, no crop other than the og band.
4. **Preview safe band** — subject inside the middle 1.91:1; og crop loses only air.
5. **No text in image** — zero letters, zero glyphs, zero invented labels (the engine composes writing; it never copies it — Lisa `LZ-LAW-260902-02`).
6. **Overlay text** — none baked into pixels. If a locale needs a badge, it is an HTML layer: navy `#1B3856` scrim at 72 % with ivory `#F1EADC` text, contrast ≥ 4.5:1, measured on the darkest and lightest hero of the batch.
7. **No tracking** — search the page template and any overlay for the spacing property: zero positive matches (§4h).
8. **Weight** — under the caps in §1, checked on the exported file, not the master.
9. **Truth** — the organism's morphology matches field 4 of the brief; Maya's consult is logged when a product or a health claim is nearby (§4c).
10. **Live cell** — screenshot of the card at 3-up desktop and 1-up 360 px mobile; nothing important is cut by `object-fit:cover`.

A frame with an invented hand, face or product is rejected without correction and the batch is not shown to the Owner (§4).

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
- No second display family, no gradient text, no text baked into images, no navy other than `#1B3856`.

---

## 5. Article image brief — Magnus fills, Lisa works from it without a second question

Copy the block into `briefs/<slug>.md` in the portal repo. Plain words only; no prompt language.

```
1. Slug (ASCII, language-neutral):             akkermansia-muciniphila-mucus-layer
2. Article title (EN) + one-line summary:      …
3. Organism / structure in the preview:        Akkermansia muciniphila
4. Morphology, in words (truth, Magnus/Maya):  oval short rods, single or in pairs, non-motile, in a mucus layer over villi
5. Preview mood (one line, warm science):      pale mucus film catching morning light, cells resting in it
6. Hero scene (one sentence, one moment):      Magnus at a ferment bench lifting a kefir grain to the light
7. Cast — R2 REF file name(s), Owner-named:    refs/characters/MagnusLarsen.jpg
8. Place + wardrobe (credible, no logos):      home kitchen, linen apron over a visible shirt collar
9. Must not appear:                            any product, any text, second person, blue neon
10. Locales + alt text per locale (RU via Alexandra): en / ru / de / ja / ar — one alt line each
```

Fields 1–5 produce the preview, 6–8 the hero, 9–10 belong to both. A brief missing field 4 or 7 is returned — an organism without a shape and a scene without a named REF are the two ways this portal would end up inventing something, and we do not invent.

— Marika Nowicka · Brand Studio · 2026-09-02

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
| display | **Cormorant Garamond** 400/500/600 | the open equivalent of the reference serif; one display family per surface |
| text | **DM Sans** 400/500/600/700 | body and UI |
| radius | 4 px (6 px on cards) | near-square |
| shadow | none (language switcher only, 8 % charcoal) | flat |

**Images under the new look (§2 amended):** preview ground is the greige/paper of the page, not ivory; subject colours charcoal, navy, teal, warm greys; one small accent (lime, rose `#A8324F`, or gold) at most; hero scene warm and photographic, matte, daylight — the reference's photography is real-room, natural light, no studio gloss. Everything else in §2 (morphology as truth, no text, no product, REF-only faces, one scene one frame) stands.

**Hero cell (home):** Marika's site law — two equal halves, text left, one image right, image covers its cell. Today the right cell is an empty framed band until an accepted hero exists; it is not a fake photo.
