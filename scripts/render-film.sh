#!/usr/bin/env bash
# Render the full documentary in chunks, then join them losslessly.
#
#   scripts/render-film.sh [composition] [chunks] [extra remotion flags...]
#   e.g.  scripts/render-film.sh Documentary-720p 6
#         scripts/render-film.sh Documentary 4 --gl=angle --concurrency=4
#
# A chunk that already exists is skipped, so an interrupted render can be
# resumed by running the same command again. Output: out/<composition>.mp4
set -euo pipefail
cd "$(dirname "$0")/.."

COMP="${1:-Documentary-720p}"
CHUNKS="${2:-6}"
shift 2 || true
EXTRA=("$@")

TOTAL=$(npx remotion compositions "${EXTRA[@]}" 2>/dev/null | awk -v c="$COMP" '$1==c {print $4}')
if [ -z "${TOTAL}" ]; then
  echo "Could not find composition ${COMP}" >&2
  exit 1
fi
DIR="out/chunks-${COMP}"
mkdir -p "$DIR"
STEP=$(( (TOTAL + CHUNKS - 1) / CHUNKS ))
: > "$DIR/list.txt"
for ((i = 0; i < CHUNKS; i++)); do
  FROM=$(( i * STEP ))
  TO=$(( (i + 1) * STEP - 1 ))
  [ "$TO" -ge "$TOTAL" ] && TO=$(( TOTAL - 1 ))
  [ "$FROM" -gt "$TO" ] && break
  OUT="$DIR/part-$(printf %02d "$i").mp4"
  echo "file '$(basename "$OUT")'" >> "$DIR/list.txt"
  if [ -s "$OUT" ]; then
    echo "chunk $i ($FROM-$TO) already rendered, skipping"
    continue
  fi
  echo "rendering chunk $i: frames $FROM-$TO of $TOTAL"
  npx remotion render "$COMP" "$OUT.tmp.mp4" --frames="$FROM-$TO" --log=error "${EXTRA[@]}"
  mv "$OUT.tmp.mp4" "$OUT"
done
ffmpeg -y -loglevel error -f concat -safe 0 -i "$DIR/list.txt" -c copy "out/${COMP}.mp4"
echo "done: out/${COMP}.mp4"
