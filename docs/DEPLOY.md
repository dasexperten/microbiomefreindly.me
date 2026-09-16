# Deploy

**Law:** organizacia HARD_RULES §0 (GitHub-first), §8.1 (Cloudflare only from a tree identical to `origin/main`), §0i-1 (merged → deployed in the same run, report a live link).

## Where

| | |
|---|---|
| Cloudflare account | `081ddb85cb399ad62a70210328d744fc` |
| Pages project | `microbiomefriendly-portal` (direct upload, not git-connected) |
| URL | `https://microbiomefriendly.me` + `www` (also `microbiomefriendly-portal.pages.dev`) |
| Token | CF Cloud Master from the organizacia `secrets` branch (`SECRETS/cloudflare.md`) — read at deploy time, never printed, never committed; or the `CLOUDFLARE_API_TOKEN` secret of this repo for CI |

## How

```bash
git fetch origin && git status -sb          # must be clean and equal to origin/main
PORTAL_ORIGIN=https://microbiomefriendly.me npm run deploy   # = bash tools/deploy.sh; WRANGLER_OAUTH=1 uses the machine's wrangler login
```

Images are served from the portal's own domain (`/assets/img/mbf/…`, fingerprinted per file) and the same files live in R2 `dasexperten-images/mbf/…`. Since **Owner 2026-09-16** that means the per-locale derived set — `-card-<lang>.webp` (+`@2x`), `-og-<lang>.jpg`, `-plate-<lang>.webp` (+`@2x`) — beside the shared `-preview.webp`, `-hero.webp` and `-thumb.webp`, and **three masters** per topic under `mbf/masters/<slug>/`: the character card, the macro world and the text-free hero of record from which the plate is built. Masters are never served to a reader; they exist so a language can be re-set without asking an engine for the frame again.

`tools/deploy.sh` refuses a dirty tree or a HEAD that differs from `origin/main`, builds (`src/build.mjs`), runs the gate (`src/check.mjs`), writes `dist/BUILD_SHA`, then `wrangler pages deploy dist --project-name=microbiomefriendly-portal --branch=main`.

CI: `.github/workflows/build-check.yml` builds and gates every push; it deploys from `main` only when the repo secret `CLOUDFLARE_API_TOKEN` exists. Adding that secret is Mina's hand (keys are written to both stores the same session, §0f-1).

## Verify live

```bash
curl -s https://microbiomefriendly-portal.pages.dev/BUILD_SHA      # must equal git rev-parse --short origin/main
curl -sI https://microbiomefriendly-portal.pages.dev/bacteria/akkermansia-muciniphila | head -1
```

## Domain move — done 2026-09-03 (Owner)

1. `formulas.microbiomefriendly.me` attached to the product-site project `microbiomefriendly`, DNS CNAME → `microbiomefriendly.pages.dev`, verified 200.
2. Apex and `www` detached from `microbiomefriendly`.
3. Apex and `www` attached to `microbiomefriendly-portal`; both CNAMEs repointed to `microbiomefriendly-portal.pages.dev`, proxied.
4. Portal rebuilt with `PORTAL_ORIGIN=https://microbiomefriendly.me` (canonicals, hreflang, sitemaps, OG) and the footer link pointing at the formulas site.
5. Old brand paths redirect to `formulas.` from `dist/_redirects`.

Mail is untouched: the `mail` A record, MX and DMARC stay as they were.
## Deploy log

| Date | SHA | Who | Result |
|---|---|---|---|
| 2026-09-16 | `0409619` | session (Otto · Lisa · Marika) | wave 1 live — Lactobacillus, vitamin A relay, probiotics and stomach acid |
| 2026-09-16 | `5fafa7e` | session | wave 2 live — 36 more topics |
| 2026-09-16 | `26c7b9f` | session | last five topics; all 44 carry both masters |
| 2026-09-16 | `446398f` | session | image URLs fingerprinted — the edge was still serving the replaced frames |
| 2026-09-16 | `07c9b53` | session (Lisa · Otto · Marika) | nine cards recast with men after the Owner freed our own people's portraits — 35 women, 9 men, a man on every feed page, no face twice. Three frames reshot on measurement, alt text rewritten with the faces; the last took six attempts against the engine's filter and an outage |
| 2026-09-16 | `0d3e6ad` | session (Lisa · Otto · Marika) | the three-image shape: 44 character cards with the topic's question baked per language, the macro world and the infographic moved into the body, the infographic given a band of three numbered beats. 440 derived files, 88 locale files rewired. Live check: 1302 image URLs on the edge, 0 bad. Look accepted at 1440 and 390 px |
