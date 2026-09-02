# Deploy

**Law:** organizacia HARD_RULES §0 (GitHub-first), §8.1 (Cloudflare only from a tree identical to `origin/main`), §0i-1 (merged → deployed in the same run, report a live link).

## Where

| | |
|---|---|
| Cloudflare account | `081ddb85cb399ad62a70210328d744fc` |
| Pages project | `microbiomefriendly-portal` (direct upload, not git-connected) |
| URL | `https://microbiomefriendly-portal.pages.dev` |
| Token | CF Cloud Master from the organizacia `secrets` branch (`SECRETS/cloudflare.md`) — read at deploy time, never printed, never committed; or the `CLOUDFLARE_API_TOKEN` secret of this repo for CI |

## How

```bash
git fetch origin && git status -sb          # must be clean and equal to origin/main
npm run deploy                              # = bash tools/deploy.sh
```

`tools/deploy.sh` refuses a dirty tree or a HEAD that differs from `origin/main`, builds (`src/build.mjs`), runs the gate (`src/check.mjs`), writes `dist/BUILD_SHA`, then `wrangler pages deploy dist --project-name=microbiomefriendly-portal --branch=main`.

CI: `.github/workflows/build-check.yml` builds and gates every push; it deploys from `main` only when the repo secret `CLOUDFLARE_API_TOKEN` exists. Adding that secret is Mina's hand (keys are written to both stores the same session, §0f-1).

## Verify live

```bash
curl -s https://microbiomefriendly-portal.pages.dev/BUILD_SHA      # must equal git rev-parse --short origin/main
curl -sI https://microbiomefriendly-portal.pages.dev/bacteria/akkermansia-muciniphila | head -1
```

## Domain move (later phase — not done)

1. Roberta's content go; Jurgen's 301 map from every live brand-site URL to its portal target (brand pages that stay must keep their URLs or move under a path).
2. Mina: attach `microbiomefriendly.me` + `www` to the portal project, detach from `microbiomefriendly` — irreversible-looking DNS change → Owner's word first (§0h).
3. `PORTAL_ORIGIN=https://microbiomefriendly.me npm run deploy` so canonicals, hreflang and sitemaps point at the domain.

## Deploy log

| Date | SHA | Who | Result |
|---|---|---|---|
| (filled by the first deploy) | | | |
