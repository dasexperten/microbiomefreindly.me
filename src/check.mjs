#!/usr/bin/env node
/* check.mjs — pre-publish gate, script half.
 * Source checks (content/) implement docs/SEO_BRIEF.md §5 and docs/GEO_BRIEF.md §6 where a script can decide;
 * rendered checks (dist/) verify what the build actually emitted.
 * Exit 1 on any FAIL. WARN lines do not block.
 * Run: node src/check.mjs   (after node src/build.mjs)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content'); const DIST = join(ROOT, 'dist');
const LOCALES = JSON.parse(readFileSync(join(ROOT, 'src/i18n/locales.json'), 'utf8'));
const CJK = new Set(['ja', 'ko', 'zh-Hans']); const CYR = new Set(['ru', 'uk', 'ar', 'th']);
let fails = 0, warns = 0;
const fail = (f, m) => { fails++; console.log(`FAIL ${f}: ${m}`); };
const warn = (f, m) => { warns++; console.log(`WARN ${f}: ${m}`); };
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

/* ---------- source checks ---------- */
for (const type of ['news', 'bacteria', 'hubs']) {
  const dir = join(CONTENT, type); if (!existsSync(dir)) continue;
  for (const slug of readdirSync(dir)) {
    const cdir = join(dir, slug); if (!statSync(cdir).isDirectory()) continue;
    for (const f of readdirSync(cdir)) {
      const mm = f.match(/^([a-zA-Z-]+)\.md$/); if (!mm || f.endsWith('.speech.md') || f === 'image-brief.md') continue;
      const lang = mm[1]; const rel = `${type}/${slug}/${f}`;
      if (!LOCALES.meta[lang]) { fail(rel, `unknown locale "${lang}"`); continue; }
      const raw = readFileSync(join(cdir, f), 'utf8');
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
      if (!m) { fail(rel, 'no front-matter'); continue; }
      let fm; try { fm = yaml.load(m[1], { schema: yaml.CORE_SCHEMA }) || {}; } catch (e) { fail(rel, `yaml: ${e.message}`); continue; }
      const body = m[2] || '';
      if (fm.status !== 'published') { console.log(`skip ${rel}: status ${fm.status || 'missing'}`); continue; }
      if (fm.slug && fm.slug !== slug) fail(rel, `slug "${fm.slug}" != folder "${slug}"`);
      if (fm.lang && fm.lang !== lang) fail(rel, `lang "${fm.lang}" != file "${lang}"`);
      const tl = (fm.title || '').length; const tcap = CJK.has(lang) ? 32 : CYR.has(lang) ? 55 : 60;
      if (!fm.title) fail(rel, 'no title'); else if (tl > tcap + 10) fail(rel, `title ${tl} chars > cap ${tcap}`); else if (tl > tcap) warn(rel, `title ${tl} chars > soft cap ${tcap}`);
      const ml = (fm.meta || '').length; const mcap = CYR.has(lang) ? 150 : 160;
      if (!fm.meta) fail(rel, 'no meta'); else if (ml > mcap) fail(rel, `meta ${ml} chars > ${mcap}`); else if (ml < 70 && !CJK.has(lang)) warn(rel, `meta short (${ml})`);
      if (fm.meta && fm.answer && fm.meta.trim() === fm.answer.trim()) warn(rel, 'meta equals answer (SEO §2.1: must differ from lead)');
      if (type !== 'hubs') {
        if (!fm.answer) fail(rel, 'no answer-first paragraph (GEO)'); else if (!CJK.has(lang) && words(fm.answer) > 60) fail(rel, `answer ${words(fm.answer)} words > 60`);
        if (!fm.asOf) fail(rel, 'no asOf date (§9c)');
        if (!Array.isArray(fm.sources) || !fm.sources.length) fail(rel, 'no sources');
        else for (const s of fm.sources) { if (!s.id || !s.name) fail(rel, `source row without id/name`); if (!s.doi && !s.pmid && !s.url) fail(rel, `source ${s.id} has no doi/pmid/url`); }
        const ids = new Set((fm.sources || []).map((s) => s.id));
        for (const ref of body.matchAll(/\[(s\d+)\]/g)) if (!ids.has(ref[1])) fail(rel, `marker [${ref[1]}] has no source row`);
        if (!(fm.faq || []).length) warn(rel, 'no FAQ block (GEO)');
        if (!(fm.keyFacts || []).length) warn(rel, 'no keyFacts block (GEO)');
        for (const k of fm.keyFacts || []) if (k.source && !ids.has(k.source)) fail(rel, `keyFact source ${k.source} missing`);
        const sc = String(fm.gates?.segmentCheck || '');
        if (!/^PASS/i.test(sc)) fail(rel, `published without segment-check PASS (gates.segmentCheck = "${sc}")`);
        if (!/^verified/i.test(String(fm.gates?.factCheck || ''))) fail(rel, `published without factCheck verified`);
        if (fm.referral?.product) { if (!fm.referral.mayaLog) fail(rel, 'referral without Maya log line (§4c)'); if (!fm.referral.benefitGate) fail(rel, 'referral without benefit-gate'); }
        // unsourced percentages in body: a "NN %" with no [sN] within the same paragraph
        for (const para of body.split(/\n\s*\n/)) { if (/\d\s?%/.test(para) && !/\[s\d+\]/.test(para) && !/^\s*(#|\|)/.test(para)) warn(rel, `paragraph with a % but no [sN] marker: "${para.slice(0, 60)}…"`); }
      }
      if (/^#\s/m.test(body)) fail(rel, 'body contains an H1 (#) — the build generates the H1');
      if (/made\s+in\s+germany/i.test(raw.replace(/\s+/g, ' '))) fail(rel, '"Made in Germany" is forbidden');
      if (type === 'bacteria' && !fm.entity?.latin) fail(rel, 'bacteria page without entity.latin');
    }
  }
}

/* ---------- rendered checks ---------- */
if (existsSync(join(DIST, 'build-manifest.json'))) {
  const man = JSON.parse(readFileSync(join(DIST, 'build-manifest.json'), 'utf8'));
  const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : []; });
  for (const p of walk(DIST)) {
    const html = readFileSync(p, 'utf8'); const rel = p.slice(DIST.length + 1).replace(/\\/g, '/');
    const h1 = (html.match(/<h1\b/g) || []).length; if (h1 !== 1) fail(rel, `${h1} <h1>`);
    if (!/<link rel="canonical" href="[^"]+">/.test(html)) fail(rel, 'no canonical');
    const canon = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1]; const og = html.match(/<meta property="og:url" content="([^"]+)">/)?.[1];
    if (canon && og && canon !== og) fail(rel, 'canonical != og:url');
    for (const j of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(j[1]); } catch { fail(rel, 'JSON-LD does not parse'); } }
    const hl = html.match(/hreflang="([^"]+)"/g) || []; const xd = hl.filter((h) => h.includes('x-default')).length;
    if (hl.length && xd !== 1) fail(rel, `x-default count ${xd}`);
    if (/hreflang="(vn|zh)"/.test(html)) fail(rel, 'forbidden hreflang code vn/zh');
    if (/letter-spacing:\s*0?\.\d|letter-spacing:\s*[1-9]/.test(html)) fail(rel, 'positive letter-spacing');
    if (/plex\s*mono/i.test(html)) fail(rel, 'IBM Plex Mono');
    for (const img of html.matchAll(/<img\b[^>]*>/g)) { if (!/alt="/.test(img[0])) fail(rel, `img without alt: ${img[0].slice(0, 60)}`); }
    // §4h-2 rendered: number + unit must be joined by NBSP inside prose
    const prose = html.match(/<div class="prose">([\s\S]*?)<\/div>\s*(<section|<\/div><\/article>)/)?.[1] || '';
    const bad = [...prose.matchAll(/(\d[\d.,]*) (%|CFU|mg|ml|weeks?|days?|months?)\b/g)];
    if (bad.length) fail(rel, `number split from unit by a plain space: "${bad[0][0]}"`);
  }
  console.log(`rendered: ${walk(DIST).length} html pages · locales live: ${man.liveLangs.join(' ')}`);
}
console.log(`check: ${fails} FAIL · ${warns} WARN`);
process.exit(fails ? 1 : 0);
