/* alt-check.mjs — report which briefs yield both alt texts, and print two samples. */
import { readdirSync, existsSync } from 'node:fs';
import { altsFromBrief } from './alt-parse.mjs';

let missing = 0, total = 0;
const only = process.argv.slice(2); // optional slugs: gate just these clusters, every locale file they carry
let localeMiss = 0;
for (const type of ['bacteria', 'news', 'hubs', 'ask', 'myth', 'routine']) {
  if (!existsSync(`content/${type}`)) continue;
  for (const slug of readdirSync(`content/${type}`)) {
    const p = `content/${type}/${slug}/image-brief.md`;
    if (!existsSync(p)) continue;
    total++;
    if (only.length && !only.includes(slug)) continue;
    const all = altsFromBrief(p); const a = all.en || {};
    if (!a.preview || !a.hero) { missing++; console.log('MISS', `${type}/${slug}`, JSON.stringify(a).slice(0, 90)); }
    for (const f of readdirSync(`content/${type}/${slug}`)) {
      const m = f.match(/^([a-z]{2}(?:-[a-z]+)?)\.md$/); if (!m || m[1] === 'en') continue;
      const l = all[m[1]] || {};
      if (!l.preview || !l.hero) { localeMiss++; console.log('MISS-LOCALE', `${type}/${slug}`, m[1]); }
      else if (/alexandra|from the en lines/i.test(l.preview + l.hero)) { localeMiss++; console.log('PLACEHOLDER', `${type}/${slug}`, m[1]); }
    }
  }
}
console.log(`briefs ${total} · missing ${missing} · locale gaps ${localeMiss}`);
if (only.length) process.exit(missing || localeMiss ? 1 : 0);
for (const s of ['bacteria/bacillus-coagulans', 'bacteria/akkermansia-muciniphila', 'news/vitamin-a-relay-gut-immunity']) {
  const a = altsFromBrief(`content/${s}/image-brief.md`).en || {};
  console.log(`\n${s}\n  preview: ${(a.preview || '-').slice(0, 130)}\n  hero:    ${(a.hero || '-').slice(0, 130)}`);
}
