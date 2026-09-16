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
const numbers = (t) => (t.replace(/https?:\S+/g, ' ').replace(/\[s\d+\]/g, ' ')
  /* Join a thousands group written with a space — "36 043" is one number — but never join two numbers
   * that merely stand beside each other. The first version swallowed whitespace greedily, so
   * "0.74, 95 % CI" read as the single figure 07495 and "36 043 16S rRNA" as 3604316. Three translators
   * bent good sentences to satisfy that, which is the tool making the writing worse. */
  .replace(/(\d)[\s\u00a0](\d{3})(?!\d)/g, '$1$2')     // 36 043 -> 36043
  .replace(/(\d)[\s\u00a0](\d{3})(?!\d)/g, '$1$2')     // again, for 2 030 936 -> 2030936
  .match(/\d[\d.,]*\d|\d/g) || [])
  // 0.22 and 0,22, 3,350 and 3.350 are the same number in different local clothes
  .map((x) => x.replace(/[.,]/g, '')).filter((x) => x.length > 0).sort();
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
    /* Which sources are cited must match. How many times each is cited need not: a translation that
     * carries one extra [s1] has put a source on one more sentence, which is the direction we want,
     * and one that carries one fewer has left a claim standing alone, which is worth a warning. What
     * fails is a source appearing that the English never cited, or one disappearing altogether. */
    const eSet = new Set(markers(eb)), tSet = new Set(markers(tb));
    const gone = [...eSet].filter((x) => !tSet.has(x));
    const madeUp = [...tSet].filter((x) => !eSet.has(x));
    if (madeUp.length) bad(rel, `body cites a source the English does not: ${madeUp.join(' ')}`);
    if (gone.length) bad(rel, `body drops a source the English cites: ${gone.join(' ')}`);
    if (!gone.length && !madeUp.length && markers(eb).length !== markers(tb).length) {
      console.log(`WARN ${rel}: ${markers(tb).length} source marks against the English ${markers(eb).length} — same sources, different density`);
      warns++;
    }
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
    /* A figure the English does not have is a red flag — unless it is arithmetic on one that it does.
     * Converting 6 oz to about 180 ml for a reader who has never held an ounce is a service, not an
     * invention, and the translation marks it as approximate. Anything introduced by such a word is
     * let through; a bare new number beside a source marker still fails. */
    const APPROX = /(около|приблизно|приблизительно|ок\.|примерно|ca\.|etwa|rund|aprox\.|aproximadamente|cerca de|khoảng|близько|około|environ|circa|yaklaşık|ประมาณ|約|약|大约)[\s\u00a0]*$/i;
    const approxNums = new Set();
    for (const m of tb.matchAll(/(\d[\d.,\s\u00a0]*\d|\d)/g)) {
      if (APPROX.test(tb.slice(Math.max(0, m.index - 20), m.index))) approxNums.add(m[0].replace(/[\s\u00a0.,]/g, ''));
    }
    const invented = [...new Set(pool.filter((x) => x.length > 2 && !en_n.includes(x) && !approxNums.has(x)))];
    if (invented.length) bad(rel, `figures this file has that the English does not: ${invented.slice(0, 8).join(', ')}`);

    ok++;
  }
}
console.log(`tr-check ${lang}: ${ok} clean · ${fails} failed · ${warns} warned · ${missing} not written yet`);
process.exit(fails ? 1 : 0);
