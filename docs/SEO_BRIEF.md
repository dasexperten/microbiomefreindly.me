# SEO brief — microbiome news + bacteria encyclopedia portal (18 locales)

**Seat:** Jurgen Witt (SEO · Webmaster) · **for:** Magnus Larsen (lead) · Roberta (words, publication go) · Mina (deploy) · **date:** 2026-09-02
**Target repo file:** `docs/SEO_BRIEF.md` in `dasexperten/microbiomefreindly.me`

**Live fact:** `microbiomefriendly.me` is a zone on our Cloudflare account and serves a bilingual EN + `/ru/` brand site today (on file: Magnus CHARTER, JW LEARNING zone list). I did not crawl it this session — its URL inventory is **not on file** and is the first thing to take before cutover (§6 below).
**Next step:** wire the ten checks of §5 into the build as a gate before the first preview deploy; a page that fails a check does not ship.

Every rule below cites where it comes from. Where nothing is on file I say so; the numbers I set myself are marked *mine*.

---

## 1. URL architecture · hreflang · canonical · sitemaps · robots · llms.txt

### 1.1 Locale paths and codes

| Point | Rule |
|---|---|
| Root | `en` at `/` — no `/en/` prefix, no redirect from `/en/` to `/` (one form only) |
| Others | `/<lang>/…` for de ru vi ar es pt-br fr ms pl ro th tl tr uk zh ja ko — path segment lower-case |
| hreflang codes | `en de ru vi ar es pt-BR fr ms pl ro th tl tr uk zh-Hans ja ko` + `x-default`. Language codes, never country codes: `vi` not `vn`, `zh-Hans` not `zh`, `pt-BR` where the copy is Brazilian. One bad token disqualifies the annotation set of the whole cluster, site-wide (JW-001, JW-001-A; zh→zh-Hans shipped 2026-08-05/08) |
| Path vs code | Path may stay short (`/zh/`), the code must be full (`zh-Hans`). The `lang` attribute, `hreflang`, `og:locale` and JSON-LD `inLanguage` carry **one identical string per locale** — dasexperten has two dialects (`tl` in hreflang, `fil` in JSON-LD, JW-MEM-260801-01); the portal gets one owner map, one string |
| Sections | `/news/<slug>` · `/bacteria/<phylum>/` · `/bacteria/<phylum>/<genus>/` · `/bacteria/<phylum>/<genus>/<species>` · `/topics/<hub>/` |
| Trailing slash | Hubs and locale roots **with** slash (`/de/`, `/de/bacteria/bacillota/`); leaves **without**. The other form answers one 301, never a second 200 (JW-019: canonical must be the final URL; JW-MEM-260827-01: `/loyalty` + `/loyalty/` both 200 was a defect) |

### 1.2 Slug policy — decided

**Two tiers, one registry.**

1. **Encyclopedia pages: the organism name, ASCII, identical in all 18 locales.** `/bacteria/verrucomicrobiota/akkermansia/akkermansia-muciniphila`, `/ja/bacteria/verrucomicrobiota/akkermansia/akkermansia-muciniphila`. Reason: the entity *is* its Latin binomial; the typed local word (`хеликобактер`, `幽門螺旋桿菌`) lives in title/H1/meta where §7a is measured, and a stable ASCII path is what keeps 18 alternates pointing at real pages. Which phylum name (Firmicutes vs Bacillota) is typed per locale is a measurement, not a guess — the slug takes the current ICSP name, the title takes the measured one.
2. **News items and hubs: localized slug from the measured head phrase** — §7a lists the slug explicitly, and a Russian-transliterated slug on a Vietnamese page was logged as a defect (JW-MEM-260809-01). Latin-script locales: the typed phrase, ASCII, hyphens, no diacritics (Romanian without diacritics is what is typed — KW file 2026-08-17). ru/uk: transliterated to ASCII (dasexperten.ru practice). **ar th zh ja ko: EN slug** — whether a pinyin/romaji/RR-romanized slug earns anything is **not on file**; until measured, the typed word lives in title/H1/meta only.
3. **Consequence — hreflang is never synthesized from prefix + slug.** Every article has a `cluster_id`; the registry stores `{cluster_id, locale, path}` and the head emits exactly the paths that exist. The prefix-synthesis model cannot express `natural-bad-breath-…` ↔ `cach-tri-hoi-mieng-…` and produced 94 dead alternates on six blog posts on 2026-09-02 (JW-055). A Worker in front of Pages must **keep** the page's block, not overwrite it.

