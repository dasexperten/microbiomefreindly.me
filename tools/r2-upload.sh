#!/usr/bin/env bash
# r2-upload.sh — push the derived slot files to R2 dasexperten-images under mbf/… (docs/BRAND_IMAGE_SPEC.md §1.4).
# Usage: bash tools/r2-upload.sh <out-dir-with-upload-plan.json>
# Token: CLOUDFLARE_API_TOKEN in env, or the CF Cloud Master token read from the organizacia secrets branch (never printed).
set -euo pipefail
OUT="${1:?out dir}"
PLAN="$OUT/upload-plan.json"
[ -f "$PLAN" ] || { echo "no $PLAN"; exit 2; }
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-081ddb85cb399ad62a70210328d744fc}"
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  ORG="${ORG_REPO:-$HOME/.dasexperten/repos/organizacia}"
  CLOUDFLARE_API_TOKEN="$(git -C "$ORG" show origin/secrets:SECRETS/cloudflare.md | awk -F'`' '/CF Cloud Master/ && /cfut_/ {print $2; exit}')"
  export CLOUDFLARE_API_TOKEN
fi
n=0
node -e "for (const r of require(process.argv[1])) console.log(r.key + '\t' + r.file)" "$PLAN" | while IFS=$'\t' read -r key file; do
  ct="image/webp"; case "$file" in *.jpg|*.jpeg) ct="image/jpeg";; *.png) ct="image/png";; esac
  npx --no-install wrangler r2 object put "dasexperten-images/$key" --file="$file" --content-type="$ct" --remote >/dev/null 2>&1 && echo "ok  $key" || echo "ERR $key"
done
