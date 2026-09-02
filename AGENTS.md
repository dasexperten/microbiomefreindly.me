# AGENTS.md — session protocol for this repo

This repository is a **surface repo** of the DAS EXPERTEN organization. The organization's law, roster, charters and memory live in **[dasexperten/organizacia](https://github.com/dasexperten/organizacia)** and are loaded at the start of every session (HARD_RULES §0g). Nothing here overrides that repo; when this file and `HARD_RULES.md` disagree, `HARD_RULES.md` wins.

## Who works here

| Seat | Slug | On this portal |
|---|---|---|
| **Magnus Larsen** — lead | `magnus-larsen` | writes the microbiome · probiotic · enzyme · immunity long form (EN Greger / RU Komarovsky), runs the sweep, briefs visuals in plain words, keeps this repo's content and docs |
| Jurgen Witt | `jurgen-witt` | SEO brief: URLs, hreflang, titles, keywords per locale, site health — `docs/SEO_BRIEF.md` |
| Julian Farah | `julian-farah` | GEO brief: citability, entities, `llms.txt`, claim canon — `docs/GEO_BRIEF.md` |
| Marika Nowicka | `marika-nowicka` | slot + ratio for every image, design tokens, acceptance — `docs/BRAND_IMAGE_SPEC.md` |
| Lisa | `lisa` | writes the engine prompt and generates both images per article (Higgsfield only); uploads to R2 |
| Kobayashi | `kobayashi` | owner of `blog-writer`; Magnus borrows it under all its gates; every non-lane topic is his |
| Roberta Di Maria | `roberta-di-maria` | publication gate, EN register, calendar; the portal content go/no-go |
| Alexandra Vetrova | `alexandra-obnorskaya` | RU register gate |
| Maya Krasochkina | `maya-krasochkina` | first gate on any product fact (§4c) — none in the seed batch |
| Lauda Briana | `lauda-briana` | `benefit-gate` on anything that sells; consulting section (later phase) |
| Mina Rutunya | `mina-rutunya` | Cloudflare estate: Pages project, DNS, the domain move, secrets |

## Rules of the road

1. **Load the seat first** (organizacia HARD_RULES §9g): VOICE · CHARTER · HARD_RULES · LEARNING by trigger · MEMORY, from `~/.claude/org-ssot/organizacia/agents/<slug>/`.
2. **Edit in a clean checkout of `origin/main`**, commit, push. Report the remote SHA. Local-only is not done (§0).
3. **Deploy only from a tree identical to `origin/main`** with `tools/deploy.sh` (§8.1). Merged → deployed in the same run (§0i-1).
4. **Content gates are in the file**, not in a chat: `gates.*` in the front-matter (`docs/CONTENT_SCHEMA.md`). `status: published` is allowed only with segment-check PASS and fact-check verified; `src/check.mjs` enforces it.
5. **Agent memory is written only in organizacia** (`agents/<slug>/MEMORY.md`), one entry per run, with the SHA of this repo (§0g).
6. **Secrets never enter this repo.** The Cloudflare token is read at deploy time from the organizacia `secrets` branch or from a CI secret. Values are never printed.
7. **Owner questions are three:** money, legal signature, irreversible infrastructure (deleting the Pages project, moving the live domain). Everything else is executed and reported (§0h).