### 1.3 hreflang and canonical

- Every page carries `<link rel="alternate" hreflang="…">` for **every live translation including itself** plus `x-default` → the EN URL. When all 18 exist: 19 links. A missing translation is simply absent — not pointed at EN, not filled with machine text (JW-MEM-260801-01: pt left 404 rather than English).
- Every href in the set answers **200 without redirect** — one dead member discards the whole cluster for every locale (JW-055 check: `curl` each href).
- `<link rel="canonical">` = self, absolute, final form (§1.1), built from `SITE_ORIGIN`. `og:url` and JSON-LD `WebPage.@id`/`mainEntityOfPage` carry the **same string** — canonical and markup arguing about one page was 323 rows on `.ru` (JW-MEM-260828-09; og:url left behind on 83 pages, JW-MEM-260821-01).
- **Preview project:** `X-Robots-Tag: noindex` header + `robots.txt` `Disallow: /` on `*.pages.dev`; canonicals still point at `SITE_ORIGIN` = `https://microbiomefriendly.me` only when the build is the production build. A sitemap generator skips any page whose canonical is on a foreign host (JW-MEM-260828-10).
- Language switcher links to the **same page** in the other locale, never to that locale's home (Owner condition, JW-MEM-260821-01); the bar sits under `data-nosnippet` and below the H1 in DOM order, logo `alt` = brand name, not a slogan (JW-MEM-260829-01).
- Every head tag has **one emitter**. Two generators disagreeing on `hreflang` flipped 384 pages by run order (JW-CRAFT-260809-01, JW-005). If a Worker rewrites the head, it is the only writer of that tag.

### 1.4 Sitemaps

| File | Content |
|---|---|
| `/sitemap.xml` | `sitemapindex` only — 18 locale children + images. Tiny; served by whatever is most stable (Worker on dasexperten) so the address in robots does not depend on a static deploy (JW-017) |
| `/sitemaps/sitemap-<lang>.xml` ×18 | one `<url>` **per page** with `lastmod` and its **full** `xhtml:link` set incl. self + x-default. An alternate inside another locale's entry is an annotation, not a declaration — 96 `<loc>` for 1 432 pages was the result (JW-017, JW-MEM-260824-01) |
| `/sitemaps/sitemap-images.xml` | built **from the rendered pages** (address + caption as shown, caption in page language), each image checked 200 with image content type (JW-MEM-260824-02) |
| News sitemap | **not now.** Requires Google Publisher Center inclusion; "no invent News sitemap" stands (JW-LOG-260805-01). Open as gap |

Rules: no `noindex` URL in any sitemap (JW-MEM-260901-24) · no URL answering 301/308 (generator fetches with `redirect: 'manual'`, accepts 200 only — JW-019) · `grep -c '<loc>https://microbiomefriendly.me[^/]'` = 0 (JW-018 host-glued-to-path) · **children deploy before the index** (JW-017) · resubmit to GSC only when the file's hash changed (JW-MEM-260829-05) · after every deploy: rebuild sitemaps → IndexNow → Yandex recrawl queue (ru locale; the `.me` host must be added to Yandex Webmaster — **not on file**) → Bing; Google gets only the fresh `lastmod` (JW-MEM-260828-10).

### 1.5 robots.txt and llms.txt

- `robots.txt`: open to all crawlers incl. AI (`Content-Signal: ai-train=yes` as on dasexperten, JW-MEM-260723-01); `Sitemap:` absolute to the index; `Disallow` only `/api/`, `/_/`, search/query paths. It is the first page of the shop for machines — 18 % of AI-search hits (JW-MEM-260809-01).
- `/llms.txt` + `/<lang>/llms.txt`, generated from the **published** title + meta of that locale, never machine-translated (JW-MEM-260801-01): sections *Latest news*, *Bacteria by phylum*, *Topics*, a `Last-updated:` line bumped only when content changed (a fresh date on unchanged text is a §0b breach — JW-MEM-260826-09), and a citation rule: take a figure only from the page in this locale. `llms-full.txt` optional, open.

