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
  const preview = files[`${slug}-preview.webp`], hero = files[`${slug}-hero.webp`], og = files[`${slug}-og.jpg`];
  for (const f of readdirSync(dir)) {
    const mm = f.match(/^([a-zA-Z-]+)\.md$/); if (!mm || f.endsWith('.speech.md') || f === 'image-brief.md') continue;
    const lang = mm[1]; const p = join(dir, f); let txt = readFileSync(p, 'utf8');
    const a = alts[lang] || alts.en || {};
    const block = `images:\n  preview: "${preview || ''}"\n  hero: "${hero || ''}"\n  og: "${og || ''}"\n  previewAlt: "${(a.preview || '').replace(/"/g, '”')}"\n  heroAlt: "${(a.hero || '').replace(/"/g, '”')}"`;
    const re = /^images:\n(?:[ \t]+.*\n?)*/m;
    if (re.test(txt)) txt = txt.replace(re, block + '\n'); else txt = txt.replace(/^---\n/, `---\n${block}\n`);
    writeFileSync(p, txt); touched++;
  }
  console.log(`${cluster}: preview ${preview ? 'ok' : '—'} hero ${hero ? 'ok' : '—'} og ${og ? 'ok' : '—'}`);
}
console.log(`${touched} locale files updated`);
