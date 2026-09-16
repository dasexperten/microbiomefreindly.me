#!/usr/bin/env node
/* shape.mjs — Otto's second hand: set a line in a script Pillow cannot shape.
 *
 * Pillow on this machine has FreeType but not raqm, so it draws Arabic letters unjoined and stacks
 * Thai marks wrongly, and Nunito carries no CJK at all. Rather than ship a broken line — or, worse,
 * a line nobody here can read to check — the text layer is set by the one shaping engine already on
 * this machine that is complete: the browser's. HarfBuzz does the joining, the bidi and the mark
 * placement; we keep every typographic law that matters.
 *
 *   letter-spacing: 0 always (§4h) · shrink to fit, never track · no shape behind a line (§4k):
 *   the page is transparent and only glyphs are painted · one family per script, declared, never
 *   a silent substitution.
 *
 * In:  a JSON array of jobs — {id, w, h, text, ink:[r,g,b], lang, dir, start, weight, align}
 * Out: <out>/<id>.png, each exactly w × h with an alpha channel, plus a report on stdout.
 *
 *   node tools/plates/shape.mjs jobs.json out/
 *
 * The boxes are stacked into one page and cut apart afterwards, so forty-four cards cost one browser
 * launch rather than forty-four.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const NUNITO = join(HERE, 'fonts', 'Nunito[wght].ttf');

/* One family per script, named out loud. Latin and Cyrillic stay on the portal's own Nunito so that
 * German and Ukrainian look like English and Russian; the rest take Noto, which is the same design
 * intent drawn for scripts Nunito never covered. */
const STACK = {
  ja: `'Noto Sans JP'`, ko: `'Noto Sans KR'`, 'zh-Hans': `'Noto Sans SC'`, zh: `'Noto Sans SC'`,
  th: `'Noto Sans Thai'`, ar: `'Noto Naskh Arabic'`,
};
const GF = {
  ja: 'Noto+Sans+JP:wght@400..900', ko: 'Noto+Sans+KR:wght@400..900', 'zh-Hans': 'Noto+Sans+SC:wght@400..900',
  zh: 'Noto+Sans+SC:wght@400..900', th: 'Noto+Sans+Thai:wght@400..900', ar: 'Noto+Naskh+Arabic:wght@400..700',
};

const jobs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const outDir = process.argv[3];
if (!jobs.length) { console.log('shape: nothing to do'); process.exit(0); }
mkdirSync(outDir, { recursive: true });

const families = [...new Set(jobs.map((j) => GF[j.lang]).filter(Boolean))];
const linkTag = families.length
  ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${families.map((f) => 'family=' + f).join('&')}&display=block">`
  : '';

const PAGE_W = Math.max(...jobs.map((j) => j.w));
let y = 0;
const placed = jobs.map((j) => { const p = { ...j, y }; y += j.h; return p; });
const PAGE_H = y;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

const html = `<!doctype html><meta charset="utf-8">${linkTag}
<style>
  html,body{margin:0;padding:0;background:transparent}
  /* the box is exactly the measured empty field; nothing is ever painted on it but glyphs */
  .box{position:absolute;left:0;overflow:hidden;display:flex;align-items:center;background:transparent}
  .box>span{display:block;width:100%;letter-spacing:0;font-synthesis:none;
            font-family:'NunitoLocal',system-ui,sans-serif;text-wrap:balance}
  @font-face{font-family:'NunitoLocal';src:url('file://${NUNITO}') format('truetype');font-weight:200 1000}
</style>
${placed.map((j) => `<div class="box" id="b${j.id}" style="top:${j.y}px;width:${j.w}px;height:${j.h}px">
  <span lang="${j.lang}" dir="${j.dir || 'ltr'}" style="${STACK[j.lang] ? `font-family:${STACK[j.lang]},'NunitoLocal',system-ui,sans-serif;` : ''}color:${rgb(j.ink)};font-weight:${j.weight};text-align:${j.align || (j.dir === 'rtl' ? 'right' : 'left')}">${esc(j.text)}</span>
</div>`).join('\n')}
<pre id="report" style="display:none"></pre>
<script>
document.fonts.ready.then(() => {
  const report = [];
  for (const j of ${JSON.stringify(placed.map((p) => ({ id: p.id, start: p.start, h: p.h })))}) {
    const box = document.getElementById('b' + j.id), span = box.firstElementChild;
    let size = j.start, fitted = false;
    const floor = Math.floor(j.start * 0.80);   // shrink this far and no further; then the words give way
    while (size >= floor) {
      span.style.fontSize = size + 'px';
      span.style.lineHeight = '1.18';
      if (span.scrollHeight <= j.h && span.scrollWidth <= box.clientWidth + 1) { fitted = true; break; }
      size -= 2;
    }
    if (!fitted) span.style.visibility = 'hidden';   // a line that does not fit is not shown at half-truth
    report.push({ id: j.id, size, fitted });
  }
  document.getElementById('report').textContent = JSON.stringify(report);
  document.title = 'ready';
});
</script>`;

const tmp = join(outDir, '_shape.html');
writeFileSync(tmp, html);
const prof = join(outDir, '_prof');
const shot = join(outDir, '_sheet.png');
const run = (extra) => {
  try {
    return execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
      `--user-data-dir=${prof}`, `--window-size=${PAGE_W},${PAGE_H}`,
      '--force-device-scale-factor=1', '--default-background-color=00000000',
      '--virtual-time-budget=20000', ...extra, `file://${tmp}`,
    ], { encoding: 'utf8', timeout: 180000, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) { return e.stdout || ''; }
};

const dom = run(['--dump-dom']);
const m = dom.match(/<pre id="report"[^>]*>([\s\S]*?)<\/pre>/);
const report = m ? JSON.parse(m[1].replace(/&quot;/g, '"')) : [];
run([`--screenshot=${shot}`]);
if (!existsSync(shot)) { console.error('shape: the browser produced no sheet'); process.exit(1); }

/* cut the sheet back into one file per job */
execFileSync('python3', ['-c', `
import json, sys
from PIL import Image
sheet = Image.open(${JSON.stringify(shot)}).convert('RGBA')
for j in json.loads(sys.argv[1]):
    sheet.crop((0, j['y'], j['w'], j['y'] + j['h'])).save(${JSON.stringify(outDir)} + '/' + j['id'] + '.png')
`, JSON.stringify(placed.map((p) => ({ id: p.id, y: p.y, w: p.w, h: p.h })))], { stdio: 'inherit' });

rmSync(prof, { recursive: true, force: true });
rmSync(tmp, { force: true });
rmSync(shot, { force: true });
const refused = report.filter((r) => !r.fitted);
console.log(JSON.stringify(report));
console.error(`shape: ${report.length - refused.length} set · ${refused.length} refused${refused.length ? ' (' + refused.map((r) => r.id).join(', ') + ')' : ''}`);
process.exit(refused.length ? 1 : 0);