---

## 2. Page template SEO contract

### 2.1 `<title>` · meta description

| Type | Pattern | Cap |
|---|---|---|
| News | `{typed headline} · {Brand}` | ≤ 60 chars Latin, ≤ 55 Cyrillic/Arabic/Thai, ≤ 32 CJK — *mine*, not an org law; the org caps on file are for description only |
| Bacteria | `{Organism}: {typed local phrase for what it is / does} · {Brand}` — e.g. en `Akkermansia muciniphila: what it does in the gut, benefits and risks` | same |
| Hub | `{typed hub word} · {Brand}` — in the **locale's** word, never the English label (16 blog hubs titled `Blog — Das Experten` in Thai/Arabic/Chinese locales is an open defect, JW-MEM-260902-01) | same |
| `{Brand}` | **not on file** — one string, fixed by Roberta/Owner before the first build; the domain until then |

Meta description: **≤ 160 chars, ≤ 150 Cyrillic** (JW-CRAFT-260811-02), opens on the typed term, a **separate field from the lead** (one field serving both ruined both — same entry), no dated promises, no percentages, no `Made in Germany` (Maya card I-6 closed negative by Owner 2026-08-09; Magnus MG-RULE-260902-03). Google rewrites ~2 of 3 descriptions from the first visible DOM text — so the lead is the first text after H1 (JW-MEM-260829-01).

### 2.2 Headings

**One `<h1>` = the headline.** A heading is either liftable by an answer engine or carries a hook; a neutral label is not acceptable (JW-CRAFT-260801-01). The answer sentence directly under it, as the lead.

**News item**
```
H1  headline (typed word, page language)
    lead — what was found, 1–2 sentences, answer first
H2  What the study did          (design, n, duration — from the source)
H2  What it found                (numbers with the paper's figure, §0b)
H2  What it means                (mechanism; the only place a referral may sit — second half)
H2  Where the study stops        (limits, caveat said out loud — Greger cadence)
H2  Bacteria in this story       (entity links, §4)
H2  Source                       (journal · authors · date · DOI/URL — named or the item does not exist)
H2  FAQ (optional, 2–4 Q, text identical to JSON-LD)
```

**Bacteria page**
```
H1  Organism (Latin) — typed local phrase
    lead — one-sentence definition
H2  What it is               (phylum › genus › species, old and new names both in text)
H2  Where it lives
H2  Advantages               (H3 per benefit, each with a source)
H2  Disadvantages / risks    (H3 per risk, each with a source)
H2  How to support or reduce it   (mechanism; referral slot, second half only)
H2  In the news              (auto: latest 3 news items linking here)
H2  FAQ                      (visible; JSON-LD mirrors it)
H2  Sources
```
Headings translate as **questions in that language**, not as English labels — English H2 blocks on localized pages were a live defect (JW-MEM-260809-01).

### 2.3 Images — preview + hero

| Point | Rule |
|---|---|
| Produced by | Brand Studio lanes (§4d): Lisa stills · Marika layout · Taras video. Jurgen names filename, alt, slot only. No self-made collage (JW-HARD-260724-02). Products/people only from R2 REF (§4) |
| Filename | `/assets/{section}/{typed-keyword}-{entity}-{shot}.webp` — e.g. `akkermansia-muciniphila-mucin-layer-hero.webp`, `…-preview.webp` (pattern from `docs/SCIENCE_IMAGE_SEO.md`, JW-MEM-260724-02: filenames are their own traffic channel) |
| Host | Portal domain, **not** the `pub-….r2.dev` service host — images on an unverified host earn the site nothing (JW-MEM-260824-02) |
| Sizes | preview 1200×630 (cards + `og:image`), hero 1600×900 — *mine*; `width`/`height` attributes **mandatory** on both (2 325 of 3 301 tags lacked them on dasexperten, JW-MEM-260824-02) |
| Alt | Page language, honest description, ≤ 125 chars: **preview** = headline in plain words; **hero** = what the picture shows + organism name. Never empty, never a keyword list, never the SKU name alone |
| Caption | Visible `<figcaption>` on hero; the image sitemap reads it |

