#!/usr/bin/env bash
# deploy.sh — build and deploy the portal to Cloudflare Pages (direct upload).
# Law: organizacia HARD_RULES §8.1 / §0g — deploy ONLY from a tree identical to origin/main of THIS repo.
# Token: the CF Cloud Master token from the organizacia `secrets` branch (SECRETS/cloudflare.md),
#        or CLOUDFLARE_API_TOKEN already in the environment (CI). Never printed.
# Usage: PAGES_PROJECT=microbiomefriendly-portal bash tools/deploy.sh
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$HERE"
PROJECT="${PAGES_PROJECT:-microbiomefriendly-portal}"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-081ddb85cb399ad62a70210328d744fc}"

# §8.1 proof — tree equals origin/main
git fetch origin main -q
if [ -n "$(git status --porcelain)" ]; then echo "REFUSED: working tree is dirty — commit and push first (§8.1)"; exit 2; fi
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then echo "REFUSED: HEAD $(git rev-parse --short HEAD) != origin/main $(git rev-parse --short origin/main) (§8.1)"; exit 2; fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  ORG="${ORG_REPO:-$HOME/.dasexperten/repos/organizacia}"
  CLOUDFLARE_API_TOKEN="$(git -C "$ORG" show origin/secrets:SECRETS/cloudflare.md | awk -F'`' '/CF Cloud Master/ && /cfut_/ {print $2; exit}')"
  export CLOUDFLARE_API_TOKEN
fi
[ -n "$CLOUDFLARE_API_TOKEN" ] || { echo "no Cloudflare token"; exit 3; }

export PORTAL_ORIGIN="${PORTAL_ORIGIN:-https://${PROJECT}.pages.dev}"
export BUILD_DATE="$(date -u +%Y-%m-%d)"
npm ci --silent 2>/dev/null || npm install --silent
node src/build.mjs
node src/check.mjs
SHA="$(git rev-parse --short HEAD)"
echo "$SHA" > dist/BUILD_SHA
npx --yes wrangler@4 pages deploy dist --project-name="$PROJECT" --branch=main --commit-hash="$(git rev-parse HEAD)" --commit-dirty=false
echo "deployed $SHA to $PORTAL_ORIGIN"
