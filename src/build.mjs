#!/usr/bin/env node
/* build.mjs — static site generator for the Microbiome Friendly portal.
 *
 * content/<type>/<slug>/<lang>.md  →  dist/[<lang>/]<type>/<slug>.html
 * Rules encoded here (see docs/):
 *  - en is the root and x-default; other locales live under /<lang>/ (SEO_BRIEF §1)
 *  - hreflang lists ONLY locales whose file exists and is published (JF-MEM-260808-02, JW-055)
 *  - hubs and locale roots end with "/", leaves do not (SEO_BRIEF §1.3)
 *  - answer-first paragraph under H1, Key facts, FAQ, dated "as of", author entity (GEO_BRIEF)
 *  - numbers never split from their unit: NBSP inserted (HARD_RULES §4h-2)
 *  - two image slots: preview 3:2 (card / og band) and hero 16:9 (BRAND_IMAGE_SPEC)
 *  - JSON-LD: NewsArticle | Article, FAQPage, BreadcrumbList, Organization, Person
 *  - sitemap index + per-locale sitemaps, robots.txt, llms.txt per locale
 * Run: node src/build.mjs   (output in dist/)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { marked } from 'marked';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const DIST = join(ROOT, 'dist');
const ORIGIN = process.env.PORTAL_ORIGIN || 'https://microbiomefriendly-portal.pages.dev';
const BRAND = 'Microbiome Friendly';
const BUILD_DATE = process.env.BUILD_DATE || new Date().toISOString().slice(0, 10);
const AUTHOR = {
  name: 'Magnus Larsen', slug: 'magnus-larsen', role: 'Microbiologist · Science Blogger',
  avatar: 'https://org.dasexperten.com/assets/agents/magnus-larsen.png',
  url: `${ORIGIN}/about`,
};
const BRAND_SITE = 'https://microbiomefriendly.me';
const LOCALES = JSON.parse(readFileSync(join(ROOT, 'src/i18n/locales.json'), 'utf8'));
const UI = JSON.parse(readFileSync(join(ROOT, 'src/i18n/ui.json'), 'utf8'));
const TYPES = ['news', 'bacteria', 'hubs'];
const TOPICS = ['gut', 'oral', 'immunity', 'enzymes', 'metabolic', 'skin', 'brain'];

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const attr = esc;
const NBSP = ' ';
/* §4h-2 — number and unit are one word: "4 × 10¹⁰ CFU", "12 %", "n = 32", "2 weeks" */
const UNIT_RE = /(\d[\d.,]*)\s+(%|CFU|КОЕ|mg|g|kg|ml|mL|cm|mm|µm|μm|nm|kDa|weeks?|days?|months?|years?|недел[ьия]|дн[ейя]|месяц\w*|лет|года?|×|x|÷|min|h|°C|IU|log10|copies|participants|people|человек)\b/g;
function nbspNumbers(html) {
  return html
    .replace(UNIT_RE, (m, n, u) => `${n}${NBSP}${u}`)
    .replace(/(\d)\s(\d{3})(?!\d)/g, `$1${NBSP}$2`)          // thousands: 1 844
    .replace(/\b(n|N)\s*=\s*(\d)/g, `$1${NBSP}=${NBSP}$2`)  // n = 32
    .replace(/(\d)\s*×\s*(10)/g, `$1${NBSP}×${NBSP}$2`);
}

/* ---------- content loading ---------- */
function parseFile(path) {
  const raw = readFileSync(path, 'utf8').replace(/^﻿/, '');
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`no front-matter: ${path}`);
  const fm = yaml.load(m[1], { schema: yaml.CORE_SCHEMA }) || {};
  return { fm, body: m[2] || '' };
}