### 2.4 OpenGraph / Twitter

`og:type=article` · `og:title` · `og:description` · `og:url` (= canonical) · `og:image` (preview, absolute, portal host) · `og:image:width/height` · `og:locale` + `og:locale:alternate` × live translations · `article:published_time` · `article:modified_time` · `article:section` · `twitter:card=summary_large_image` · `twitter:title/description/image`. Social image URLs without `www`/wrong host gave 68 extra redirects on `.ru` (JW-MEM-260828-09) — same string as the `<img>`.

### 2.5 JSON-LD — types and required fields

| Type | Where | Required |
|---|---|---|
| `NewsArticle` | news | `headline` (≤ 110), `datePublished`, `dateModified`, `inLanguage`, `image` [preview, hero], `author` (Person — the seat that wrote it, Magnus), `publisher` (Organization ref), `mainEntityOfPage` = canonical, `isBasedOn` / `citation` → source DOI or URL, `about` → organism page URLs |
| `Article` | bacteria, hubs | `headline`, `datePublished`, `dateModified`, `inLanguage`, `image`, `author`, `publisher`, `mainEntityOfPage`, `about` `{Thing, name, sameAs: NCBI Taxonomy / Wikidata}`, `citation` per source |
| `FAQPage` | only where a visible FAQ exists | `mainEntity` Q/A with text **identical** to the visible block. No rich result since 2026-05-07; markup stays for LLMs and page understanding (JW-028). Never promise a snippet |
| `BreadcrumbList` | every page | Home › Section › (Phylum › Genus ›) Page — every `item` in canonical form, portal host |
| `Organization` | every page, one `@id` | `name`, `url`, `logo`, `sameAs`. **Publisher identity (legal entity, name) is not on file** — Valentina/Owner; until fixed: portal name, origin URL, no legal claims |
| `WebSite` | home | `@id` = portal origin; brand `Organization` one across all sites, site points to itself (model from JW-MEM-260828-09) |

Every block must `JSON.parse`; a block that parses but is short (truncated write, missing `</script>`) is the same defect — 20 money pages lost FAQ this way (JW-CRAFT-260802-01). `inLanguage` = the locale string of §1.1.

### 2.6 Typography that scripts can check
No letter-spacing anywhere (§4h). Number and unit are one token: `4&nbsp;×&nbsp;10¹⁰&nbsp;CFU`, `12&nbsp;weeks`, `n&nbsp;=&nbsp;48` — `&nbsp;` + `white-space:nowrap`; a wrapped number is wrong data, not a layout flaw (§4h-2). Check at 320 px, not on a desktop (§4h-2 acceptance).

---

## 3. Keyword rule per locale — the typed word wins

**Law:** write the word people type, in whatever language it turns out to be — not the translation, not the most correct word; checked against demand data **before** the page is written; zero impressions after a month → rewrite, not defend (HARD_RULES §7a; JW-LAW-260808-01: `bewertungen` 0 vs `erfahrungen` 10; `lợi khuẩn` 0 vs `probiotic` 40).

**A keyword is measured in its own locale, never translated.** Owner order 2026-08-17, executed in `agents/jurgen-witt/data/KW_PROBIOTIC_MECHANISM_16LOCALES_2026-08-17.md` (cited by Magnus MG-RULE-260902-07): the same mechanism enters through a different *kind* of word per locale — en product + breakage (`probiotic toothpaste` 8 100), de **action** (`mundflora aufbauen` 720), es/fr/pt scientific term (`microbiota oral` 1 600), ar **pathogen + cure** (`بكتيريا الفم` 480, competition 0.08), ru category + disease (`пробиотики для полости рта` 720), vi/th kill-the-bacteria. A translated English headline lands in none of them. For this portal: the bacteria page for *H. pylori* opens on cure in ar, on a term in es, on the organism in en — the H1 follows the entry, the mechanism follows the H1.

