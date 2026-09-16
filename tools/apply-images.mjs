#!/usr/bin/env node
/* apply-images.mjs — after Marika's acceptance and the R2 upload, write the image URLs and alt texts into
 * every locale file of the cluster. Reads the upload plan (tools/images.mjs) and the alt texts from the
 * article's image-brief.md (field 10: lines like `- en preview (…): "…"` / `- ru hero: "…"`).
 * Usage: node tools/apply-images.mjs <out-dir-with-upload-plan.json> [--local] [slug …]
 *   --local  serve through the portal's own domain (BRAND_IMAGE_SPEC §1): copy the derived files into
 *            src/assets/img/mbf/… and write /assets/img/mbf/… paths. R2 keeps the same files and the masters as storage.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { altsFromBrief } from './alt-parse.mjs';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [,, OUT, ...rest] = process.argv;
const LOCAL = rest.includes('--local'); const only = rest.filter((a) => a !== '--local');
const plan = JSON.parse(readFileSync(join(OUT, 'upload-plan.json'), 'utf8'));
const byCluster = {};
for (const r of plan) { const m = r.key.match(/^mbf\/(articles|bacteria|hubs|ask|myth|routine)\/([^/]+)\/(.+)$/); if (!m) continue; const type = m[1] === 'articles' ? 'news' : m[1]; let url = r.url;
  if (LOCAL) { const dst = join(ROOT, 'src/assets/img', r.key); mkdirSync(dirname(dst), { recursive: true }); copyFileSync(r.file, dst); url = `/assets/img/${r.key}`; }
  (byCluster[`${type}/${m[2]}`] ||= {})[m[3]] = url; }

let touched = 0;
for (const [cluster, files] of Object.entries(byCluster)) {
  const [type, slug] = cluster.split('/');
  if (only.length && !only.includes(slug)) continue;
  const dir = join(ROOT, 'content', type, slug); if (!existsSync(dir)) { console.warn(`no folder ${cluster}`); continue; }
  const alts = altsFromBrief(join(dir, 'image-brief.md'));
  const preview = files[`${slug}-preview.webp`], hero = files[`${slug}-hero.webp`];
  for (const f of readdirSync(dir)) {
    const mm = f.match(/^([a-zA-Z-]+)\.md$/); if (!mm || f.endsWith('.speech.md') || f === 'image-brief.md') continue;
    const lang = mm[1]; const p = join(dir, f); let txt = readFileSync(p, 'utf8');
    const lc = lang.toLowerCase();
    const a = alts[lc] || alts[lang] || alts.en || {};
    if (!alts[lc] && !alts[lang]) console.warn(`  no alt block for ${cluster} ${lang} — English text would be written; skipped`);
    /* per-locale files carry the locale in the name; the shared, text-free frames do not */
    const card = files[`${slug}-card-${lc}.webp`] || '';
    const og = files[`${slug}-og-${lc}.jpg`] || files[`${slug}-og.jpg`] || '';
    const plate = files[`${slug}-plate-${lc}.webp`] || '';
    const q = (v) => (v || '').replace(/"/g, '”');
    const block = [
      'images:',
      `  card: "${card}"`,
      `  cardLine: "${q(a.cardLine)}"`,
      `  cardAlt: "${q(a.card)}"`,
      `  og: "${og}"`,
      `  preview: "${preview || ''}"`,
      `  previewAlt: "${q(a.preview)}"`,
      `  plate: "${plate}"`,
      `  plateLines: "${q(a.plateLines)}"`,
      `  hero: "${hero || ''}"`,
      `  heroAlt: "${q(a.hero)}"`,
    ].join('\n');
    const re = /^images:\n(?:[ \t]+.*\n?)*/m;
    if (re.test(txt)) txt = txt.replace(re, block + '\n'); else txt = txt.replace(/^---\n/, `---\n${block}\n`);
    writeFileSync(p, txt); touched++;
  }
  console.log(`${cluster}: preview ${preview ? 'ok' : '—'} hero ${hero ? 'ok' : '—'} card ${Object.keys(files).some((k) => k.includes('-card-')) ? 'ok' : '—'} plate ${Object.keys(files).some((k) => k.includes('-plate-')) ? 'ok' : '—'}`);
}
console.log(`${touched} locale files updated`);