function loadAll() {
  const clusters = []; // {type, slug, langs: {lang: {fm, body, path}}}
  for (const type of TYPES) {
    const dir = join(CONTENT, type);
    if (!existsSync(dir)) continue;
    for (const slug of readdirSync(dir)) {
      const cdir = join(dir, slug);
      if (!statSync(cdir).isDirectory()) continue;
      const langs = {};
      for (const f of readdirSync(cdir)) {
        const mm = f.match(/^([a-zA-Z-]+)\.md$/);
        if (!mm || f.endsWith('.speech.md') || f === 'image-brief.md') continue;
        const lang = mm[1];
        if (!LOCALES.meta[lang]) { console.warn(`skip unknown locale file ${type}/${slug}/${f}`); continue; }
        try {
          const doc = parseFile(join(cdir, f));
          if (doc.fm.status !== 'published' && !process.env.INCLUDE_REVIEW) continue;
          langs[lang] = { ...doc, path: join(cdir, f) };
        } catch (e) { console.warn(`skip ${type}/${slug}/${f}: ${e.message}`); }
      }
      if (Object.keys(langs).length) clusters.push({ type, slug, langs });
    }
  }
  return clusters;
}

/* ---------- urls ---------- */
const prefix = (lang) => (lang === LOCALES.default ? '' : `/${lang}`);
const homeUrl = (lang) => `${prefix(lang)}/`;
const typeUrl = (lang, type) => `${prefix(lang)}/${type === 'hubs' ? 'topics' : type}/`;
const pageUrl = (lang, type, slug) => (type === 'hubs' ? `${prefix(lang)}/topics/${slug}/` : `${prefix(lang)}/${type}/${slug}`);
const aboutUrl = (lang) => `${prefix(lang)}/about`;
const outPath = (url) => join(DIST, url.endsWith('/') ? `${url}index.html` : `${url}.html`);
const abs = (u) => `${ORIGIN}${u}`;

