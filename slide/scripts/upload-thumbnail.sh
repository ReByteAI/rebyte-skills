#!/usr/bin/env bash
# Upload 01.png as the deck thumbnail with a deterministic filename.
# Filename is slide-thumb-{slug}.webp — no hash, so regenerating the same
# slug overwrites the previous thumbnail.
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

FNAME="slide-thumb-${SLUG}.webp"

RESP=$(curl -sf -X POST "$API_URL/api/artifacts/upload-url" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"files\":[{\"name\":\"${FNAME}\",\"contentType\":\"image/webp\",\"public\":true}]}")

UPLOAD_URL=$(echo "$RESP" | jq -r '.urls[0].uploadUrl')
PUBLIC_URL=$(echo "$RESP" | jq -r '.urls[0].publicUrl')

curl -sf -X PUT "$UPLOAD_URL" -H "Content-Type: image/webp" --data-binary "@$WEBP_FILE" >/dev/null

echo "$PUBLIC_URL"