**Measure the country, not the language, and two phrasings per market** (JW-LAW-260813-01): `grossiste` 1 300 vs `cosmétiques en gros` 70; Arabic Saudi 210 vs UAE 10; Spanish Mexico 1 000 vs Spain 480; Portuguese Brazil 1 600 vs Portugal 0.

| Locale | Instrument / market (§0b.2) | On file |
|---|---|---|
| en | Ubersuggest US (loc 2840) | yes |
| de | Ubersuggest DE (2276) | yes |
| ru | **Yandex Wordstat** (Direct API, `SECRETS/yandex-direct.md`). Ubersuggest has no Russia; Kazakhstan only as a proxy and labelled *proxy*; Metrika/Webmaster measure our traffic, not demand | yes — Wordstat access was closed (code 58) on 2026-08-26 and 2026-09-02; say *not measured* rather than substitute |
| vi · es · pt-BR · fr · ms · pl · ro · th · tl · tr · uk | Ubersuggest per country: VN · **Mexico** first (then ES) · **Brazil** (2076) · FR · MY (second check may point to Indonesia) · PL · RO (no diacritics) · TH · PH · TR · UA | yes |
| ar | Ubersuggest **Saudi Arabia** (+ Egypt), not UAE | yes |
| tl | measure, but expect zero: Filipinos search in English (KW file; GSC PHL rows) — tl pages carry the English term in H1 if that is what measures | yes |
| zh | Ubersuggest **Taiwan, traditional script** (Singapore simplified is 20× under-reported); the locale is declared `zh-Hans` — the measured traditional form is converted, the conversion is noted (JW-MEM-260902-01) | yes |
| **ja** | **gap — no measurement on file.** Would measure with Ubersuggest Japan; Google carries the Japanese market so one instrument suffices. Not data until pulled | no |
| **ko** | **gap — no measurement on file.** Would measure with Ubersuggest Korea for Google **and Naver** (Naver Search Advisor / Keyword Tool), because Naver's share in Korea makes a Google-only number half a market. Not data until pulled | no |

Procedure per page (all locales): (1) Magnus names the entity/topic; (2) Jurgen pulls suggestions + volumes per market — Magnus asks, never invents a volume (transfer note 2026-09-02); (3) foreign brands and dropship SKUs excluded from the set; (4) old and new taxon names both measured (Firmicutes/Bacillota, Proteobacteria/Pseudomonadota); (5) volume 0 with an **empty** monthly row and non-zero difficulty = no row, not no demand — say *no data* (JW-054); (6) 10 vs 0 is a difference in kind, 20 vs 30 is noise (§7a doc); (7) no data → the brief says so and the page is written on best reading (§7a); (8) 28 days after publication Julian reads GSC impressions for that locale page — none → rewrite.

Locale priority when time is short (Owner 2026-08-09): `en · es · vn · ru · de · pt-BR · ar · uk · pl · tl · ms`; the rest, then ja/ko, wait.

---

## 4. Internal-link rules

| From → to | Rule |
|---|---|
| News → encyclopedia | every organism named in a news item links to its species (or genus) page at **first body mention**, anchor = the organism name in page language. ≥ 1 entity link per item or the item is not linked into the graph |
| News → hub | one link to its topic hub in *Bacteria in this story* or the breadcrumb |
| Encyclopedia → hub / parents | species → genus → phylum → `/bacteria/` hub, all via breadcrumb **and** body; siblings listed under the genus |
| Encyclopedia → news | *In the news* block, latest 3 automatically; the mesh is two-way or it is a defect (JW3 brief 2026-07-28: one-way mesh) |
| Hubs → children | every child page linked from its hub; a page reachable only through the sitemap is an orphan (`/learn/what-is-hemp-toothpaste` lived 15 days unlinked, JW-MEM-260824-01) |
| Cross-locale | only via hreflang + the switcher to the **same page**. No link from a localized page to the EN version as a substitute; the logo goes to the locale home (98 `/best/` pages threw readers out of their language, JW-MEM-260828-08) |
| Form | final URL form (§1.1), page language anchor, no bare URLs, every target 200 without redirect (946 links onto a 308 burned crawl budget, JW-019) |