/* ---------- markdown ---------- */
marked.setOptions({ gfm: true, breaks: false });
function renderBody(md, sources, lang) {
  const ids = (sources || []).map((s) => s.id);
  let html = marked.parse(md);
  // [s1] → footnote sup
  html = html.replace(/\[(s\d+)\]/g, (m, id) => {
    const i = ids.indexOf(id);
    if (i < 0) return '';
    return `<sup><a href="#${id}" aria-label="source ${i + 1}">${i + 1}</a></sup>`;
  });
  // strip any hand-written Sources section (build generates it)
  html = html.replace(/<h2[^>]*>\s*(Sources|Источники)\s*<\/h2>[\s\S]*$/i, '');
  // links to sibling articles keep locale prefix
  html = html.replace(/href="\/(news|bacteria|topics)\//g, `href="${prefix(lang)}/$1/`);
  return nbspNumbers(html);
}

/* ---------- page chrome ---------- */
function langSwitcher(lang, available, urlFor) {
  const items = LOCALES.order.map((l) => {
    const meta = LOCALES.meta[l];
    if (available.includes(l)) {
      const cur = l === lang ? ' aria-current="true"' : '';
      return `<li><a href="${urlFor(l)}" hreflang="${meta.html}" lang="${meta.html}"${cur}>${esc(meta.native)}</a></li>`;
    }
    return `<li><span lang="${meta.html}" title="—">${esc(meta.native)}</span></li>`;
  }).join('');
  return `<details class="hdr__lang"><summary aria-label="${attr(UI[lang].languages)}">${esc(LOCALES.meta[lang].native)} ▾</summary><ul>${items}</ul></details>`;
}

function layout({ lang, title, desc, url, alternates, bodyHtml, jsonld, ogImage, current, type, dateMod }) {
  const t = UI[lang]; const meta = LOCALES.meta[lang];
  const hrefl = alternates.map((a) => `<link rel="alternate" hreflang="${LOCALES.meta[a.lang].html}" href="${abs(a.url)}">`).join('\n  ');
  const xdef = alternates.find((a) => a.lang === LOCALES.default);
  const nav = [['news', typeUrl(lang, 'news')], ['bacteria', typeUrl(lang, 'bacteria')], ['topics', typeUrl(lang, 'hubs')], ['about', aboutUrl(lang)]]
    .map(([k, u]) => `<a href="${u}"${current === k ? ' aria-current="page"' : ''}>${esc(t.nav[k])}</a>`).join('');
  const switcher = langSwitcher(lang, alternates.map((a) => a.lang), (l) => alternates.find((a) => a.lang === l).url);
  const footLangs = alternates.map((a) => `<a href="${a.url}" hreflang="${LOCALES.meta[a.lang].html}">${esc(LOCALES.meta[a.lang].native)}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="${meta.html}" dir="${meta.dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${attr(desc)}">
  <link rel="canonical" href="${abs(url)}">
  ${hrefl}
  ${xdef ? `<link rel="alternate" hreflang="x-default" href="${abs(xdef.url)}">` : ''}
  <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">
  <meta property="og:type" content="${type === 'news' ? 'article' : 'website'}">
  <meta property="og:site_name" content="${BRAND}">
  <meta property="og:title" content="${attr(title)}">
  <meta property="og:description" content="${attr(desc)}">
  <meta property="og:url" content="${abs(url)}">
  <meta property="og:locale" content="${meta.html.replace('-', '_')}">
  ${ogImage ? `<meta property="og:image" content="${attr(ogImage)}">` : ''}
  <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
  <link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/portal.css?v=${BUILD_DATE.replace(/-/g, '')}">
  ${jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`).join('\n  ')}
</head>
<body>
<header class="hdr"><div class="hdr__in">
  <a class="hdr__logo" href="${homeUrl(lang)}" aria-label="${attr(t.siteName)} — ${attr(t.home)}"><img src="/assets/img/logo-navy.png" alt="${attr(t.siteName)}" width="63" height="44"></a>
  <nav class="hdr__nav" aria-label="Main">${nav}</nav>
  ${switcher}
</div></header>
<main>
${bodyHtml}
</main>
<footer class="ftr"><div class="wrap">
  <div class="ftr__top">
    <div><img src="/assets/img/logo-navy.png" alt="${attr(t.siteName)}" width="63" height="44" style="height:44px;width:auto"><p class="brandline">${esc(t.tagline)}.</p></div>
    <div><h4>${esc(t.nav.news)}</h4><a href="${typeUrl(lang, 'news')}">${esc(t.allNews)}</a><a href="${typeUrl(lang, 'hubs')}">${esc(t.nav.topics)}</a></div>
    <div><h4>${esc(t.nav.bacteria)}</h4><a href="${typeUrl(lang, 'bacteria')}">${esc(t.allBacteria)}</a><a href="${aboutUrl(lang)}">${esc(t.nav.about)}</a></div>
    <div><h4>${esc(t.brandSite)}</h4><a href="${BRAND_SITE}${lang === 'ru' ? '/ru/' : '/'}" rel="noopener">microbiomefriendly.me</a><a href="mailto:biome@dasexperten.com">biome@dasexperten.com</a></div>
  </div>
  <div class="disclaimer">${esc(t.disclaimer)}</div>
  <div class="ftr__langs">${footLangs}</div>
  <div class="ftr__bottom"><span>© ${BUILD_DATE.slice(0, 4)} ${BRAND}</span><span>${esc(t.tagline)}</span></div>
</div></footer>
</body>
</html>`;
}

/* ---------- cards ---------- */
const placeholderSvg = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="32" cy="32" rx="22" ry="12" transform="rotate(-25 32 32)"/><circle cx="24" cy="30" r="2.5" fill="currentColor"/><circle cx="34" cy="35" r="2.5" fill="currentColor"/><circle cx="41" cy="28" r="2" fill="currentColor"/></svg>';
function card(lang, c, doc) {
  const t = UI[lang]; const fm = doc.fm;
  const img = fm.images?.preview
    ? `<img src="${attr(fm.images.preview)}" alt="${attr(fm.images.previewAlt || fm.title)}" width="720" height="480" loading="lazy">`
    : `<div class="card-cover card-cover--empty" aria-hidden="true">${placeholderSvg}</div>`;
  const cover = fm.images?.preview ? `<div class="card-cover">${img}</div>` : img;
  const kicker = fm.kicker || t.topicNames[fm.topic] || '';
  const date = fm.date ? `<span>${esc(t.published)}: <time datetime="${fm.date}">${fm.date}</time></span>` : '';
  return `<a class="card" href="${pageUrl(lang, c.type, c.slug)}">${cover}<div class="card__b"><div class="kicker">${esc(kicker)}</div><h3>${esc(fm.title)}</h3><p>${esc(fm.meta || fm.answer || '')}</p><div class="card__meta">${date}</div></div></a>`;
}

/* ---------- article page ---------- */
function articlePage(lang, c, doc, alternates, clusters) {
  const t = UI[lang]; const fm = doc.fm; const url = pageUrl(lang, c.type, c.slug);
  const sources = fm.sources || [];
  const body = renderBody(doc.body, sources, lang);
  const kicker = fm.kicker || t.topicNames[fm.topic] || '';
  const hero = fm.images?.hero
    ? `<figure class="article-hero"><img src="${attr(fm.images.hero)}" alt="${attr(fm.images.heroAlt || fm.title)}" width="1200" height="675"><figcaption>${esc(fm.images.heroAlt || '')}</figcaption></figure>` : '';
  const facts = (fm.keyFacts || []).length
    ? `<section class="facts"><h2>${esc(t.keyFacts)}</h2><ul>${fm.keyFacts.map((k) => `<li>${nbspNumbers(esc(k.fact))}${k.source ? `<sup><a href="#${k.source}">${sources.findIndex((s) => s.id === k.source) + 1}</a></sup>` : ''}</li>`).join('')}</ul></section>` : '';
  const faq = (fm.faq || []).length
    ? `<section class="faq"><h2>${esc(t.faq)}</h2>${fm.faq.map((q) => `<details><summary>${esc(q.q)}</summary><p>${nbspNumbers(esc(q.a))}</p></details>`).join('')}</section>` : '';
  const srcList = sources.length
    ? `<section class="sources" id="sources"><h2>${esc(t.sources)}</h2><ol>${sources.map((s) => `<li id="${attr(s.id)}">${esc(s.name)}${s.url ? ` — <a href="${attr(s.url)}" rel="noopener nofollow">${esc(s.doi ? `doi:${s.doi}` : s.pmid ? `PMID ${s.pmid}` : s.url)}</a>` : ''}</li>`).join('')}</ol></section>` : '';
  const entity = fm.entity?.latin
    ? `<dl class="entity"><dt>${esc(t[fm.entity.rank] || fm.entity.rank || '')}</dt><dd><em>${esc(fm.entity.latin)}</em></dd>${fm.entity.synonyms?.length ? `<dt>Syn.</dt><dd>${esc(fm.entity.synonyms.join(', '))}</dd>` : ''}${fm.entity.ncbiTaxId ? `<dt>NCBI</dt><dd><a href="https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${attr(fm.entity.ncbiTaxId)}" rel="noopener">txid${esc(fm.entity.ncbiTaxId)}</a></dd>` : ''}${fm.entity.wikidata ? `<dt>Wikidata</dt><dd><a href="https://www.wikidata.org/wiki/${attr(fm.entity.wikidata)}" rel="noopener">${esc(fm.entity.wikidata)}</a></dd>` : ''}</dl>` : '';
  // related: same topic, other clusters, same lang available
  const related = clusters.filter((o) => o !== c && o.langs[lang] && o.type !== 'hubs' && o.langs[lang].fm.topic === fm.topic).slice(0, 3);
  const rail = related.length ? `<section class="rail"><h2>${esc(t.related)}</h2><div class="grid g3">${related.map((o) => card(lang, o, o.langs[lang])).join('')}</div></section>` : '';
  const hub = clusters.find((o) => o.type === 'hubs' && o.slug === fm.topic && o.langs[lang]);
  const crumbs = [[t.home, homeUrl(lang)], [c.type === 'news' ? t.nav.news : c.type === 'bacteria' ? t.nav.bacteria : t.nav.topics, typeUrl(lang, c.type)]];
  if (hub && c.type !== 'hubs') crumbs.push([t.topicNames[fm.topic], pageUrl(lang, 'hubs', fm.topic)]);
  const breadcrumb = `<nav class="breadcrumb" aria-label="Breadcrumb">${crumbs.map(([n, u]) => `<a href="${u}">${esc(n)}</a>`).join('<span>›</span>')}</nav>`;

  const bodyHtml = `<article class="article"><div class="wrap">
  <header>${breadcrumb}<div class="kicker">${esc(kicker)}</div><h1 class="h1">${esc(fm.title)}</h1>
  ${fm.answer ? `<p class="answer">${nbspNumbers(esc(fm.answer))}</p>` : ''}
  <div class="byline"><img src="${AUTHOR.avatar}" alt="" width="40" height="40"><span><strong>${esc(t.author)}: ${AUTHOR.name}</strong> · ${esc(t.authorRole)}</span><span>${esc(t.published)}: <time datetime="${fm.date}">${fm.date}</time></span>${fm.asOf ? `<span>${esc(t.asOf)}: <time datetime="${fm.asOf}">${fm.asOf}</time></span>` : ''}</div></header>
  ${hero}
  ${entity}
  <div class="prose">${body}</div>
  ${facts}${faq}${srcList}${rail}
</div></article>`;

  const images = [fm.images?.preview, fm.images?.hero].filter(Boolean);
  const ld = [{
    '@context': 'https://schema.org', '@type': c.type === 'news' ? 'NewsArticle' : 'Article',
    '@id': abs(url), headline: fm.title.slice(0, 110), description: fm.meta, inLanguage: LOCALES.meta[lang].html,
    datePublished: fm.date, dateModified: fm.asOf || fm.date, image: images,
    mainEntityOfPage: abs(url),
    author: { '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role, url: AUTHOR.url, image: AUTHOR.avatar },
    publisher: { '@type': 'Organization', name: BRAND, url: BRAND_SITE, logo: { '@type': 'ImageObject', url: abs('/assets/img/logo-navy.png') } },
    citation: sources.map((s) => ({ '@type': 'ScholarlyArticle', name: s.name, url: s.url, ...(s.doi ? { sameAs: `https://doi.org/${s.doi}` } : {}) })),
    ...(fm.entity?.latin ? { about: { '@type': 'Thing', name: fm.entity.latin, sameAs: [fm.entity.ncbiTaxId ? `https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${fm.entity.ncbiTaxId}` : null, fm.entity.wikidata ? `https://www.wikidata.org/wiki/${fm.entity.wikidata}` : null].filter(Boolean) } } : {}),
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [...crumbs, [fm.title, url]].map(([n, u], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: abs(u) })),
  }];
  if ((fm.faq || []).length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: fm.faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) });
  const ogImage = fm.images?.og || fm.images?.preview || '';
  const titleTag = fm.entity?.latin && !fm.title.includes(fm.entity.latin) ? `${fm.title} · ${BRAND}` : `${fm.title} · ${BRAND}`;
  return layout({ lang, title: titleTag, desc: fm.meta || fm.answer || '', url, alternates, bodyHtml, jsonld: ld, ogImage, current: c.type === 'hubs' ? 'topics' : c.type, type: c.type, dateMod: fm.asOf || fm.date });
}

