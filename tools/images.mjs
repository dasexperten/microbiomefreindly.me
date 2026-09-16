#!/usr/bin/env node
/* images.mjs — derive the slot files from Lisa's accepted masters and print the R2 upload plan.
 * Slots (docs/BRAND_IMAGE_SPEC.md §1):
 *   preview  3:2    master 1440×960  → <slug>-preview.webp (720×480) · -preview@2x.webp (1440×960) · -preview.jpg (720×480)
 *   og       1.91:1 1200×630 jpg — the centre band of the preview master (allowed: no people / product in previews)
 *   hero     16:9   master 2400×1350 → <slug>-hero.webp (1200×675) · -hero@2x.webp (2400×1350) · -hero.jpg (1200×675)
 *   thumb    3:2    360×240 webp
 * Ratios are born native in generation; this script only scales. It never crops a preview into a hero or vice versa (§4f).
 * Usage: node tools/images.mjs <masters-dir> <out-dir>
 *   masters-dir holds <type>/<slug>/<slug>-preview.(png|jpg) and <slug>-hero.(png|jpg)
 *   the masters themselves go to R2 too, scaled to their master size: mbf/masters/<slug>/<slug>-preview-master.png (1440×960)
 *   and <slug>-hero-master.png (2400×1350). Engines that render on their own size grid (1536×1024, 1672×941) are scaled, never cropped.
 *   out-dir receives <type>/<slug>/<files>; the upload plan (R2 key → file) is written to out-dir/upload-plan.json
 * R2 keys: mbf/<type>/<slug>/<file> on bucket dasexperten-images; public base https://pub-1d1b12958f2d4ea380276bd8d0a1ff02.r2.dev/
 */
import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const [,, SRC, OUT] = process.argv;
const RENDERED = process.argv.includes('--rendered');
if (!SRC || !OUT) { console.error('usage: node tools/images.mjs <masters-dir> <out-dir>'); process.exit(2); }
const R2_PUBLIC = 'https://pub-1d1b12958f2d4ea380276bd8d0a1ff02.r2.dev';
const plan = [];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(png|jpe?g|webp)$/i.test(f) ? [p] : []; });

// weight caps per file, BRAND_IMAGE_SPEC §1 — quality steps down until the file fits; a file that cannot fit fails loudly
const CAP_KB = { 'card.webp': 120, 'card@2x.webp': 240, 'preview.webp': 110, 'preview@2x.webp': 220, 'preview.jpg': 110, 'og.jpg': 280, 'hero.webp': 170, 'hero@2x.webp': 340, 'hero.jpg': 170, 'plate.webp': 190, 'plate@2x.webp': 380, 'thumb.webp': 40 };
/* File names carry a locale since 2026-09-16 (…-card-ru@2x.webp), so the cap is found by parsing the
 * slot, never by a suffix match — a miss would silently ship an uncapped file. */
const SLOT_RE = /-(card|preview|hero|plate|og|thumb)(?:-[a-z0-9-]+?)?(@2x)?\.(webp|jpe?g|png)$/;
const slotKey = (rel) => { const m = basename(rel).match(SLOT_RE); return m ? `${m[1]}${m[2] || ''}.${m[3] === 'jpeg' ? 'jpg' : m[3]}` : null; };
/* baked type turns to mush below this quality — a frame that cannot fit is a geometry problem */
const MIN_Q = { 'card.webp': 66, 'card@2x.webp': 66, 'plate.webp': 66, 'plate@2x.webp': 66, 'og.jpg': 70 };
async function out(img, rel, opts) {
  const p = join(OUT, rel); mkdirSync(join(p, '..'), { recursive: true });
  const cap = CAP_KB[slotKey(rel)];
  const sized = img.clone().resize(opts.w, opts.h, { fit: opts.fit || 'cover', position: 'centre', withoutEnlargement: false });
  let q = opts.fmt === 'webp' ? 82 : 84; let buf;
  for (;;) {
    buf = await sized.clone()[opts.fmt](opts.fmt === 'webp' ? { quality: q } : opts.fmt === 'png' ? { compressionLevel: 9 } : { quality: q, mozjpeg: true }).toBuffer();
    if (!cap || buf.length <= cap * 1024) break;
    const floor = MIN_Q[slotKey(rel)] || 50;
    if (q <= floor) { console.error(`OVER CAP ${rel}: ${Math.round(buf.length / 1024)} KB > ${cap} KB at quality ${q}`); process.exitCode = 1; break; }
    q -= 4;
  }
  writeFileSync(p, buf);
  const key = `mbf/${rel.replace(/\\/g, '/')}`;
  plan.push({ key, file: p, url: `${R2_PUBLIC}/${key}` });
}

