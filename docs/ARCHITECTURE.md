# Architecture

**As of:** 2026-09-02

## One sentence

Markdown in `content/` → `src/build.mjs` → static HTML in `dist/` → Cloudflare Pages (direct upload). No framework, no runtime, no database on the portal itself.

## Why static

The brand site next door (`microbiomefriendly.me`, `das-architektura/PROJECTS/microbiomefriendly/public`) is plain HTML on Pages and has been stable since June. A news portal with a few hundred pages in 18 locales needs exactly what Pages gives for free: global edge, clean URLs, `_headers`, `_redirects`, custom domains. Search and answer engines get complete HTML with JSON-LD; nothing is rendered client-side.

## URL map

| URL | Page | Locale rule |
|---|---|---|
| `/` · `/<lang>/` | home: latest news, encyclopedia teaser, hubs | root = `en` (also `x-default`); every other locale under its prefix |
| `/news/` · `/<lang>/news/` | all news | hubs and lists end with `/` |
| `/news/<slug>` | one news item | leaves have no trailing slash (Pages serves `<slug>.html`, `/<slug>/` redirects) |
| `/bacteria/` · `/bacteria/<slug>` | encyclopedia index (by rank) · entry | bacteria slugs are the ASCII Latin name in **every** locale (SEO_BRIEF §1.2) |
| `/topics/` · `/topics/<topic>/` | hubs: gut · oral · immunity · enzymes · metabolic · skin · brain | |
| `/about` | the author entity (Person JSON-LD) | |
| `/sitemap.xml` → `/sitemaps/sitemap-<lang>.xml` | index + one child per live locale | |
| `/llms.txt` · `/<lang>/llms.txt` | answer-engine index of published pages | |
| `/robots.txt` | open, `Content-Signal`, sitemap pointer | |

A locale is **live** when at least one published article exists in it; only live locales get chrome pages, sitemaps and hreflang entries. An article's hreflang set is exactly the set of its existing language files (JW-055: never synthesized from prefix + slug).

## Page anatomy (article)

breadcrumb → kicker → **H1** → answer-first paragraph (≤ 60 words) → byline (author, published, facts checked) → **character card 3:2** (`figure.article-card`, when accepted) → entity block (bacteria) → prose with footnote markers, carrying the **macro world 3:2** (`figure.figworld`) before the 2nd `## ` and the **infographic plate 4:3** (`figure.figplate--band`) before the 4th `## ` → Key facts → FAQ (`<details>`) → Sources (generated) → related rail (3 cards, same topic). JSON-LD: `NewsArticle`/`Article` with `citation` per source and `about` for the organism, `BreadcrumbList`, `FAQPage` when FAQ exists.

**No figure on an article page carries a `<figcaption>` today**, and each one has its own reason: the card's words are inside the frame in this page's language, so a caption would be the same sentence twice; the plate's explanation is set on the band beneath the frame, in the same language, for the same reason; the macro world says what it shows in its `alt`. The one case that still emits a caption is the **fallback** plate — a bare accepted `hero` on a topic that has no band yet — which carries `heroAlt` under it. Figure placement takes an explicit `[fig:world]` / `[fig:plate]` marker when the body has one; otherwise the build places them at the headings named above, never in the first two blocks and never last.

## Images

Three slots per article (`docs/BRAND_IMAGE_SPEC.md`), two of them per locale — **card 3:2** (feed card, article lead and the source of the og band), **macro world 3:2** and **infographic plate 4:3**, with `hero 16:9` kept as the plate's text-free master of record. Files live on R2 `dasexperten-images` under `mbf/<type>/<slug>/`; the build only references the URLs written into front-matter after Marika's acceptance.

The build degrades in one direction, so a topic that has not been through the new lane still renders: top image = `card || preview`, in-body 3:2 = `preview` (only once a card exists, or the same frame would appear twice), in-body 4:3 = `plate || hero`, `og:image` = `og || card || preview`. Until anything is accepted the card shows a neutral placeholder and the page carries no figures. Every `/assets/img/mbf/…` URL is fingerprinted with `?v=<sha1>` by the build, because the edge serves these files immutable for a year and a re-cut frame at the same path would otherwise never reach a reader.

**og:image is now per locale** — it is the centre band of that language's card master, so the social card of `/ru/…` is not the social card of `/…`.

## Typography and script fallbacks

Tokens are the brand site's (`src/assets/css/portal.css` `:root`). One display family (Bricolage Grotesque) + one text family (Hanken Grotesk); per-script system fallbacks for ja / ko / zh-Hans / ar / th because the brand faces carry no glyphs for them; `dir="rtl"` for Arabic with logical CSS properties. Numbers are joined to their unit with U+00A0 by the build (§4h-2). No positive letter-spacing anywhere (§4h).

## What lives on Cloudflare

| Thing | Name | Notes |
|---|---|---|
| Pages project | `microbiomefriendly-portal` | direct upload from `tools/deploy.sh`; `*.pages.dev` until the domain move |
| Pages project (brand site) | `microbiomefriendly` | untouched by this repo |
| Zone | `microbiomefriendly.me` (`4eed0cf25d5d527c6dba618e1391f457`) | apex + www → brand site today; the portal move is a later, Owner-gated step |
| Worker (seat) | `magnus-microbiome` | organizacia fleet seat; cron empty until the Owner opens the clock |
| R2 | `dasexperten-images` → `mbf/…` | article images after acceptance |

## Repo layout

See the table in [README.md](../README.md).
