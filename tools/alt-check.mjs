/* alt-check.mjs — report which briefs yield both alt texts, and print two samples. */
import { readdirSync, existsSync } from 'node:fs';
import { altsFromBrief } from './alt-parse.mjs';

let missing = 0, total = 0;
for (const type of ['bacteria', 'news', 'hubs']) {
  if (!existsSync(`content/${type}`)) continue;
  for (const slug of readdirSync(`content/${type}`)) {
    const p = `content/${type}/${slug}/image-brief.md`;
    if (!existsSync(p)) continue;
    total++;
    const a = altsFromBrief(p).en || {};
    if (!a.preview || !a.hero) { missing++; console.log('MISS', `${type}/${slug}`, JSON.stringify(a).slice(0, 90)); }
  }
}
console.log(`briefs ${total} · missing ${missing}`);
for (const s of ['bacteria/bacillus-coagulans', 'bacteria/akkermansia-muciniphila', 'news/vitamin-a-relay-gut-immunity']) {
  const a = altsFromBrief(`content/${s}/image-brief.md`).en || {};
  console.log(`\n${s}\n  preview: ${(a.preview || '-').slice(0, 130)}\n  hero:    ${(a.hero || '-').slice(0, 130)}`);
}
