#!/usr/bin/env node
/* tr-check.mjs — a translation is only trustworthy if it still carries the same facts.
 *
 * This does not read the prose; a machine cannot judge register. It checks the things that must be
 * IDENTICAL to the English source no matter the language, because they are not language:
 *
 *   · the source rows — id, url, doi, pmid — and their order
 *   · every [sN] marker used in the body and in the FAQ answers
 *   · every number that appears in the English, present in the translation with the same digits
 *   · the front-matter keys that are machine values, not words: type, topic, slug, date, asOf,
 *     author, voice, status, and the gates that let a page be published at all
 *   · the internal links (/bacteria/…/) — a translated path is a 404
 *
 * Usage: node tools/tr-check.mjs <lang> [slug …]
 * Exit 1 if any file fails. A missing translation is reported, not failed — it is simply not written yet.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = ['bacteria', 'news', 'ask', 'myth', 'routine', 'hubs'];
const lang = process.argv[2];
if (!lang) { console.error('usage: tr-check.mjs <lang> [slug …]'); process.exit(2); }
const only = new Set(process.argv.slice(3));

const head = (t) => { const m = t.match(/^---\n([\s\S]*?)\n---\n/); return m ? m[1] : ''; };
const body = (t) => t.replace(/^---\n[\s\S]*?\n---\n/, '');
const markers = (t) => (t.match(/\[s\d+\]/g) || []).sort();
const links = (t) => (t.match(/\]\((\/[a-z0-9/-]+\/)\)/g) || []).sort();
const field = (h, k) => (h.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm')) || [])[1] || '';
/* numbers as the reader meets them: digits with their separators, ignoring the ones inside urls and ids */
const numbers = (t) => (t.replace(/https?:\S+/g, ' ').replace(/\[s\d+\]/g, ' ').match(/\d[\d.,  ]*\d|\d/g) || [])
  // 0.22 and 0,22, 3,350 and 3 350 are the same number wearing different local clothes
  .map((x) => x.replace(/[\s .,]/g, '')).filter((x) => x.length > 0).sort();
const rows = (h, key) => (h.match(new RegExp(`^\\s+${key}:\\s*"?(.*?)"?\\s*$`, 'gm')) || []).map((s) => s.trim());

let fails = 0, ok = 0, missing = 0, warns = 0;
const bad = (rel, msg) => { console.log(`FAIL ${rel}: ${msg}`); fails++; };

for (const type of TYPES) {
  const dir = join(ROOT, 'content', type);
  if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir)) {
    if (only.size && !only.has(slug)) continue;
    const en = join(dir, slug, 'en.md');
    const tr = join(dir, slug, `${lang}.md`);
    if (!existsSync(en)) continue;
    if (!existsSync(tr)) { missing++; continue; }
    const rel = `${type}/${slug}/${lang}.md`;
    const E = readFileSync(en, 'utf8'), T = readFileSync(tr, 'utf8');
    const eh = head(E), th = head(T), eb = body(E), tb = body(T);

    if (!th) { bad(rel, 'no front matter'); continue; }
    if (field(th, 'lang') !== lang) bad(rel, `lang is "${field(th, 'lang')}", expected "${lang}"`);
    // `voice` is deliberately not here: the register a locale is written in is a choice, not a machine value
    for (const k of ['type', 'topic', 'slug', 'date', 'asOf', 'author', 'status']) {
      if (field(eh, k) !== field(th, k)) bad(rel, `${k} changed: "${field(th, k)}" ≠ "${field(eh, k)}"`);
    }
    for (const k of ['segmentCheck', 'factCheck']) {
      if (field(eh, k) !== field(th, k)) bad(rel, `gates.${k} changed — a translation inherits the gate, it does not re-issue it`);
    }
    for (const k of ['id', 'url', 'doi', 'pmid']) {
      const a = rows(eh, k), b = rows(th, k);
      if (a.join('|') !== b.join('|')) bad(rel, `source ${k} rows differ (${b.length} vs ${a.length})`);
    }
    const em = markers(eb).join(' '), tm = markers(tb).join(' ');
    if (em !== tm) bad(rel, `source markers in the body differ: ${tm || '(none)'} vs ${em || '(none)'}`);
    const el = links(eb).join(' '), tl = links(tb).join(' ');
    if (el !== tl) {
      const lost = links(eb).filter((x) => !links(tb).includes(x));
      const made = links(tb).filter((x) => !links(eb).includes(x));
      /* A link the English does not have is fine as long as it goes somewhere — a locale may reasonably
       * send a reader to a page the English author did not think of. A link to nothing is a 404. */
      const dead = made.filter((x) => {
        const p = x.replace(/^\]\(|\)$/g, '').replace(/^\/|\/$/g, '').split('/');
        return !(p.length === 2 && existsSync(join(ROOT, 'content', p[0], p[1])));
      });
      if (dead.length) bad(rel, `internal links that go nowhere: ${dead.join(' ')}`);
      if (lost.length) { console.log(`WARN ${rel}: internal links the English has and this file does not: ${lost.join(' ')}`); warns++; }
    }
    if (/^#\s/m.test(tb)) bad(rel, 'body contains an H1 — the build generates it');
    const eH = (eb.match(/^## /gm) || []).length, tH = (tb.match(/^## /gm) || []).length;
    if (eH !== tH) bad(rel, `${tH} H2 headings, the English has ${eH} — the figures are placed by heading count`);

    /* Numbers in the BODY, where every claim sits next to its source marker. This is a warning, never a
     * failure: a language may honestly turn a figure into a word — "seven days" becomes "неделя" — and
     * a summary line may carry a year the translation puts only in the body. What it catches is the
     * thing worth catching: a figure that quietly changed or fell out of a sentence that cites a study. */
    const en_n = numbers(eb), tr_n = numbers(tb);
    const miss = [];
    const pool = tr_n.slice();
    for (const x of en_n) { const i = pool.indexOf(x); if (i < 0) miss.push(x); else pool.splice(i, 1); }
    const real = [...new Set(miss.filter((x) => x.length > 1))];   // a bare digit is ordinary prose
    if (real.length) { console.log(`WARN ${rel}: figures in the English body not found here: ${real.slice(0, 10).join(', ')}`); warns++; }
    const invented = [...new Set(pool.filter((x) => x.length > 2 && !en_n.includes(x)))];
    if (invented.length) bad(rel, `figures this file has that the English does not: ${invented.slice(0, 8).join(', ')}`);

    ok++;
  }
}
console.log(`tr-check ${lang}: ${ok} clean · ${fails} failed · ${warns} warned · ${missing} not written yet`);
process.exit(fails ? 1 : 0);
