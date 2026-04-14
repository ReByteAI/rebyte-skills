#!/usr/bin/env bash
# Upload 01.png as the deck thumbnail.
# Filename is slide-thumb-{slug}-{timestamp}.webp — timestamp is a unix
# epoch so every upload gets a unique URL (plays well with the immutable
# CDN cache). Client lists files by prefix "slide-thumb-{slug}-" and picks
# the most recent to find the latest thumbnail for a deck.
#
# Usage: upload-thumbnail.sh <path-to-01.png> <slug>
#
# Requires $AUTH_TOKEN and $API_URL.
set -euo pipefail

PNG_FILE="${1:?Usage: upload-thumbnail.sh <path-to-01.png> <slug>}"
SLUG="${2:?Usage: upload-thumbnail.sh <path-to-01.png> <slug>}"

: "${AUTH_TOKEN:?AUTH_TOKEN not set}"
: "${API_URL:?API_URL not set}"

WEBP_FILE="/tmp/upload-thumbnail-$$.webp"
trap 'rm -f "$WEBP_FILE"' EXIT

if command -v cwebp &>/dev/null; then
  cwebp -q 80 -quiet "$PNG_FILE" -o "$WEBP_FILE"
elif command -v convert &>/dev/null; then
  convert "$PNG_FILE" -quality 80 "$WEBP_FILE"
else
  python3 -c "
from PIL import Image
Image.open('$PNG_FILE').save('$WEBP_FILE', 'WEBP', quality=80)
"
fi

TIMESTAMP=$(date -u +%s)
FNAME="slide-thumb-${SLUG}-${TIMESTAMP}.webp"

RESP=$(curl -sf -X POST "$API_URL/api/artifacts/upload-url" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"files\":[{\"name\":\"${FNAME}\",\"contentType\":\"image/webp\",\"public\":true}]}")

UPLOAD_URL=$(echo "$RESP" | jq -r '.urls[0].uploadUrl')
PUBLIC_URL=$(echo "$RESP" | jq -r '.urls[0].publicUrl')

curl -sf -X PUT "$UPLOAD_URL" -H "Content-Type: image/webp" --data-binary "@$WEBP_FILE" >/dev/null

echo "$PUBLIC_URL"
