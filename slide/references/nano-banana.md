# Nano Banana — Image Generation API

Generate images from text prompts or edit existing images using Google Nano Banana (Gemini's native image generation).

## Authentication

```bash
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")
```

Include the token in all API requests as a Bearer token, and use `$API_URL` as the base for all API endpoints.

## Models

| Model | ID | Best For | Max Resolution |
|-------|-----|----------|----------------|
| **Flash** | `flash` | Fast generation, iteration | 1024px |
| **Pro** | `pro` | Professional quality, final output | 4K |

## Text-to-Image

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic cityscape at sunset with flying cars",
    "model": "flash",
    "aspectRatio": "16:9"
  }'
```

## Image-to-Image

Edit, enhance, or transform an existing image by providing it as base64.

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Transform this into a watercolor painting style",
    "image": "<base64-encoded-image>",
    "imageMimeType": "image/png",
    "model": "pro"
  }'
```

## Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Text description or editing instructions |
| `image` | string | No | - | Base64-encoded source image (for image-to-image) |
| `imageMimeType` | string | No | `image/png` | MIME type: `image/png`, `image/jpeg`, `image/webp` |
| `model` | string | No | `flash` | `flash` (fast, 1024px) or `pro` (high-quality, up to 4K) |
| `aspectRatio` | string | No | `1:1` | Output aspect ratio |
| `imageSize` | string | No | `1K` | `1K`, `2K`, or `4K` (4K only with `pro`) |

**Aspect Ratios:**

| Ratio | Use Case |
|-------|----------|
| `1:1` | Square (social media, icons) |
| `16:9` | Landscape (presentations, banners) |
| `9:16` | Portrait (mobile, stories) |
| `4:3` | Standard landscape |
| `3:4` | Standard portrait |

## Response

```json
{
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "mimeType": "image/png",
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "description": "A vibrant futuristic cityscape..."
}
```

## Saving Images

```bash
# Generate and save in one shot
RESULT=$(curl -s -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "model": "pro", "aspectRatio": "16:9", "imageSize": "1K"}')

echo "$RESULT" | python3 -c "
import sys, json, base64
r = json.load(sys.stdin)
if 'image' in r:
    open(sys.argv[1], 'wb').write(base64.b64decode(r['image']['base64']))
else:
    print(f'Error: {r.get(\"error\", \"Unknown\")}', file=sys.stderr)
    sys.exit(1)
" /tmp/slide.png
```

## For Slide Generation

When generating full slide images:
- **Aspect ratio**: Always `16:9` (matches 1920x1080 slide canvas)
- **Model**: Use `flash` for iteration, `pro` for final output
- **Image size**: `1K` for normal slides, `2K` for high-res final exports
- **Prompt structure**: Include style instructions, slide content, and layout guidance (see `image/how-to.md` for the full prompt template)

## Model Comparison

| Feature | Flash | Pro |
|---------|-------|-----|
| Speed | Fast | Slower |
| Max Resolution | 1024px | 4K |
| Complex Prompts | Good | Excellent |
| Text Rendering | Good | Sharp |
| Best For | Quick iterations, previews | Final assets, complex edits |

## Error Handling

- **Auth error**: `{"error": "Missing sandbox token"}` — run `rebyte-auth`
- **Safety filter**: `{"error": "No image generated", "message": "SAFETY"}` — rephrase prompt
- All generated images include invisible SynthID watermarking
