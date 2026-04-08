# 4K Upscale

Enhance images to 4K resolution using image-to-image.

## Usage

```bash
# 1. Read the image as base64
IMAGE_BASE64=$(base64 -i slide-01.png)

# 2. Call API with upscale prompt
RESPONSE=$(curl -s -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"prompt\": \"Enhance to 4K ultra high definition. Keep all content exactly the same.\",
    \"image\": \"$IMAGE_BASE64\",
    \"imageMimeType\": \"image/png\",
    \"model\": \"pro\",
    \"aspectRatio\": \"16:9\",
    \"imageSize\": \"4K\"
  }")

# 3. Save the 4K image
echo "$RESPONSE" | jq -r '.image.base64' | base64 -d > "slide-01-4k.png"
```

## Aspect Ratio Guide

Match the original image ratio:

| Original | aspectRatio |
|----------|-------------|
| Portrait (phone) | `3:4` or `9:16` |
| Landscape | `4:3` or `16:9` |
| Square | `1:1` |
| Widescreen | `16:9` |
| Ultra-wide | `21:9` |

## Batch Processing

Process multiple images in parallel:

```bash
for img in slide-*.png; do
  IMAGE_BASE64=$(base64 -i "$img")
  # ... API call ...
done
```

## Notes

- Always use `model: "pro"` for 4K output
- `imageSize: "4K"` only works with pro model
