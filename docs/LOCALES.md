# Locales

**As of:** 2026-09-02 · Registry: `src/i18n/locales.json` · UI strings: `src/i18n/ui.json`

18 locales = the 16 hreflang codes verified live on dasexperten.com (Jurgen Witt, 2026-08-05: `ar de es fr ms pt-BR ru th tl uk vi pl ro tr zh-Hans` + `en`) plus `ja` and `ko` (Owner 2026-09-02).

| Code | Language | Path | Direction | Priority (§7a, Owner order) | Keyword measurement (§0b.2) | Content today |
|---|---|---|---|---|---|---|
| `en` | English | `/` (x-default) | ltr | 1 | Ubersuggest by country | seed batch |
| `es` | Spanish | `/es/` | ltr | 2 | Ubersuggest | chrome only |
| `vi` | Vietnamese | `/vi/` | ltr | 3 (Owner market decision) | Ubersuggest | chrome only |
| `ru` | Russian | `/ru/` | ltr | 4 | **Yandex Wordstat** only — Ubersuggest has no RU data | seed batch |
| `de` | German | `/de/` | ltr | 5 | Ubersuggest | chrome only |
| `pt-BR` | Portuguese (Brazil) | `/pt-BR/` | ltr | 6 | Ubersuggest | chrome only |
| `ar` | Arabic | `/ar/` | **rtl** | 7 | Ubersuggest | chrome only |
| `uk` | Ukrainian | `/uk/` | ltr | 8 | Ubersuggest | chrome only |
| `pl` | Polish | `/pl/` | ltr | 9 | Ubersuggest | chrome only |
| `tl` | Filipino | `/tl/` | ltr | 10 | Ubersuggest | chrome only |
| `ms` | Malay | `/ms/` | ltr | 11 | Ubersuggest | chrome only |
| `fr` | French | `/fr/` | ltr | — | Ubersuggest | chrome only |
| `ro` | Romanian | `/ro/` | ltr | — | Ubersuggest | chrome only |
| `th` | Thai | `/th/` | ltr | — | Ubersuggest | chrome only |
| `tr` | Turkish | `/tr/` | ltr | — | Ubersuggest | chrome only |
| `zh-Hans` | Chinese (Simplified) | `/zh-Hans/` | ltr | — | Ubersuggest **Taiwan, traditional script** (Singapore undercounts 20×) | chrome only |
| `ja` | Japanese | `/ja/` | ltr | new | **gap** — would be Ubersuggest Japan; nothing measured | chrome only |
| `ko` | Korean | `/ko/` | ltr | new | **gap** — would be Ubersuggest Korea + Naver; nothing measured | chrome only |

"Chrome only" = home, lists, about and footer exist in that language with a notice that articles are being prepared; no article files, therefore no hreflang entries and no sitemap rows for articles (hreflang honesty, JF-MEM-260808-02).

**Slug policy** (`docs/SEO_BRIEF.md` §1.2): bacteria pages keep the ASCII Latin binomial in every locale; news and hubs may take a measured localized slug later — until measured they keep the EN slug (the `slug` front-matter field per file allows the override).

**Voices:** EN — Michael Greger cadence; RU — Dr. Komarovsky (Owner 2026-09-02). Other locales inherit the EN register until Roberta names a voice per market.