/* ---------- list / home / about ---------- */
function listPage(lang, type, clusters, alternates) {
  const t = UI[lang];
  const items = clusters.filter((c) => c.type === type && c.langs[lang]).sort((a, b) => (b.langs[lang].fm.date || '').localeCompare(a.langs[lang].fm.date || ''));
  const title = type === 'news' ? t.allNews : type === 'bacteria' ? t.encyclopedia : t.nav.topics;
  const url = typeUrl(lang, type);
  let inner;
  if (type === 'hubs') {
    inner = `<ul class="topic-list">${TOPICS.map((tp) => { const hub = items.find((c) => c.slug === tp); return hub ? `<li><a href="${pageUrl(lang, 'hubs', tp)}">${esc(t.topicNames[tp])}</a></li>` : ''; }).join('')}</ul>`;
    const nonhub = clusters.filter((c) => c.type !== 'hubs' && c.langs[lang]);
    inner += TOPICS.map((tp) => { const rows = nonhub.filter((c) => c.langs[lang].fm.topic === tp); return rows.length ? `<section class="section--tight"><h2 class="h2" id="${tp}">${esc(t.topicNames[tp])}</h2><div class="grid g3" style="margin-top:18px">${rows.map((c) => card(lang, c, c.langs[lang])).join('')}</div></section>` : ''; }).join('');
  } else if (type === 'bacteria') {
    const byRank = { phylum: [], genus: [], species: [] };
    for (const c of items) (byRank[c.langs[lang].fm.entity?.rank] || byRank.species).push(c);
    inner = ['phylum', 'genus', 'species'].map((r) => byRank[r].length ? `<section class="section--tight"><h2 class="h2">${esc(t[r])}</h2>${byRank[r].map((c) => { const fm = c.langs[lang].fm; return `<div class="index-row"><div class="thumb">${fm.images?.preview ? `<img src="${attr(fm.images.preview)}" alt="" width="360" height="240" loading="lazy">` : ''}</div><div><h3><a href="${pageUrl(lang, 'bacteria', c.slug)}"><em>${esc(fm.entity?.latin || fm.title)}</em></a></h3><p>${esc(fm.answer || fm.meta || '')}</p></div></div>`; }).join('')}</section>` : '').join('');
  } else {
    inner = items.length ? `<div class="grid g3">${items.map((c) => card(lang, c, c.langs[lang])).join('')}</div>` : `<p class="notice">${esc(t.preparing)} <a href="${typeUrl('en', type)}">English →</a></p>`;
  }
  const bodyHtml = `<section class="section"><div class="wrap"><div class="kicker">${esc(t.siteName)}</div><h1 class="h1">${esc(title)}</h1><div style="margin-top:28px">${inner}</div></div></section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: abs(url), inLanguage: LOCALES.meta[lang].html }];
  return layout({ lang, title: `${title} · ${BRAND}`, desc: t.tagline, url, alternates, bodyHtml, jsonld: ld, current: type === 'hubs' ? 'topics' : type, type: 'list' });
}

function homePage(lang, clusters, alternates) {
  const t = UI[lang];
  const news = clusters.filter((c) => c.type === 'news' && c.langs[lang]).sort((a, b) => (b.langs[lang].fm.date || '').localeCompare(a.langs[lang].fm.date || '')).slice(0, 6);
  const bact = clusters.filter((c) => c.type === 'bacteria' && c.langs[lang]).slice(0, 6);
  const hubs = TOPICS.filter((tp) => clusters.some((c) => c.type === 'hubs' && c.slug === tp && c.langs[lang]));
  const empty = !news.length && !bact.length;
  const bodyHtml = `<section class="hero"><div class="hero__in"><div class="hero__text"><div class="kicker">${esc(t.siteName)}</div><h1>${esc(t.tagline)}</h1><p class="sub">${esc(t.aboutText)}</p><div class="hero__pills">${TOPICS.map((tp) => `<span class="pill">${esc(t.topicNames[tp])}</span>`).join('')}</div></div><div class="hero__art hero__art--empty" aria-hidden="true"></div></div></section>
${empty && lang !== 'en' ? `<section class="section"><div class="wrap"><p class="notice">${esc(t.preparing)} <a href="/">English →</a></p></div></section>` : ''}
${news.length ? `<section class="section"><div class="wrap"><div class="kicker">${esc(t.nav.news)}</div><h2 class="h1">${esc(t.latestNews)}</h2><div class="grid g3" style="margin-top:30px">${news.map((c) => card(lang, c, c.langs[lang])).join('')}</div><p style="margin-top:22px"><a class="more" href="${typeUrl(lang, 'news')}">${esc(t.allNews)} →</a></p></div></section>` : ''}
${bact.length ? `<section class="section ivory2"><div class="wrap"><div class="kicker">${esc(t.nav.bacteria)}</div><h2 class="h1">${esc(t.encyclopedia)}</h2><div class="grid g3" style="margin-top:30px">${bact.map((c) => card(lang, c, c.langs[lang])).join('')}</div><p style="margin-top:22px"><a class="more" href="${typeUrl(lang, 'bacteria')}">${esc(t.allBacteria)} →</a></p></div></section>` : ''}
${hubs.length ? `<section class="section"><div class="wrap"><div class="kicker">${esc(t.nav.topics)}</div><ul class="topic-list">${hubs.map((tp) => `<li><a href="${pageUrl(lang, 'hubs', tp)}">${esc(t.topicNames[tp])}</a></li>`).join('')}</ul></div></section>` : ''}`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: abs(homeUrl(lang)), inLanguage: LOCALES.meta[lang].html, publisher: { '@type': 'Organization', name: BRAND, url: BRAND_SITE } }];
  return layout({ lang, title: `${t.siteName} — ${t.tagline}`, desc: t.aboutText, url: homeUrl(lang), alternates, bodyHtml, jsonld: ld, current: 'home', type: 'home' });
}

function aboutPage(lang, alternates) {
  const t = UI[lang];
  const bodyHtml = `<section class="section"><div class="wrap wrap--narrow"><div class="kicker">${esc(t.siteName)}</div><h1 class="h1">${esc(t.aboutTitle)}</h1><div class="prose" style="margin-top:22px"><p class="lead">${esc(t.aboutText)}</p><div class="byline" style="margin-top:22px"><img src="${AUTHOR.avatar}" alt="${AUTHOR.name}" width="40" height="40"><span><strong>${AUTHOR.name}</strong> · ${esc(t.authorRole)}</span><a href="mailto:biome@dasexperten.com">biome@dasexperten.com</a></div><p>${esc(t.disclaimer)}</p><p><a href="${BRAND_SITE}" rel="noopener">${esc(t.brandSite)} →</a></p></div></div></section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'Person', name: AUTHOR.name, jobTitle: AUTHOR.role, url: abs(aboutUrl(lang)), image: AUTHOR.avatar, email: 'biome@dasexperten.com', worksFor: { '@type': 'Organization', name: BRAND, url: BRAND_SITE } }];
  return layout({ lang, title: `${t.aboutTitle} · ${BRAND}`, desc: t.aboutText, url: aboutUrl(lang), alternates, bodyHtml, jsonld: ld, current: 'about', type: 'about' });
}

