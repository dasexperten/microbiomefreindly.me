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
import argparse, json, os, re, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

# Scripts this machine's Pillow cannot set honestly: it has FreeType but no raqm, so Arabic comes out
# unjoined and Thai marks land wrong, and Nunito carries no CJK at all. Those lines are set by
# tools/plates/shape.mjs — the browser's own shaping engine — and composited here. Same laws either
# way: zero tracking, shrink-to-fit, nothing painted behind a line.
SHAPED = {'ja', 'ko', 'zh-Hans', 'zh-hans', 'zh', 'th', 'ar'}
RTL = {'ar'}
DEFERRED = []   # {'img': Image, 'out': path, 'box': [...], 'job': {...}}

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
    """§4h-2: a number never separates from what it counts, and its digit groups never break apart.

    The brief may carry a real non-breaking space, but the alt parser collapses whitespace on the way
    out, so the join is re-applied here — at the last moment before the line is set, where it is true.
    """
    s = s.replace(' ', ' ')  # normalise, then re-join deliberately
    s = re.sub(r'(\d)\s+(\d{3})\b', r'\1' + NBSP + r'\2', s)            # 1 844
    s = re.sub(r'(\d[\d.,–—-]*)\s+([%°×]|[^\s.,;:·]{1,14})', lambda m: m.group(1) + NBSP + m.group(2), s)
    s = re.sub(r'\b(из|of|per|на)' + NBSP + r'?\s*(\d)', r'\1' + NBSP + r'\2', s)
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


def draw_block(img, box, text, weight, start, ink, align='left', lang=None, out=None):
    """Set a block of words into a measured box. Returns True when the line is set or queued."""
    if lang and lang.lower() in SHAPED:
        # queued for the browser: it shapes, we composite. The box travels unchanged, so the field
        # the measurement proved is the field the words land in.
        jid = 'j%04d' % len(DEFERRED)
        DEFERRED.append({'img': img, 'out': out, 'box': list(box), 'job': {
            'id': jid, 'w': box[2], 'h': box[3], 'text': glue(text), 'ink': list(ink),
            'lang': lang, 'dir': 'rtl' if lang.lower() in RTL else 'ltr',
            'start': start, 'weight': weight,
            'align': 'right' if lang.lower() in RTL else align,
        }})
        return True
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


def flush_shaped():
    """Hand every queued line to the browser at once, then composite and save."""
    if not DEFERRED:
        return 0
    with tempfile.TemporaryDirectory() as tmp:
        jf = os.path.join(tmp, 'jobs.json')
        with open(jf, 'w') as f:
            json.dump([d['job'] for d in DEFERRED], f)
        r = subprocess.run(['node', os.path.join(HERE, 'shape.mjs'), jf, tmp],
                           capture_output=True, text=True)
        try:
            report = {x['id']: x for x in json.loads(r.stdout.strip().splitlines()[-1])}
        except Exception:
            print('SHAPE: the browser returned nothing — ' + (r.stderr or '').strip()[:200])
            return len(DEFERRED)
        bad = 0
        for d in DEFERRED:
            jid = d['job']['id']
            layer = os.path.join(tmp, jid + '.png')
            if not report.get(jid, {}).get('fitted') or not os.path.exists(layer):
                print('FIT %s: the line does not fit its measured field — shorten the words' % d['out'])
                bad += 1
                continue
            lay = Image.open(layer).convert('RGBA')
            d['img'].paste(lay, (d['box'][0], d['box'][1]), lay)
            d['img'].save(d['out'])
        return bad


def card_and_og(master, geo, question, out_card, out_og, lang=None):
    im = Image.open(master).convert('RGB')
    if im.size != (CARD_W, CARD_H):
        im = im.resize((CARD_W, CARD_H), Image.LANCZOS)
    # the field was measured on the master; this surface may be a different size, so the box travels with it
    gw, gh = geo.get('size', [CARD_W, CARD_H])
    k = CARD_W / gw
    box = [int(v * k) for v in geo['box']]
    ink = geo.get('ink', list(INK))
    card = im.copy()
    if not draw_block(card, box, question, 800, int(box[3] * 0.40), ink, lang=lang, out=out_card):
        return f'the question does not fit the measured field at the floor size — shorten the words, never the letters'
    if not (lang and lang.lower() in SHAPED):
        card.save(out_card)

    # the social image is the centre band of the same frame, and the question is set again for its size
    band_top = int(CARD_H * 0.106)
    og = im.crop((0, band_top, CARD_W, band_top + int(CARD_W / 1.905))).resize((OG_W, OG_H), Image.LANCZOS)
    sx, sy = OG_W / CARD_W, OG_H / (CARD_W / 1.905)
    ob = [int(box[0] * sx), int((box[1] - band_top) * sy), int(box[2] * sx), int(box[3] * sy)]
    ob[1] = max(12, min(ob[1], OG_H - ob[3] - 12))
    ob[2] = min(int(ob[2] * 1.15), OG_W - ob[0] - 24)
    if not draw_block(og, ob, question, 800, int(ob[3] * 0.34), ink, lang=lang, out=out_og):
        return 'the question does not fit the social band'
    if not (lang and lang.lower() in SHAPED):
        og.save(out_og)
    return None


def plate(master, lines_text, out, lang=None):
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
    num_f = face(46, 700)
    rtl = bool(lang) and lang.lower() in RTL
    for i, part in enumerate(parts, 1):
        # a band is read in the direction of its language: in Arabic the first beat is the rightmost
        # column and its numeral stands to the right of the words it counts
        col = (len(parts) - i) if rtl else (i - 1)
        x = pad + col * (col_w + 80)
        nx = x + col_w - 34 if rtl else x
        tx = x if rtl else x + 62
        d.text((nx, FRAME_H + 78), f'{i}', font=num_f, fill=TEAL)
        ok = draw_block(sheet, [tx, FRAME_H + 66, col_w - 62, BAND_H - 150], part, 600, 54, list(INK),
                        lang=lang, out=out)
        if not ok:
            return f'band line {i} does not fit — shorten it'
        x += col_w + 80
    # a shaped band is saved once, after the browser has set all three of its lines
    if not (lang and lang.lower() in SHAPED):
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
            shaped = lang.lower() in SHAPED
            if s.get('question'):
                miss = [] if shaped else covered(s['question'])
                if miss:
                    print(f'GLYPH {slug} {lang}: the face has no {miss} — the line is not set (§4h: one family, no silent swap)')
                    fails += 1
                    continue
                if os.path.exists(cm):
                    err = card_and_og(cm, t['geometry'], s['question'], os.path.join(od, f'{slug}-card-{lang}.png'), os.path.join(od, f'{slug}-og-{lang}.png'), lang=lang)
                    if err:
                        print(f'FIT {slug} {lang}: {err}')
                        fails += 1
                    else:
                        made += 2
            if s.get('plateLines') and os.path.exists(hm):
                miss = [] if shaped else covered(s['plateLines'])
                if miss:
                    print(f'GLYPH {slug} {lang} band: the face has no {miss}')
                    fails += 1
                    continue
                err = plate(hm, s['plateLines'], os.path.join(od, f'{slug}-plate-{lang}.png'), lang=lang)
                if err:
                    print(f'FIT {slug} {lang}: {err}')
                    fails += 1
                else:
                    made += 1
    shaped_bad = flush_shaped()
    fails += shaped_bad
    print(f'plates: {made} files · {fails} refused' + (f' · {len(DEFERRED)} set by the browser' if DEFERRED else ''))
    sys.exit(1 if fails else 0)


if __name__ == '__main__':
    main()
