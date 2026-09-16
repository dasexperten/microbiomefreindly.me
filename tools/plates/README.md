# tools/plates — Otto's hand on this portal

The engine never writes a letter (`LZ-LAW-260902-02`): it invents writing instead of copying it. So every
frame is generated text-free and every word is laid here, by code, per language. A wrong word costs one
line and one run — never a re-roll, never a credit.

| Tool | What it does |
|---|---|
| `measure.py` | Finds the real empty field in an accepted 3:2 master and prints its numbers: box, ink polarity, luminance spread, gradient, worst-2 % contrast. No calm box → **the frame failed**, and it is reshot. This measurement is the proof that §4k was kept: the air is the frame's own, not a shape invented under a line of type |
| `build.py` | Sets the words. `card` 1440×960 — the question in the measured field. `og` 1200×630 — the centre band of the same frame, the question set again at its own size, so the social crop never cuts a letter. `plate` 2400×1800 — the accepted 16:9 infographic keeps every pixel and gains a band of the portal's own paper carrying three numbered beats |
| `fonts/` | **Nunito**, the portal's own display face, OFL, variable weight. One family on the surface (§4h): it carries Latin and Cyrillic, so RU needs no second face and no silent substitution |

Law inside the code, not in a comment: zero tracking ever — a line that does not fit is set smaller or
shortened (§4h); a number never leaves its unit — `glue()` ties them with a non-breaking space (§4h-2);
a glyph the face does not carry stops the line instead of printing a box.

```bash
python3 tools/plates/measure.py <master.png> --side left --lines 2 --json content/<type>/<slug>/overlay.json
python3 tools/plates/build.py --strings data/plates/lines.json --masters <masters-dir> --out rendered/
node tools/images.mjs rendered/ out/ --rendered     # derive the per-locale webp/jpg set
```

For Japanese, Korean, Arabic and Thai this machine's Pillow has FreeType but **no raqm**, so those
scripts are not set here — they go through Otto's headless-Chrome path when those locales arrive.