/* ---------- write ---------- */
function write(url, html) { const p = outPath(url); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, html); return url; }

function build() {
  const clusters = loadAll();
  mkdirSync(DIST, { recursive: true });
  cpSync(join(ROOT, 'src/assets'), join(DIST, 'assets'), { recursive: true });
  const urlsByLang = Object.fromEntries(LOCALES.order.map((l) => [l, []]));
  const liveLangs = LOCALES.order.filter((l) => l === 'en' || clusters.some((c) => c.langs[l]));
  const push = (lang, url, mod) => urlsByLang[lang].push({ url, mod });

  // chrome pages exist for every locale that has at least one article (plus en)
  for (const lang of liveLangs) {
    const alts = liveLangs.map((l) => ({ lang: l, url: homeUrl(l) }));
    write(homeUrl(lang), homePage(lang, clusters, alts)); push(lang, homeUrl(lang), BUILD_DATE);
    write(aboutUrl(lang), aboutPage(lang, liveLangs.map((l) => ({ lang: l, url: aboutUrl(l) })))); push(lang, aboutUrl(lang), BUILD_DATE);
    for (const type of TYPES) { const a = liveLangs.map((l) => ({ lang: l, url: typeUrl(l, type) })); write(typeUrl(lang, type), listPage(lang, type, clusters, a)); push(lang, typeUrl(lang, type), BUILD_DATE); }
  }
  let pages = 0;
  for (const c of clusters) {
    const langs = LOCALES.order.filter((l) => c.langs[l]);
    const alts = langs.map((l) => ({ lang: l, url: pageUrl(l, c.type, c.slug) }));
    for (const lang of langs) {
      const doc = c.langs[lang];
      write(pageUrl(lang, c.type, c.slug), articlePage(lang, c, doc, alts, clusters));
      push(lang, pageUrl(lang, c.type, c.slug), doc.fm.asOf || doc.fm.date || BUILD_DATE); pages++;
    }
  }
  // sitemaps
  mkdirSync(join(DIST, 'sitemaps'), { recursive: true });
  const smLangs = liveLangs.filter((l) => urlsByLang[l].length);
  for (const l of smLangs) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlsByLang[l].map((u) => `  <url><loc>${abs(u.url)}</loc><lastmod>${u.mod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
    writeFileSync(join(DIST, 'sitemaps', `sitemap-${l}.xml`), xml);
  }
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${smLangs.map((l) => `  <sitemap><loc>${abs(`/sitemaps/sitemap-${l}.xml`)}</loc><lastmod>${BUILD_DATE}</lastmod></sitemap>`).join('\n')}\n</sitemapindex>\n`);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=no\nSitemap: ${abs('/sitemap.xml')}\n`);
  // llms.txt per locale (GEO_BRIEF §4)
  for (const l of liveLangs) {
    const t = UI[l];
    const lines = [`# ${BRAND} — ${t.tagline}`, '', `> ${t.aboutText}`, '', `Author: ${AUTHOR.name}, ${AUTHOR.role}. Facts checked: see "as of" on each page. Language: ${LOCALES.meta[l].name}.`, ''];
    for (const type of TYPES) {
      const rows = clusters.filter((c) => c.type === type && c.langs[l]);
      if (!rows.length) continue;
      lines.push(`## ${type === 'news' ? t.nav.news : type === 'bacteria' ? t.encyclopedia : t.nav.topics}`, '');
      for (const c of rows) lines.push(`- [${c.langs[l].fm.title}](${abs(pageUrl(l, c.type, c.slug))}): ${c.langs[l].fm.meta || ''}`);
      lines.push('');
    }
    const p = l === 'en' ? join(DIST, 'llms.txt') : join(DIST, l, 'llms.txt');
    mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, lines.join('\n'));
  }
  // Cloudflare Pages headers / redirects
  writeFileSync(join(DIST, '_headers'), `/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: SAMEORIGIN\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: geolocation=(), microphone=(), camera=()\n\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
  writeFileSync(join(DIST, '_redirects'), `/index.html / 301\n`);
  // manifest for check.mjs
  writeFileSync(join(DIST, 'build-manifest.json'), JSON.stringify({ origin: ORIGIN, buildDate: BUILD_DATE, liveLangs, pages, clusters: clusters.map((c) => ({ type: c.type, slug: c.slug, langs: Object.keys(c.langs) })) }, null, 2));
  console.log(`built ${pages} article pages · ${clusters.length} clusters · locales live: ${liveLangs.join(' ')} · origin ${ORIGIN}`);
}

build();
