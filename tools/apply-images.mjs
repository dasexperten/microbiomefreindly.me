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
    /* The warning below used to say "skipped" and then write English over the locale's own words
     * anyway. With several translators in the same tree that is silent data loss: an Arabic file had
     * its alts replaced by English in the minute between the article landing and its brief lines
     * being appended. A locale with no alt block is now genuinely left alone. */
    const a = alts[lc] || alts[lang];
    if (!a) { console.warn(`  no alt block for ${cluster} ${lang} — left untouched, nothing of its own would be written`); continue; }
    /* per-locale files carry the locale in the name; the shared, text-free frames do not */
    const card = files[`${slug}-card-${lc}.webp`] || '';
    const og = files[`${slug}-og-${lc}.jpg`] || files[`${slug}-og.jpg`] || '';
    const plate = files[`${slug}-plate-${lc}.webp`] || '';
    const q = (v) => (v || '').replace(/"/g, '”');
    /* merge, never replace: a run that carries only the card must not erase the two frames that are
     * already accepted and wired (the block is rebuilt whole, so the old values are read back first) */
    const prev = {};
    const had = txt.match(/^images:\n((?:[ \t]+.*\n)*)/m);
    if (had) for (const l of had[1].split('\n')) { const kv = l.match(/^\s+([A-Za-z]+):\s*"?(.*?)"?\s*$/); if (kv) prev[kv[1]] = kv[2]; }
    const keep = (k, v) => (v || prev[k] || '');
    const block = [
      'images:',
      `  card: "${keep('card', card)}"`,
      `  cardLine: "${q(a.cardLine) || prev.cardLine || ''}"`,
      `  cardAlt: "${q(a.card) || prev.cardAlt || ''}"`,
      `  og: "${keep('og', og)}"`,
      `  preview: "${keep('preview', preview)}"`,
      `  previewAlt: "${q(a.preview) || prev.previewAlt || ''}"`,
      `  plate: "${keep('plate', plate)}"`,
      `  plateLines: "${q(a.plateLines) || prev.plateLines || ''}"`,
      `  hero: "${keep('hero', hero)}"`,
      `  heroAlt: "${q(a.hero) || prev.heroAlt || ''}"`,
    ].join('\n');
    const re = /^images:\n(?:[ \t]+.*\n?)*/m;
    if (re.test(txt)) txt = txt.replace(re, block + '\n'); else txt = txt.replace(/^---\n/, `---\n${block}\n`);
    writeFileSync(p, txt); touched++;
  }
  console.log(`${cluster}: preview ${preview ? 'ok' : '—'} hero ${hero ? 'ok' : '—'} card ${Object.keys(files).some((k) => k.includes('-card-')) ? 'ok' : '—'} plate ${Object.keys(files).some((k) => k.includes('-plate-')) ? 'ok' : '—'}`);
}
console.log(`${touched} locale files updated`);
