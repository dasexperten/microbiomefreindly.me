#!/usr/bin/env python3
"""build.py — Otto lays every word by code, per language.

Three surfaces, one method (HARD_RULES §4d: he composes, he does not ask the engine for letters):

  card   1440×960  the character frame + the topic's question in the measured empty field
  og     1200×630  the centre band of the same frame + the same question at its own size
  plate  2400×1800 the accepted 16:9 infographic on top + a band of brand paper carrying three beats

Law in the code, not in a comment: zero tracking ever (§4h) — a line that does not fit is set smaller or
shortened, never spaced out; a number never leaves its unit (§4h-2) — `glue()` ties them with U+00A0;
no shape is invented behind a line of type (§4k) — the card and og write into a field `measure.py`
proved is empty, and the plate's band is a composed surface of its own, not a patch laid over the art.

  python3 tools/plates/build.py --strings data/plates/lines.json --masters <dir> --out rendered/
"""
import argparse, json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, 'fonts', 'Nunito[wght].ttf')  # one family on the surface (§4h)
INK = (0x36, 0x36, 0x36)
PAPER = (0xF7, 0xF5, 0xF2)
GREIGE = (0xEF, 0xEB, 0xE7)
NAVY = (0x1F, 0x2A, 0x3E)
TEAL = (0x1B, 0x5F, 0x56)
LINE = (0xD6, 0xCF, 0xC7)
NBSP = ' '

CARD_W, CARD_H = 1440, 960
OG_W, OG_H = 1200, 630
PLATE_W, PLATE_H = 2400, 1800          # 4:3 — the 16:9 frame plus its band
FRAME_H = 1350                          # the accepted infographic, untouched
BAND_H = PLATE_H - FRAME_H              # 450 px of brand paper, composed, never laid over the art


def face(size, weight):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    return f


def covered(text):
    """A glyph that does not exist is a hole in the page, not a small flaw — check before setting."""
    from fontTools.ttLib import TTFont
    t = TTFont(FONT, fontNumber=0)
    cps = set()
    for tb in t['cmap'].tables:
        cps |= set(tb.cmap.keys())
    return [c for c in text if ord(c) not in cps and c not in ' \n\t']


def glue(s):
    """§4h-2: a number never separates from its unit, and its digit groups never break apart."""
    s = re.sub(r'(\d)\s+(%|°C|г|мг|мл|ч|дн|CFU|KB|MB|g|mg|ml|h|d)\b', r'\1' + NBSP + r'\2', s)
    s = re.sub(r'(\d)\s+(\d{3})\b', r'\1' + NBSP + r'\2', s)
    s = re.sub(r'\b(из|of|per|на)\s+(\d)', r'\1' + NBSP + r'\2', s)
    return s


def wrap(draw, text, font, width):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= width or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def fit(draw, text, box_w, box_h, weight, start, floor_ratio=0.80, leading=1.18):
    """Shrink to fit — never track, never squeeze. Returns (font, lines) or None when the words are too many."""
    size = start
    while size >= int(start * floor_ratio):
        f = face(size, weight)
        ls = wrap(draw, text, f, box_w)
        if len(ls) * size * leading <= box_h and all(draw.textlength(l, font=f) <= box_w for l in ls):
            return f, ls
        size -= 2
    return None


def draw_block(img, box, text, weight, start, ink, align='left'):
    d = ImageDraw.Draw(img)
    x, y, w, h = box
    got = fit(d, glue(text), w, h, weight, start)
    if not got:
        return False
    f, lines = got
    lh = f.size * 1.18
    yy = y + (h - len(lines) * lh) / 2
    for l in lines:
        xx = x if align == 'left' else x + (w - d.textlength(l, font=f))
        d.text((xx, yy), l, font=f, fill=tuple(ink))
        yy += lh
    return True


