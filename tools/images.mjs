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
 *   out-dir receives <type>/<slug>/<files>; the upload plan (R2 key → file) is written to out-dir/upload-plan.json
 * R2 keys: mbf/<type>/<slug>/<file> on bucket dasexperten-images; public base https://pub-1d1b12958f2d4ea380276bd8d0a1ff02.r2.dev/
 */
import sharp from 'sharp';
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const [,, SRC, OUT] = process.argv;
if (!SRC || !OUT) { console.error('usage: node tools/images.mjs <masters-dir> <out-dir>'); process.exit(2); }
const R2_PUBLIC = 'https://pub-1d1b12958f2d4ea380276bd8d0a1ff02.r2.dev';
const plan = [];
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(png|jpe?g|webp)$/i.test(f) ? [p] : []; });

async function out(img, rel, opts) {
  const p = join(OUT, rel); mkdirSync(join(p, '..'), { recursive: true });
  await img.clone().resize(opts.w, opts.h, { fit: opts.fit || 'cover', position: 'centre', withoutEnlargement: false })[opts.fmt](opts.fmt === 'webp' ? { quality: 82 } : { quality: 84, mozjpeg: true }).toFile(p);
  const key = `mbf/${rel.replace(/\\/g, '/')}`;
  plan.push({ key, file: p, url: `${R2_PUBLIC}/${key}` });
}

for (const file of walk(SRC)) {
  const rel = file.slice(SRC.length + 1).replace(/\\/g, '/'); // <type>/<slug>/<name>
  const [type0, slug] = rel.split('/'); const type = type0 === 'news' ? 'articles' : type0; const name = basename(file, extname(file));
  const img = sharp(file); const meta = await img.metadata();
  const ratio = meta.width / meta.height;
  if (name.endsWith('-preview')) {
    if (Math.abs(ratio - 1.5) > 0.04) { console.error(`SKIP ${rel}: preview ratio ${ratio.toFixed(3)} is not 3:2 (born-native rule)`); continue; }
    await out(img, `${type}/${slug}/${slug}-preview.webp`, { w: 720, h: 480, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-preview@2x.webp`, { w: 1440, h: 960, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-preview.jpg`, { w: 720, h: 480, fmt: 'jpeg' });
    await out(img, `${type}/${slug}/${slug}-thumb.webp`, { w: 360, h: 240, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-og.jpg`, { w: 1200, h: 630, fmt: 'jpeg' }); // centre band of the 3:2 master
  } else if (name.endsWith('-hero')) {
    if (Math.abs(ratio - 16 / 9) > 0.04) { console.error(`SKIP ${rel}: hero ratio ${ratio.toFixed(3)} is not 16:9 (born-native rule)`); continue; }
    await out(img, `${type}/${slug}/${slug}-hero.webp`, { w: 1200, h: 675, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-hero@2x.webp`, { w: 2400, h: 1350, fmt: 'webp' });
    await out(img, `${type}/${slug}/${slug}-hero.jpg`, { w: 1200, h: 675, fmt: 'jpeg' });
  }
  console.log(`${rel}: ${meta.width}×${meta.height} (${ratio.toFixed(3)})`);
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'upload-plan.json'), JSON.stringify(plan, null, 2));
console.log(`${plan.length} derived files · plan at ${join(OUT, 'upload-plan.json')}`);
