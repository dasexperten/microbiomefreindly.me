# GEO BRIEF — microbiomefriendly.me portal (news · bacteria encyclopedia · topic hubs)

**As of:** 2026-09-02 · **Author:** Julian Farah, GEO Specialist (SMM) · **Lead seat:** Magnus Larsen · **Becomes:** `docs/GEO_BRIEF.md` in `dasexperten/microbiomefreindly.me`
**Rests on (organizacia, read this session):** HARD_RULES §0b · §4c · §7/7a · §9c · `docs/GEO_PRIMARY_KPI.md` · `docs/GEO_CITATION_PANEL.md` · `docs/GEO_BEST_REWRITE_BRIEF.md` · `docs/MARKET_PRIORITY.md` · `agents/roberta-di-maria/drafts/science/SPEC_COMPETITIVE_EXCLUSION_2026-08-17.md` + `EN_MASTER_oral-microbiome-imbalance_2026-08-17.md` · `agents/magnus-larsen/CHARTER.md` · my `data/CLAIM_CANON_PROBIOTIC_SYMBIOS_2026-08-06.md` · my LEARNING entries `JF-MEM-260720-06/07`, `JF-CRAFT-260809-04`, `JF-MEM-260810-01`, `JF-MEM-260808-02`, `JF-MEM-260724-03`, `JF-CRAFT-260825-01`, `JF-CRAFT-260826-05`, `JF-CRAFT-260831-01`, `JF-LAW-260806-02`.
Anything not traceable to one of those files is marked **not on file**. No number here was filled from memory.

**One honesty clause before everything else (Owner 2026-08-09, `JF-CRAFT-260809-04`).** The Cloudflare crawler log proves an engine *opened* a page. It never proves the answer quoted us. The portal's word is **retrievals**; **cited** may only be claimed from a hand-run prompt panel (`docs/GEO_CITATION_PANEL.md`). Do not ship a dashboard that says "citations" from bot analytics.

---

## 1 · What makes a page citable by an answer engine

Measured on our own estate, not taken from a vendor deck. Of seventeen `/best/` guides, the one page that took more AI-agent hits than the other sixteen combined differed on four traits at once: named comparison in a real `<table>`, five or more `<h2>`, `Article` + `Organization` + `ImageObject` schema, a sourced number in every claim (`docs/GEO_BEST_REWRITE_BRIEF.md`; 556 words against 519/525 — length was not the variable; one observation, not a law). The science-leaf spec of 2026-08-17 turned that into a body skeleton. The portal inherits it:

| # | Block | Rule (checkable) | Source |
|---|---|---|---|
| 1 | **Answer-first paragraph** | Directly under H1, **40–60 words**, self-contained, quotable whole, **no brand and no product inside it** | seo-master Mode G (`JF-MEM-260720-07`) · SPEC §6 · EN_MASTER build notes |
| 2 | **One definitional sentence per entity** | First time a phylum / genus / species / term appears: `<Name> is a <class> that <one verifiable trait>.` One sentence, one entity, no adjective stack | SPEC §1 canonical definition pattern |
| 3 | **Key facts block** | 3–7 rows, each `fact · number · source (author, year, journal, DOI/PMID)`; no row with an empty source cell | REWRITE_BRIEF trait 4 · SPEC §8 "a statement is never footnoted to a paper that does not support it" |
| 4 | **Comparison table** | News: what changed vs what was known. Encyclopedia: advantages / disadvantages or class taxonomy — **neutral rows, no minus sign against anyone** | SPEC §5 neutral taxonomy — "the block most likely to be lifted verbatim" |
| 5 | **≥5 `<h2>`**, question-form where the query is a question | | REWRITE_BRIEF trait 2 · seo-master Mode G |
| 6 | **FAQ block** | 3–5 Q/A (science leaves carry 5–7; portal minimum 3), each answer stands alone, questions in the words people type (§7a) | THIN_PAGE_REBUILD: "real questions from the query cluster" |
| 7 | **As-of line** | `**As of:** YYYY-MM-DD` visible in the body **and** `dateModified` in JSON-LD; never stamped with the build clock | HARD_RULES §9c items 1, 2, 5 |
| 8 | **Author entity** | Magnus Larsen · role line on file `Microbiologist · Science Blogger` · `Person` JSON-LD with `sameAs` | Magnus CHARTER · REWRITE_BRIEF trait 3: "authorship and date are what a model weighs" |
| 9 | **Product mention** | Never above the fold, never in the answer-first block, once, after the mechanism, Maya-confirmed | Magnus CHARTER DOES 4 · EN_MASTER build notes |
| 10 | **Sources section** | Visible on page, last content section, format in §4d | EN_MASTER "References [visible on page]" |

