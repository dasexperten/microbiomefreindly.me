#!/usr/bin/env bash
# run-cards.sh — one character frame per topic (§4e-2: one, two at most, and the second explains itself).
# Reads the assembled tasks, hands the REF to the engine as the image input, writes the master beside it.
#   bash tools/plates/run-cards.sh <cards-generate.json> <out-dir> [slug …]
set -uo pipefail
J="${1:?tasks json}"
OUT="${2:?out dir}"
shift 2 || true

TSV="$(mktemp)"
ONLY_JSON="$(printf '%s\n' "$@" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>process.stdout.write(JSON.stringify(s.split("\n").filter(Boolean))))')"
ONLY_JSON="$ONLY_JSON" node -e '
const j = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const only = JSON.parse(process.env.ONLY_JSON || "[]");
const rows = [];
for (const [slug, r] of Object.entries(j)) {
  if (only.length && !only.includes(slug)) continue;
  rows.push([slug, r.type, r.media || r.url, r.prompt.replace(/\s+/g, " ")].join("\t"));
}
require("fs").writeFileSync(process.argv[2], rows.join("\n") + "\n");
' "$J" "$TSV"

while IFS=$'\t' read -r slug type ref prompt; do
  [ -z "${slug:-}" ] && continue
  dst="$OUT/$type/$slug/$slug-card.png"
  mkdir -p "$(dirname "$dst")"
  if [ -s "$dst" ]; then echo "skip $slug"; continue; fi
  # the engine takes a UUID or a file; a public address is neither, so the REF is fetched once and kept
  case "$ref" in
    http*)
      mkdir -p "$OUT/_refs"
      cache="$OUT/_refs/$(basename "${ref%%\?*}")"
      [ -s "$cache" ] || curl -sfL -o "$cache" "$ref" || { echo "FAIL-REF $slug"; continue; }
      ref="$cache" ;;
  esac
  url=$(higgsfield generate create nano_banana_2 --aspect_ratio 3:2 --resolution 2k --image "$ref" --prompt "$prompt" --wait </dev/null 2>&1 | grep -o 'https://[^ ]*/hf_[^ ]*\.png' | tail -1)
  if [ -z "$url" ]; then echo "FAIL $slug"; continue; fi
  if curl -sfL -o "$dst" "$url"; then
    echo "ok $slug $(sips -g pixelWidth -g pixelHeight "$dst" | tail -2 | awk '{print $2}' | tr '\n' 'x')"
  else
    echo "FAIL-DL $slug"
  fi
done < "$TSV"
rm -f "$TSV"
