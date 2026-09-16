#!/usr/bin/env bash
# measure-all.sh — prove the empty field on every accepted card, and name the frames that failed.
#   bash tools/plates/measure-all.sh <cards-master-dir>
set -uo pipefail
DIR="${1:?cards dir}"
pass=0; fail=0
for f in "$DIR"/*/*/*-card.png; do
  [ -s "$f" ] || continue
  slug=$(basename "$(dirname "$f")"); type=$(basename "$(dirname "$(dirname "$f")")")
  out="content/$type/$slug/overlay.json"
  if python3 tools/plates/measure.py "$f" --lines 2 --json "$out" >/tmp/m.json 2>/tmp/m.err; then
    echo "ok $slug $(node -e 'const j=require("/tmp/m.json");console.log("box",j.box.join(","),"contrast",j.contrast,"texture",j.gradient)' 2>/dev/null)"
    pass=$((pass+1))
  else
    echo "RESHOOT $slug — $(head -1 /tmp/m.err 2>/dev/null || head -1 /tmp/m.json)"
    fail=$((fail+1))
  fi
done
echo "fields: $pass measured · $fail to reshoot"