**Product referral — Magnus's law** (Magnus CHARTER *Does* 4, MB4; Owner 2026-09-02):
- **Max one** per piece, one natural link, to the dasexperten.com page **in the same locale** (path exists and answers 200 — checked, not assumed; the `/pt/` FAQ pack does not exist, JW-MEM-260801-01).
- **Only after the mechanism is explained**, i.e. inside *What it means* / *How to support or reduce it* — and **never in the first half** of the body (check: link offset > 50 % of body text length).
- Every mention passed Maya (§4c) and `benefit-gate`; anchor is a plain noun, not *buy*; an honest *no mention this piece* is a valid audit line.
- No referral on a page whose entity is a pathogen unless the mechanism section earns it — same rule, no exception written; the audit line decides.

---

## 5. Pre-publish checklist — 10 lines a script verifies per page

1. `<title>` present, unique per locale, within §2.1 cap, ends with the brand string, not English on a non-EN page.
2. Exactly one `<h1>`; H2/H3 in page language; meta description ≤ 160 (≤ 150 Cyrillic) and ≠ lead.
3. `hreflang` count = 18 + `x-default` (19) when all locales are live; otherwise exactly *live count* + 1; every href fetched with `redirect: 'manual'` returns 200; codes match the §1.1 map (no `vn`, no bare `zh`).
4. Both images present: `<img>` with non-empty `alt`, `width`, `height`, `src` on the portal host; hero has a `<figcaption>`.
5. `rel=canonical` = self in final form = `og:url` = JSON-LD `mainEntityOfPage`; the alternate slash form answers 301 to it.
6. Every `application/ld+json` block `JSON.parse`s; required types for the page type present (§2.5); FAQ text in JSON equals visible text; `inLanguage` = locale string.
7. The URL is listed in `/sitemaps/sitemap-<lang>.xml` with `lastmod` = `dateModified`, page not `noindex`, and `<loc>` host is followed by `/`.
8. Body contains no `Made in Germany` (case-insensitive, also across a line break — a line-bound regex missed wrapped hits, JW-049), no `letter-spacing` > 0.
9. Every `\d+\s(CFU|%|ml|mg|weeks|days|n=|×)` match uses `&nbsp;` (U+00A0), never U+0020; verified in the rendered HTML, not the source.
10. Internal links: ≥ 1 entity link (news) or ≥ 1 parent + hub link (bacteria); all internal hrefs 200 without redirect; product referrals ≤ 1, offset > 50 % of body, target locale path 200.

The gate is tested with a negative test before it is trusted — remove an image alt, expect red (JW-023: a gate that never failed is not known to work). Verification after deploy happens on the **live URL in several locales**, never in the repository — a Worker or edge layer can differ from the tree (JW-001, JW-MEM-260825-02).

---

## 6. Not on file — owners (§0l: owner and date, not "awaiting")

| Gap | Owner · date |
|---|---|
| Brand string for `<title>` suffix and `Organization.name`; publisher legal entity for JSON-LD | Roberta (string) · Valentina (entity) · 2026-09-04 |
| ja / ko keyword frequencies (Ubersuggest JP/KR, Naver) | Jurgen — pull once Magnus names the first 10 entities · 2026-09-09 |
| Wordstat access for ru (Direct API code 58) | Jurgen · with Owner's application in the Direct cabinet · open since 2026-08-25 |
| URL inventory of the live `microbiomefriendly.me` (EN + `/ru/`) and the 301 map for cutover — every old URL keeps its page or gets exactly one 301 to a proven successor, else 410; no thematic guesses (JW-MEM-260901-01) | Jurgen · before the first production deploy |
| Yandex Webmaster + GSC properties for the `.me` host; IndexNow key on the host | Jurgen (properties) · Mina (key on edge) · before the first production deploy |
| News sitemap / Publisher Center | not started; decide after 30 days of news volume |

Deploy of the portal is Mina's hand, go/no-go on words is Roberta's (Magnus CHARTER); this brief is structure and checks, and I ship none of it without the tree equal to `origin/main` (§8.1).
