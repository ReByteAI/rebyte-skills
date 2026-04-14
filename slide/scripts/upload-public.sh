#!/usr/bin/env bash
# Upload an image to the public artifact CDN as WebP and print the publicUrl.
# Self-contained: no dependency on any other skill.
#
# Usage:
#   upload-public.sh <image-file> <prefix> <descriptive-name>
#
# Example:
#   upload-public.sh /code/slides/my-deck/01.png slide-thumb my-deck
#   → https://api.rebyte.ai/api/public/artifacts/{workspaceId}/slide-thumb-my-deck-a1b2c3.webp
#
# Requires $AUTH_TOKEN and $API_URL.
set -euo pipefail

IMAGE_FILE="${1:?Usage: upload-public.sh <image-file> <prefix> <descriptive-name>}"
PREFIX="${2:?Usage: upload-public.sh <image-file> <prefix> <descriptive-name>}"
DESC="${3:?Usage: upload-public.sh <image-file> <prefix> <descriptive-name>}"

: "${AUTH_TOKEN:?AUTH_TOKEN not set}"
: "${API_URL:?API_URL not set}"

WEBP_FILE="/tmp/upload-public-$$.webp"
trap 'rm -f "$WEBP_FILE"' EXIT

if command -v cwebp &>/dev/null; then
  cwebp -q 80 -quiet "$IMAGE_FILE" -o "$WEBP_FILE"
elif command -v convert &>/dev/null; then
  convert "$IMAGE_FILE" -quality 80 "$WEBP_FILE"
else
  python3 -c "
from PIL import Image
Image.open('$IMAGE_FILE').save('$WEBP_FILE', 'WEBP', quality=80)
"
fi

SHORT_HASH=$(sha256sum "$WEBP_FILE" | cut -c1-6)
FNAME="${PREFIX}-${DESC}-${SHORT_HASH}.webp"

RESP=$(curl -sf -X POST "$API_URL/api/artifacts/upload-url" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"files\":[{\"name\":\"${FNAME}\",\"contentType\":\"image/webp\",\"public\":true}]}")

UPLOAD_URL=$(echo "$RESP" | jq -r '.urls[0].uploadUrl')
PUBLIC_URL=$(echo "$RESP" | jq -r '.urls[0].publicUrl')

curl -sf -X PUT "$UPLOAD_URL" -H "Content-Type: image/webp" --data-binary "@$WEBP_FILE" >/dev/null

echo "$PUBLIC_URL"
