#!/usr/bin/env node
/* sweep.mjs — MB2 news sweep for the portal.
 * Reads content/sources/registry.json (the ONLY allowed source list — HARD_RULES §0b, §6d),
 * pulls PubMed (E-utilities, free, no key) and RSS rows with status on|pilot,
 * writes data/sweep/<date>.json. Every item carries the registry row id, a title, a URL that opens,
 * and (for PubMed) doi/pmid. Nothing is rewritten here — writing is Magnus's hand through blog-writer.
 * A row that fails is recorded as a gap, never faked.
 * Run: node src/sweep.mjs [--days 14] [--max 25]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1]] : []).filter((x) => x.length));
const DAYS = Number(args.days || 14), MAX = Number(args.max || 25);
const today = new Date().toISOString().slice(0, 10);
const registry = JSON.parse(readFileSync(join(ROOT, 'content/sources/registry.json'), 'utf8'));
const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const UA = 'microbiomefriendly-portal-sweep/0.1 (biome@dasexperten.com)';

async function pubmed(row) {
  const q = encodeURIComponent(row.query);
  const es = await fetch(`${EUTILS}/esearch.fcgi?db=pubmed&term=${q}&reldate=${DAYS}&datetype=edat&retmax=${MAX}&sort=date&retmode=json`, { headers: { 'user-agent': UA } }).then((r) => r.json());
  const ids = es.esearchresult?.idlist || [];
  if (!ids.length) return [];
  const sum = await fetch(`${EUTILS}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`, { headers: { 'user-agent': UA } }).then((r) => r.json());
  return ids.map((id) => {
    const d = sum.result?.[id]; if (!d) return null;
    const doi = (d.articleids || []).find((a) => a.idtype === 'doi')?.value || '';
    return { row: row.id, lane: row.lane, pmid: id, doi, title: d.title, journal: d.fulljournalname || d.source, date: d.sortpubdate?.slice(0, 10) || d.pubdate, url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`, authors: (d.authors || []).slice(0, 3).map((a) => a.name).join(', ') };
  }).filter(Boolean);
}

function xmlText(block, tag) { const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i')); return m ? m[1].trim() : ''; }
async function rss(row) {
  const txt = await fetch(row.url, { headers: { 'user-agent': UA } }).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); });
  const items = [...txt.matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)].map((m) => m[0]).slice(0, MAX);
  return items.map((b) => ({ row: row.id, lane: row.lane, title: xmlText(b, 'title'), url: xmlText(b, 'link') || (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || '', date: (xmlText(b, 'pubDate') || xmlText(b, 'published') || xmlText(b, 'updated')).slice(0, 25) })).filter((i) => i.title && i.url);
}

const out = { asOf: today, days: DAYS, items: [], gaps: [] };
for (const row of registry.rows) {
  if (!['on', 'pilot'].includes(row.status)) continue;
  try {
    const items = row.kind === 'pubmed' ? await pubmed(row) : row.kind === 'rss' ? await rss(row) : [];
    out.items.push(...items);
    console.log(`${row.id}: ${items.length}`);
  } catch (e) { out.gaps.push({ row: row.id, error: e.message }); console.log(`${row.id}: GAP — ${e.message}`); }
}
const seen = new Set(); out.items = out.items.filter((i) => { const k = i.doi || i.url; if (seen.has(k)) return false; seen.add(k); return true; });
mkdirSync(join(ROOT, 'data/sweep'), { recursive: true });
const file = join(ROOT, 'data/sweep', `${today}.json`);
writeFileSync(file, JSON.stringify(out, null, 2));
console.log(`wrote ${file}: ${out.items.length} items, ${out.gaps.length} gaps`);
