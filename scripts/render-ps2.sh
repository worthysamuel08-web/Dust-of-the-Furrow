#!/usr/bin/env bash
# Render a PS2-style composition at its small native size, then enlarge it 3x with
# nearest-neighbour scaling (hard pixels, like a PS2 on a big screen) to 1080x1920.
#   scripts/render-ps2.sh [composition] [output]   e.g. scripts/render-ps2.sh PS2Test out/ps2-test.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
COMP="${1:-PS2Test}"
OUT="${2:-out/ps2-test.mp4}"
mkdir -p out
SMALL="out/.${COMP}-native.mp4"
npx remotion render "$COMP" "$SMALL" --gl=swangle "${@:3}"
ffmpeg -v error -y -i "$SMALL" -vf "scale=1080:1920:flags=neighbor" -c:v libx264 -crf 16 -pix_fmt yuv420p -c:a copy "$OUT"
echo "→ $OUT"
