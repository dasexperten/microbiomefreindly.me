#!/usr/bin/env node
/* make-prompts.mjs — assemble the engine task for each character card from the brief and the casting sheet.
 *
 * The queue is not this tool's to reshuffle (§4e-1): the author named the moment in the brief, Marika named
 * the slot, the focus and the empty field, and the words below only carry those decisions to the engine in
 * one shape, so forty-four frames obey the same invariants. What the tool adds by itself is nothing.
 *
 *   node tools/plates/make-prompts.mjs > data/plates/cards-generate.json
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const TYPES = ['bacteria', 'news', 'ask', 'myth', 'routine', 'hubs'];

/* casting sheet: slug → { face, media, url } */
const cast = {};
for (const line of readFileSync(join(ROOT, 'docs/CASTING_CARDS_2026-09-16.md'), 'utf8').split('\n')) {
  const m = line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*(\S+)\s*\|\s*`?([0-9a-f-]{36})?`?/);
  if (m) cast[m[1].split('/')[1]] = { face: m[2].trim(), url: m[3].trim(), media: m[4] || '' };
}

/* The briefs come in two shapes — the 2026-09-02 fixed-column template and the marked-up one — so the
 * label is read either way, and a value wrapped onto the next lines is picked up with it. */
const field = (txt, label) => {
  const lines = txt.split('\n');
  const head = new RegExp(`^\\s*(?:[-*]\\s*)?(?:\\*\\*)?${label}[^:]*:?(?:\\*\\*)?\\s*:?\\s*(.*)$`, 'i');
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(head);
    if (!m) continue;
    let val = m[1].trim();
    for (let j = i + 1; j < lines.length; j++) {
      const nx = lines[j];
      if (!nx.trim() || /^\s*(?:[-*#]|\*\*)/.test(nx) || /^\s*[A-ZА-Я0-9][^:]{0,60}:\s/.test(nx)) break;
      val += ' ' + nx.trim();
    }
    val = val.replace(/^[:\s]+/, '').replace(/\*\*/g, '').trim();
    if (val) return val;
  }
  return '';
};

const BANS = 'Absolutely no text of any kind anywhere in the frame: no letters, no numerals, no signage, no labels, no packaging text, no watermark, no invented glyphs, nothing written on clothing, mugs, jars, packets or in the background. No product, no packaging, no bottle, no capsule, no pill, no sachet, no jar, no brand mark. No second person, no other face, no lab coat, no scrubs, no clinic, no hospital, no microscope. No medical horror. No black background, no neon, no studio gloss. The photograph fills the whole frame edge to edge: no letterbox, no bars, no border, no frame within the frame, no vignette.';

const out = {};
for (const type of TYPES) {
  const dir = join(ROOT, 'content', type);
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir)) {
    const bp = join(dir, slug, 'image-brief.md');
    if (!existsSync(bp)) continue;
    const txt = readFileSync(bp, 'utf8');
    const person = field(txt, 'Card \\(person');
    const scene = field(txt, 'Card scene');
    const wardrobe = field(txt, 'Wardrobe and place');
    const empty = field(txt, 'EMPTY FIELD');
    const c = cast[slug];
    if (!person || !scene || !empty) { console.error(`SKIP ${type}/${slug}: brief has no card block yet`); continue; }
    if (!c) { console.error(`SKIP ${type}/${slug}: no row in the casting sheet`); continue; }
    const who = person.replace(/^`?[A-Za-z0-9_()\- ]+`?\s*from\s*`?refs\/characters\/`?\s*[—·:-]*\s*/i, '').replace(/`/g, '').trim();
    out[slug] = {
      type,
      face: c.face,
      media: c.media,
      url: c.url,
      prompt: [
        `The person in the reference photograph, same face, same age, same hair, one person only and nobody else in the frame: ${who}`,
        `The moment: ${scene}`,
        `Wardrobe and place: ${wardrobe}`,
        `The empty field, kept clear on purpose: ${empty}`,
        'That person stands or sits on the opposite third of the frame from the empty field, head and shoulders inside the middle horizontal band, the top and bottom eleventh of the frame left as air.',
        'Photographic and matte, natural skin, one light source, shallow depth of field on the person with the empty field softly out of focus; ground, wall and cloth in warm greige #EFEBE7 to paper #F7F5F2, at most one quiet accent colour in the whole frame. Landscape 3:2 composition, born at that ratio.',
        BANS,
      ].join(' '),
    };
  }
}
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
console.error(`prompts: ${Object.keys(out).length}`);