Three structural laws that already cost us once: hreflang only for locales that actually exist for that page (`JF-MEM-260808-02` — we advertised 16 locales on an EN-only page); validate JSON-LD **on the live URL per locale** (SPEC §6 — FAQPage truncated in prod on 14 locales); Cloudflare Pages `_redirects` silently ignores rules past ~251 (`JF-LAW-260806-02`) — 18 locales × redirects will hit that ceiling; Jurgen and Mina own the fix, this brief names it.

---

## 2 · Entity strategy — bacteria pages

The engine must resolve *which organism* before it can cite anything. Our own brand still collides with DAS Environmental Expert GmbH on `what is Das Experten` (`JF-MEM-260810-01`) — entity resolution, not ranking, and no citation work lifts that ceiling while it stands. Bacteria pages must not repeat it.

**Front-matter — one file per taxon, entity fields identical across locales:**
```yaml
taxon_rank: phylum | genus | species
canonical_name: "Akkermansia muciniphila"      # current valid Latin name, italic in body
synonyms: ["…"]                                 # every name a reader or an engine may use, old phylum names included
wikidata_qid: "Q…"                              # required; the page does not ship without it
ncbi_taxid: "…"                                 # required for genus and species
sameAs: ["https://www.wikidata.org/wiki/Q…", "https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=…"]
definition_one_line: "<Name> is a <rank> of <parent> that <one sourced trait>."
```
- **Old / new phylum names:** current name in `canonical_name`, old name in `synonyms` and in parentheses on first use in the definitional sentence. The pairs in the Owner brief (Firmicutes = Bacillota, Proteobacteria = Pseudomonadota) plus Bacteroidetes = Bacteroidota, Actinobacteria = Actinomycetota, Verrucomicrobia = Verrucomicrobiota (Akkermansia's phylum) are the 2021 ICSP renaming as I know it — **not on file in organizacia**. Magnus verifies each pair against LPSN / NCBI before it enters the canon table, committed as `data/TAXON_SYNONYMS.md` with its source line.
- **Definition pattern**, one line reused verbatim in the answer-first paragraph, `DefinedTerm.description`, `llms.txt` and the hub card: `Akkermansia muciniphila is a mucin-degrading species of the phylum Verrucomicrobiota that lives in the mucus layer of the human gut.` Same fact, same wording everywhere — the consistency rule from my SYMBIOS canon.
- **Wikidata:** enrich the taxon item in QuickStatements the way Q140479075 was built (`geo-week/2026-07-16_wikidata-Q140479075-quickstatements.md`), sourced statements only. The property ids for taxon name / parent taxon / NCBI id are from my general knowledge, **not on file** — verify in the editor before any batch.
- **Site-level entity:** `Organization` with `sameAs` → Wikidata **Q140479075** exists on dasexperten.com (`JF-MEM-260720-06` §1.1). Whether the portal binds to the *same* QID or gets its own item is **not on file** — Owner decision via Roberta before the first publish; a second unlinked brand entity repeats the Dresden collision by our own hand.

---

## 3 · Claim discipline

1. **Every number carries a named source**: author, year, journal, **DOI or PMID** — inline `(Monteagudo-Mera et al., 2019, Appl Microbiol Biotechnol, doi:10.1007/s00253-019-09978-7)` or a `[n]` resolving to the Sources section. A percentage without a source is a build failure (§6 line 6), not a style note. Exact figures, no rounding, no "about" or "up to" where the paper gives a range (REWRITE_BRIEF hard rules).
2. **No product claim without Maya** (HARD_RULES §4c · Magnus CHARTER DOES 3). Front-matter `product_claims_confirmed_by: maya · YYYY-MM-DD · <handoff path>`, or the build strips the product paragraph. Referral once, low on the page, after the mechanism.
3. **Manufacturer data is labelled, never footnoted to a paper** (SPEC §8): strain-level data for JYBC-016 is manufacturer data — written plainly, `source_type: manufacturer`, no external citation attached to it.
4. **The SYMBIOS canon is the worked example** — `agents/julian-farah/data/CLAIM_CANON_PROBIOTIC_SYMBIOS_2026-08-06.md`:

| Allowed on a SYMBIOS mention | Forbidden |
|---|---|
| *Bacillus coagulans* JYBC-016 · 4×10¹⁰ CFU per dose · spore-forming, survives manufacture, shelf storage, brushing · competitive exclusion of *S. mutans*, *P. gingivalis*, *Candida* · fluoride-free · SLS-free · no broad-spectrum antiseptic | **"+87% microbiome balance in 2 weeks"** — DETOX cytokine figure, sign-flipped and mis-attributed, cut forever · any timeline without a study line · DETOX / GINGER FORCE / EVOLUTION numbers on a SYMBIOS row · invented competitor CFU ranks · "Made in Germany" (Magnus CHARTER DOES NOT) |

**Conflict resolved by §9c — the latest summary wins.** My canon (2026-08-06) lists IL-6 −40–60 % as allowed; the science spec (2026-08-17) forbids it — no CANON_FIGURES row, model unspecified — and the EN master shipped with **no percentages at all**. Portal rule: **IL-6 / TNF-α figures do not ship until Maya creates the canon row.** I update the canon file first, then pages (its own consistency rule).

---

## 4 · Machine layer

**4a · `llms.txt`** — root plus `/<locale>/llms.txt` for every locale (the dasexperten.com file is English-only; that is the defect named in `docs/MARKET_PRIORITY.md`). Myth guard from seo-master: `llms.txt` is **not a citation lever**; it is a map. Order: one-paragraph site definition → author entity line (Magnus, role, sameAs) → `## Encyclopedia` (one line per taxon: canonical name · one-line definition · URL) → `## Topic hubs` → `## News (last 30 days)` → `## Sources policy` (one line pointing to §3) → `## Media` (hero and preview URLs for direct fetch, `JF-MEM-260724-03`). Names verbatim — CFU, strain codes, Latin — anti-simplicity rule.
**4b · `llms-full.txt`** — **not on file**; nothing on our estate ships one. Proposal, marked as mine: concatenate answer-first + Key facts + FAQ + Sources of every encyclopedia page (not news), regenerated at build, kept to a size a model pulls whole; excluded from the retrieval KPI as a non-content path (`GEO_PRIMARY_KPI.md` rule 2).
**4c · JSON-LD beyond Jurgen's set.** On file for dasexperten.com: `Organization` (+ QID), `BreadcrumbList`, `FAQPage`, `ItemList`, `Article`, `ImageObject`, `Product`; `DefinedTerm` proposed on science leaves. Portal additions:
- News: `NewsArticle` with `isBasedOn` = the named source URL, `dateModified`, `inLanguage`, `author` → `Person` (Magnus) with `sameAs`.
- Encyclopedia: `Article` + `DefinedTerm` (`name` = canonical Latin, `description` = the one-line definition, `sameAs` = Wikidata / NCBI) + `about` → the same entity. schema.org carries a pending `Taxon` type — **not on file**; Jurgen decides after checking validator eligibility.
- **`citation`** on `Article` / `NewsArticle`: array of `ScholarlyArticle` objects with `headline`, `author`, `datePublished`, `isPartOf` (journal), `sameAs` = `https://doi.org/…`. It mirrors the visible Sources section — schema mirrors visible content only (seo-master law).
- `Dataset` **only** if a downloadable table is actually published (e.g. the taxon synonym CSV). No file, no `Dataset`.
- Two images per article (preview + hero): both `ImageObject`, `Article.image` = hero, both in `sitemap-images.xml`, real `<img>` in HTML — the reachability list that shipped on the science cover 2026-07-24.
**4d · "Sources" section format** (mirrors EN_MASTER, extended):
```
## Sources
1. Monteagudo-Mera A. et al. Adhesion mechanisms mediated by probiotics and prebiotics… *Appl Microbiol Biotechnol* 2019. doi:10.1007/s00253-019-09978-7 · PMID: … · review · accessed 2026-09-02
2. <outlet>, <author>, <date>, <URL> · press · rewritten from (never copied — Magnus CHARTER DOES 5)
Manufacturer data: <what> — Das Experten product-skill, confirmed by Maya YYYY-MM-DD · no external citation
```
Rules: a type tag on every line (`primary study · review · manufacturer · press`); DOI or PMID on every scholarly line; a PMID comes from a live PubMed lookup, never from memory (§0b).

---

## 5 · Per-locale GEO notes — on file versus gap

Measurement on file: the monthly five-engine hand panel — Google AI Overview / AI Mode · ChatGPT with search · Perplexity · Gemini · Yandex / Alice (`GEO_CITATION_PANEL.md`) — and the weekly Perplexity-only answer-share panel via OpenRouter, rota Mon es · Tue en · Wed fr+ru · Thu vi · Fri ar · Sat en · Sun zh-Hans + zh-Hant + ms (`JF-MEM-260810-01`). Answer share is not citation rate; the two are never added.

| Locale | Engines that matter — **on file** | Gap / note |
|---|---|---|
| en | Google AIO, ChatGPT search, Perplexity, Gemini (panel) | EN AISV probiotic field nearly empty — 7 of 8 prompts named no brand (`JF-CRAFT-260831-01`); cheapest field to occupy |
| ru | **Yandex / Alice** in the hand panel; Yandex Webmaster API reachable with the Metrika key (`JF-CRAFT-260825-01`); RU register gate Alexandra Vetrova; contour law RU → `.ru` estate | "Yandex Neuro" as a named surface **not on file** — only "Yandex AI + Google AIO" (seo-master). `.com` showed **0 pages in Yandex search** on 25.08 — register the portal in Webmaster on day one |
| zh | Weekly Perplexity zh-Hans / zh-Hant reading (16.08: 0 of 38 named). Baidu 指数 · 小红书 RED · Zhihu · Baidu Baike named as the tool set (`geo-week/2026-07-18_MULTIMARKET-GEO-MAP.md`); Ubersuggest has no CN locations | Doubao / Baidu AI reaching a Cloudflare Pages origin from mainland China: **not on file** — no test, no ICP note anywhere. Mina tests before zh is promised |
| ko | — | **Naver: nothing on file.** Only a KR business-registration line in Jurgen's ads plan. Gap |
| ja | — | **Google JP / Yahoo Japan: nothing on file.** Gap |
| es | Panel Mon. Answer owned by Spanish pharmacy brands; the engine opens with the active substance, not the brand (`JF-CRAFT-260831-01`) | Entry word = substance / organism name, not brand — applies to bacteria pages directly |
| fr · vi · ar · ms | In the weekly rota as DISCOVERY lanes — never in the citation KPI until real queries appear | vi: language code `vi`, store path is `/vn/` (`MARKET_PRIORITY.md`); portal hreflang uses `vi` |
| de · pt-BR · pl · uk · tl · th · tr · ro | Named in §7a locale priority (de, pt-BR, pl, uk, tl) or live on the store (th, tr); no engine-specific note on file | Default to the five-engine panel; **ro** exists on no estate of ours — gap |

Law for all 18: **write the word people type** (§7a) — checked against demand data *before* the page, not after; no data → say so in the brief and write on best understanding (`JF-LAW-260808-01`). Volume does not gate GEO: a person asks an assistant in their own language regardless of Google volume (SPEC §6.5).

---

## 6 · Pre-publish GEO checklist — ten lines a script can verify

Run on built HTML + front-matter, every article, every locale. Any line red → not published.

1. `answer_first` present; the first `<p>` after `<h1>` is **40–60 words** and contains no name from the SKU list.
2. Body contains `As of: YYYY-MM-DD` (regex) **and** JSON-LD `dateModified` equals it.
3. `sources[]` has ≥1 entry matching `doi:10\.\d{4,}/\S+` **or** `PMID: \d+`.
4. `FAQPage` JSON-LD with **3–5** `Question` items, each `acceptedAnswer` non-empty; the same Q/A visible in HTML.
5. `Person` JSON-LD `name: "Magnus Larsen"` with ≥1 `sameAs` URL, and a visible author line.
6. **No unsourced percentage:** every `\d+([.,]\d+)?\s?%` in the body sits in a sentence or table row carrying a `[n]`, `doi:` or `PMID:` token.
7. Encyclopedia pages: `wikidata_qid` matches `^Q\d+$`; `sameAs` contains a wikidata.org URL; genus / species also carry `ncbi_taxid`.
8. ≥5 `<h2>` and ≥1 `<table>`; a `## Sources` heading exists and is the last content section.
9. Both images present — preview + hero — each with `alt`, both in `sitemap-images.xml`, hero in `ImageObject`.
10. If any SKU name appears: `product_claims_confirmed_by` is set and its first occurrence is below 50 % of body length; hreflang lists only locales whose file exists.

Owner of the script: Jurgen (site technical). Owner of the truth it checks: Magnus. Owner of what "cited" means afterwards: this seat.

---

## Open gaps, named (§0b)

Naver (ko) · Yahoo Japan (ja) · Yandex Neuro as a distinct surface · mainland-China reachability of CF Pages · `llms-full.txt` precedent · phylum synonym pairs · Wikidata property ids · portal `Organization` QID · `Taxon` schema eligibility · Magnus `sameAs` targets (only `biome@dasexperten.com` and the org avatar URL `https://org.dasexperten.com/assets/agents/magnus-larsen.png` are on file). None is filled with a guess above; each becomes a handoff with an owner and a date once Magnus sets them (§0l).