def card_and_og(master, geo, question, out_card, out_og):
    im = Image.open(master).convert('RGB')
    if im.size != (CARD_W, CARD_H):
        im = im.resize((CARD_W, CARD_H), Image.LANCZOS)
    box = geo['box']
    ink = geo.get('ink', list(INK))
    card = im.copy()
    if not draw_block(card, box, question, 800, int(box[3] * 0.40), ink):
        return f'the question does not fit the measured field at the floor size — shorten the words, never the letters'
    card.save(out_card)

    # the social image is the centre band of the same frame, and the question is set again for its size
    band_top = int(CARD_H * 0.106)
    og = im.crop((0, band_top, CARD_W, band_top + int(CARD_W / 1.905))).resize((OG_W, OG_H), Image.LANCZOS)
    sx, sy = OG_W / CARD_W, OG_H / (CARD_W / 1.905)
    ob = [int(box[0] * sx), int((box[1] - band_top) * sy), int(box[2] * sx), int(box[3] * sy)]
    ob[1] = max(12, min(ob[1], OG_H - ob[3] - 12))
    if not draw_block(og, ob, question, 800, int(ob[3] * 0.42), ink):
        return 'the question does not fit the social band'
    og.save(out_og)
    return None


def plate(master, lines_text, out):
    """The accepted infographic keeps every pixel; the words sit on a band of the portal's own paper."""
    im = Image.open(master).convert('RGB')
    if im.size != (PLATE_W, FRAME_H):
        im = im.resize((PLATE_W, FRAME_H), Image.LANCZOS)
    sheet = Image.new('RGB', (PLATE_W, PLATE_H), PAPER)
    sheet.paste(im, (0, 0))
    d = ImageDraw.Draw(sheet)
    d.line([(0, FRAME_H), (PLATE_W, FRAME_H)], fill=LINE, width=3)

    parts = [p.strip() for p in lines_text.split('·') if p.strip()]
    pad = 90
    col_w = (PLATE_W - pad * 2 - 80 * (len(parts) - 1)) // max(1, len(parts))
    x = pad
    num_f = face(46, 700)
    for i, part in enumerate(parts, 1):
        d.text((x, FRAME_H + 78), f'{i}', font=num_f, fill=TEAL)
        ok = draw_block(sheet, [x + 62, FRAME_H + 66, col_w - 62, BAND_H - 150], part, 600, 54, list(INK))
        if not ok:
            return f'band line {i} does not fit — shorten it'
        x += col_w + 80
    sheet.save(out)
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--strings', required=True, help='json: slug -> {type, geometry, locales: {lang: {question, plateLines}}}')
    ap.add_argument('--masters', required=True, help='dir with <type>/<slug>/<slug>-card.png and -hero.png')
    ap.add_argument('--out', required=True)
    ap.add_argument('--only', nargs='*', default=[])
    a = ap.parse_args()
    data = json.load(open(a.strings))
    made = fails = 0
    for slug, t in data.items():
        if a.only and slug not in a.only:
            continue
        typ = t['type']
        od = os.path.join(a.out, typ, slug)
        os.makedirs(od, exist_ok=True)
        cm = os.path.join(a.masters, typ, slug, f'{slug}-card.png')
        hm = os.path.join(a.masters, typ, slug, f'{slug}-hero.png')
        for lang, s in t['locales'].items():
            if s.get('question'):
                miss = covered(s['question'])
                if miss:
                    print(f'GLYPH {slug} {lang}: the face has no {miss} — the line is not set (§4h: one family, no silent swap)')
                    fails += 1
                    continue
                if os.path.exists(cm):
                    err = card_and_og(cm, t['geometry'], s['question'], os.path.join(od, f'{slug}-card-{lang}.png'), os.path.join(od, f'{slug}-og-{lang}.png'))
                    if err:
                        print(f'FIT {slug} {lang}: {err}')
                        fails += 1
                    else:
                        made += 2
            if s.get('plateLines') and os.path.exists(hm):
                miss = covered(s['plateLines'])
                if miss:
                    print(f'GLYPH {slug} {lang} band: the face has no {miss}')
                    fails += 1
                    continue
                err = plate(hm, s['plateLines'], os.path.join(od, f'{slug}-plate-{lang}.png'))
                if err:
                    print(f'FIT {slug} {lang}: {err}')
                    fails += 1
                else:
                    made += 1
    print(f'plates: {made} files · {fails} refused')
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