for (const file of walk(SRC)) {
  const rel = file.slice(SRC.length + 1).replace(/\\/g, '/'); // <type>/<slug>/<name>
  const [type0, slug] = rel.split('/'); const type = type0 === 'news' ? 'articles' : type0; const name = basename(file, extname(file));
  const stem = basename(file, extname(file));
  if (RENDERED) {
    /* A locale code may carry capitals — pt-BR, zh-Hans — but a served file never does: the page
     * gate looks for `-card-<lang.toLowerCase()>.`, and a capital in a URL is a 404 waiting to be
     * reported as "works on my machine". Match either spelling, write only the lower one. */
    const m = stem.match(/^(.+?)-(card|og|plate)-([A-Za-z0-9-]+)$/);
    if (!m) continue;
    const [, , slot] = m;
    const lang = m[3].toLowerCase();
    const img = sharp(file); const meta = await img.metadata();
    if (slot === 'card') {
      await out(img, `${type}/${slug}/${slug}-card-${lang}.webp`, { w: 720, h: 480, fmt: 'webp' });
      await out(img, `${type}/${slug}/${slug}-card-${lang}@2x.webp`, { w: 1440, h: 960, fmt: 'webp' });
    } else if (slot === 'og') {
      await out(img, `${type}/${slug}/${slug}-og-${lang}.jpg`, { w: 1200, h: 630, fmt: 'jpeg' });
    } else {
      await out(img, `${type}/${slug}/${slug}-plate-${lang}.webp`, { w: 1200, h: 900, fmt: 'webp' });
      await out(img, `${type}/${slug}/${slug}-plate-${lang}@2x.webp`, { w: 2400, h: 1800, fmt: 'webp' });
    }
    console.log(`${rel}: ${meta.width}×${meta.height} → ${slot} ${lang}`);
    continue;
  }
  if (!/-(preview|hero|card)$/.test(stem)) continue; // raw engine files and notes are not masters
  const img = sharp(file); const meta = await img.metadata();
  const ratio = meta.width / meta.height;
  if (name.endsWith('-card')) {
    if (Math.abs(ratio - 1.5) > 0.04) { console.error(`SKIP ${rel}: card ratio ${ratio.toFixed(3)} is not 3:2 (born-native rule)`); continue; }
    await out(img, `masters/${slug}/${slug}-card-master.png`, { w: 1440, h: 960, fmt: 'png' });
  } else if (name.endsWith('-preview')) {
    if (Math.abs(ratio - 1.5) > 0.04) { console.error(`SKIP ${rel}: preview ratio ${ratio.toFixed(3)} is not 3:2 (born-native rule)`); continue; }
    await out(img, `masters/${slug}/${slug}-preview-master.png`, { w: 1440, h: 960, fmt: 'png' });
    await out(img, `${type}/${slug}/${slug}-preview.webp`, { w: 720, h: 480, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-preview@2x.webp`, { w: 1440, h: 960, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-preview.jpg`, { w: 720, h: 480, fmt: 'jpeg' });
    await out(img, `${type}/${slug}/${slug}-thumb.webp`, { w: 360, h: 240, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-og.jpg`, { w: 1200, h: 630, fmt: 'jpeg' }); // centre band of the 3:2 master
  } else if (name.endsWith('-hero')) {
    if (Math.abs(ratio - 16 / 9) > 0.04) { console.error(`SKIP ${rel}: hero ratio ${ratio.toFixed(3)} is not 16:9 (born-native rule)`); continue; }
    await out(img, `masters/${slug}/${slug}-hero-master.png`, { w: 2400, h: 1350, fmt: 'png' });
    await out(img, `${type}/${slug}/${slug}-hero.webp`, { w: 1200, h: 675, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-hero@2x.webp`, { w: 2400, h: 1350, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-hero.jpg`, { w: 1200, h: 675, fmt: 'jpeg' });
  }
  console.log(`${rel}: ${meta.width}×${meta.height} (${ratio.toFixed(3)})`);
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'upload-plan.json'), JSON.stringify(plan, null, 2));
console.log(`${plan.length} derived files · plan at ${join(OUT, 'upload-plan.json')}`);
