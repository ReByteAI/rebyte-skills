#!/usr/bin/env bash
# Validate slide protocol invariants for a deck.
# Usage: bash validate-protocol.sh /code/slides/{slug}/index.html
#
# Checks:
#   1. index.html exists and has <section data-page="N"> elements
#   2. NN.png exists for every section (01.png, 02.png, ...)
#   3. Timestamps: all PNGs modified within 300s of each other
#   4. No relative paths in HTML (all resources must be absolute CDN URLs)
#   5. .slide marker file exists in /code/slides/
#
# Exit code 0 = pass, 1 = fail. Prints JSON report to stdout.
set -euo pipefail

HTML_FILE="${1:?Usage: validate-protocol.sh <path-to-index.html>}"
DECK_DIR="$(dirname "$HTML_FILE")"
SLIDES_DIR="$(dirname "$DECK_DIR")"
SLUG="$(basename "$DECK_DIR")"

ERRORS=()
WARNINGS=()

# --- Check 1: index.html exists ---
if [ ! -f "$HTML_FILE" ]; then
  ERRORS+=("index.html not found at $HTML_FILE")
  printf '{"deck":"%s","ok":false,"errors":%s,"warnings":[]}\n' \
    "$SLUG" "$(printf '%s\n' "${ERRORS[@]}" | jq -R . | jq -s .)"
  exit 1
fi

# --- Check 2: Count sections in HTML ---
SECTION_COUNT=$(grep -oP 'data-page="\d+"' "$HTML_FILE" | wc -l | tr -d ' ')
if [ "$SECTION_COUNT" -eq 0 ]; then
  ERRORS+=("No <section data-page> elements found in index.html")
fi

# Check sequential numbering (1..N with no gaps)
PAGES_IN_HTML=$(grep -oP 'data-page="\K\d+' "$HTML_FILE" | sort -n)
EXPECTED_SEQ=$(seq 1 "$SECTION_COUNT")
if [ "$PAGES_IN_HTML" != "$EXPECTED_SEQ" ]; then
  ERRORS+=("data-page numbering not sequential 1..$SECTION_COUNT: got [$PAGES_IN_HTML]")
fi

# --- Check 3: NN.png files (zero-padded: 01.png, 02.png, ...) ---
MISSING_PNGS=()
FOUND_PNGS=()
for (( i=1; i<=SECTION_COUNT; i++ )); do
  PADDED=$(printf '%02d' "$i")
  PNG="$DECK_DIR/${PADDED}.png"
  if [ -f "$PNG" ]; then
    FOUND_PNGS+=("$PNG")
  else
    MISSING_PNGS+=("${PADDED}.png")
  fi
done

if [ ${#MISSING_PNGS[@]} -gt 0 ]; then
  ERRORS+=("Missing PNGs: ${MISSING_PNGS[*]}")
fi

# Check for extra NN.png beyond section count
EXTRA_PAGE=$((SECTION_COUNT + 1))
EXTRA_PADDED=$(printf '%02d' "$EXTRA_PAGE")
while [ -f "$DECK_DIR/${EXTRA_PADDED}.png" ]; do
  WARNINGS+=("Extra PNG with no matching section: ${EXTRA_PADDED}.png")
  EXTRA_PAGE=$((EXTRA_PAGE + 1))
  EXTRA_PADDED=$(printf '%02d' "$EXTRA_PAGE")
done

# --- Check 4: Timestamp consistency ---
if [ ${#FOUND_PNGS[@]} -ge 2 ]; then
  OLDEST=$(stat -c %Y "${FOUND_PNGS[@]}" 2>/dev/null | sort -n | head -1 || stat -f %m "${FOUND_PNGS[@]}" 2>/dev/null | sort -n | head -1)
  NEWEST=$(stat -c %Y "${FOUND_PNGS[@]}" 2>/dev/null | sort -n | tail -1 || stat -f %m "${FOUND_PNGS[@]}" 2>/dev/null | sort -n | tail -1)
  DRIFT=$((NEWEST - OLDEST))
  if [ "$DRIFT" -gt 300 ]; then
    WARNINGS+=("PNG timestamps drift ${DRIFT}s apart (>300s) — may be from different generation runs")
  fi
fi

# --- Check 5: Relative paths in HTML (must be CDN URLs) ---
# Any src/href that isn't absolute (http/https/data:) is a relative path
# that won't resolve in srcdoc iframes. These must be uploaded to CDN first.
RELATIVE_PATHS=()
if [ -f "$HTML_FILE" ]; then
  # Find img src, video src, audio src, link href, script src with relative paths
  while IFS= read -r line; do
    RELATIVE_PATHS+=("$line")
  done < <(grep -oE '(src|href)="[^"]*"' "$HTML_FILE" | \
    grep -v '="https\?://' | \
    grep -v '="data:' | \
    grep -v '="#' | \
    sed 's/.*="\(.*\)"/\1/' | \
    sort -u)
fi

if [ ${#RELATIVE_PATHS[@]} -gt 0 ]; then
  ERRORS+=("Relative paths found — upload to CDN and rewrite: ${RELATIVE_PATHS[*]}")
fi

# --- Check 6: .slide marker ---
if [ ! -f "$SLIDES_DIR/.slide" ]; then
  ERRORS+=(".slide marker file missing in $SLIDES_DIR/")
fi

# --- Report ---
OK=true
[ ${#ERRORS[@]} -gt 0 ] && OK=false

ERR_JSON="[]"
WARN_JSON="[]"
if [ ${#ERRORS[@]} -gt 0 ]; then
  ERR_JSON=$(printf '%s\n' "${ERRORS[@]}" | jq -R . | jq -s .)
fi
if [ ${#WARNINGS[@]} -gt 0 ]; then
  WARN_JSON=$(printf '%s\n' "${WARNINGS[@]}" | jq -R . | jq -s .)
fi

printf '{"deck":"%s","sections":%d,"pngs":%d,"ok":%s,"errors":%s,"warnings":%s}\n' \
  "$SLUG" "$SECTION_COUNT" "${#FOUND_PNGS[@]}" "$OK" "$ERR_JSON" "$WARN_JSON"

if [ "$OK" = false ]; then
  exit 1
fi
