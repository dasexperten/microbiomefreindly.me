#!/usr/bin/env node
/* make-lines.mjs — one source of truth for every word that will be baked.
 *
 * The brief is where the words live (Magnus writes them, Roberta and Alexandra hold the register). This
 * tool only carries them to the plate builder together with the measured field, so the pixels and the
 * alt text can never drift apart: both are read from the same line of the same file.
 *
 *   node tools/plates/make-lines.mjs [--masters <dir>] > data/plates/lines.json
 *
 * The geometry comes from content/<type>/<slug>/overlay.json when measure.py has already proved the
 * field on the accepted master; a topic without it is written out with `geometry: null` and the builder
 * skips it — a word is never set into air nobody measured (§4k).
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { altsFromBrief } from '../alt-parse.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = ['bacteria', 'news', 'ask', 'myth', 'routine', 'hubs'];
const out = {};

for (const type of TYPES) {
  const dir = join(ROOT, 'content', type);
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir)) {
    const cdir = join(dir, slug);
    const brief = join(cdir, 'image-brief.md');
    if (!existsSync(brief)) continue;
    const alts = altsFromBrief(brief);
    const locales = {};
    for (const f of readdirSync(cdir)) {
      const m = f.match(/^([A-Za-z]{2}(?:-[A-Za-z]+)?)\.md$/);
      if (!m || f.endsWith('.speech.md')) continue;
      const lang = m[1];
      const a = alts[lang.toLowerCase()] || alts[lang] || {};
      if (!a.cardLine && !a.plateLines) continue;
      locales[lang] = { question: a.cardLine || '', plateLines: a.plateLines || '' };
    }
    if (!Object.keys(locales).length) continue;
    const geoPath = join(cdir, 'overlay.json');
    out[slug] = {
      type,
      geometry: existsSync(geoPath) ? JSON.parse(readFileSync(geoPath, 'utf8')) : null,
      locales,
    };
  }
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
console.error(`lines: ${Object.keys(out).length} topics · measured: ${Object.values(out).filter((t) => t.geometry).length}`);
