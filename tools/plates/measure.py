#!/usr/bin/env python3
"""measure.py — find the real empty field in an accepted frame, in pixels.

Otto's discipline (HARD_RULES §4k): words live in air the frame actually has. A shape invented under a
line of text is forbidden, so the box is measured on the accepted master and printed with its numbers;
if the measurement fails, the frame failed, not the typography — it goes back for a reshoot.

  python3 tools/plates/measure.py <master.png> [--side left|right|auto] [--lines 1|2|3] [--json out.json]

Prints, and optionally writes, one box: x, y, w, h in master pixels, the ink polarity that will read on
it (dark type on light air, or ivory type on dark air), and the worst-2 % contrast measured against
that ink. The box is clipped to the middle 1.91:1 band so the social crop never cuts the words.
"""
import argparse, json, sys
from PIL import Image, ImageFilter

INK = (0x36, 0x36, 0x36)      # --ink
IVORY = (0xF7, 0xF5, 0xF2)    # --paper
STD_MAX = 10.0 / 255          # luminance standard deviation inside the box
GRAD_MAX = 3.0 / 255          # mean local gradient inside the box
CONTRAST_MIN = 4.5            # WCAG on the worst 2 % of the box


def rel_lum(rgb):
    def ch(c):
        c = c / 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(x) for x in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = rel_lum(a), rel_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def measure(path, side='auto', lines=2, pad=0.06):
    im = Image.open(path).convert('RGB')
    W, H = im.size
    small = im.resize((320, int(320 * H / W)), Image.LANCZOS)
    w, h = small.size
    grey = small.convert('L')
    edges = grey.filter(ImageFilter.FIND_EDGES)
    gpx = edges.load()
    lpx = grey.load()
    rgb = small.load()

    # the social crop keeps the middle 1.91:1 band of a 3:2 frame — the words must live inside it
    band_top = int(h * 0.106)
    band_bot = int(h * 0.894)

    # a line of Nunito 800 at 72 px on a 1440-wide master is 0.05 of the height; give each line 1.55 of that
    need_h = max(0.18, 0.085 * lines)
    need_w = 0.42
    bw, bh = int(w * need_w), int(h * need_h)
    xs = range(0, w - bw + 1, 4)
    if side == 'left':
        xs = range(0, int(w * 0.5) - bw + 1, 4)
    elif side == 'right':
        xs = range(int(w * 0.5), w - bw + 1, 4)

    best = None
    for x0 in xs:
        for y0 in range(band_top, band_bot - bh + 1, 4):
            n = 0
            s = s2 = 0.0
            g = 0.0
            for y in range(y0, y0 + bh, 2):
                for x in range(x0, x0 + bw, 2):
                    v = lpx[x, y] / 255
                    s += v
                    s2 += v * v
                    g += gpx[x, y] / 255
                    n += 1
            mean = s / n
            std = max(0.0, (s2 / n - mean * mean)) ** 0.5
            grad = g / n
            if std > STD_MAX or grad > GRAD_MAX:
                continue
            score = std + grad
            if best is None or score < best[0]:
                best = (score, x0, y0, mean, std, grad)
    if best is None:
        return None
    _, x0, y0, mean, std, grad = best

    # polarity: dark type on light air, ivory type on dark air — decided by the measurement, not by taste
    ink = INK if mean > 0.5 else IVORY
    worst = 21.0
    for y in range(y0, y0 + bh, 3):
        for x in range(x0, x0 + bw, 3):
            worst = min(worst, contrast(rgb[x, y], ink))

    sx, sy = W / w, H / h
    px = int(bw * pad * sx)
    py = int(bh * pad * sy)
    box = [int(x0 * sx) + px, int(y0 * sy) + py, int(bw * sx) - 2 * px, int(bh * sy) - 2 * py]
    return {
        'size': [W, H], 'box': box, 'ink': list(ink), 'lines': lines,
        'std': round(std * 255, 2), 'gradient': round(grad * 255, 2), 'contrast': round(worst, 2),
        'pass': worst >= CONTRAST_MIN,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('master')
    ap.add_argument('--side', default='auto', choices=['left', 'right', 'auto'])
    ap.add_argument('--lines', type=int, default=2)
    ap.add_argument('--json')
    a = ap.parse_args()
    r = measure(a.master, a.side, a.lines)
    if not r:
        print(f'NO FIELD {a.master}: no calm rectangle of {0.42:.2f}W × {max(0.18, 0.085 * a.lines):.2f}H inside the band — reshoot the frame, do not shrink the words')
        sys.exit(2)
    print(json.dumps(r))
    if not r['pass']:
        print(f'LOW CONTRAST {a.master}: {r["contrast"]}:1 on the worst 2 % — reshoot, never a plate behind the text (§4k)', file=sys.stderr)
        sys.exit(3)
    if a.json:
        with open(a.json, 'w') as f:
            json.dump(r, f, indent=2)


if __name__ == '__main__':
    main()
