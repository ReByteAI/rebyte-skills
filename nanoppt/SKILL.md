---
name: nanoppt
description: Generate stylized presentation slide images using Nano Banana AI. Converts article content to ASCII framework then generates AI images for each slide. Triggers include "nanoppt", "stylized slides", "AI slide images", "presentation images", "Doraemon style slides", "anime presentation". Do NOT use for regular presentations (use slide instead).
---

# NanoPPT

Generate stylized presentation images using Nano Banana (Google Gemini) image generation.

{{include:auth.md}}

---

## Workflow

```
Article -> ASCII Framework -> Select Style -> Generate Images -> Use in PPT
```

---

## Step 1: Article to ASCII Framework

Read the article, extract core information, and create ASCII layout for each slide.

See `tips/article-to-ascii-ppt.md` for detailed methodology.

---

## Step 2: Generate Images

Use `scripts/generate.py` for all image generation tasks.

### Text-to-Image (New slides)

```bash
python scripts/generate.py \
  --prompt "Doraemon style, presentation slide, title: Hello World" \
  --model pro \
  --aspect-ratio 16:9 \
  --size 2K \
  --output slide-01.png
```

### Image-to-Image (Edit/Enhance existing)

```bash
python scripts/generate.py \
  --input slide-01.png \
  --prompt "Fix the text: change Helo to Hello" \
  --model pro \
  --output slide-01-fixed.png
```

### Script Options

```
--prompt, -p    Text prompt or editing instructions (required)
--input, -i     Input image path (for image-to-image editing)
--output, -o    Output image path (required)
--model, -m     flash (fast, default) or pro (high quality)
--aspect-ratio  16:9, 1:1, 9:16, etc. (default: 16:9)
--size          1K, 2K, 4K (pro model only)
```

---

## API Reference

**Endpoint:** `POST $API_URL/api/data/images/generate`

**Authentication:** Required. Use `Authorization: Bearer $AUTH_TOKEN` header.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `prompt` | Yes | Text description or editing instructions |
| `image` | No | Base64-encoded source image (for image-to-image) |
| `imageMimeType` | No | `image/png`, `image/jpeg`, or `image/webp` (default: `image/png`) |
| `model` | No | `flash` (fast, default) or `pro` (high quality) |
| `aspectRatio` | No | `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9`, etc. |
| `imageSize` | No | `1K`, `2K`, `4K` (pro model only) |

**Example curl:**
```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Doraemon style presentation slide", "model": "flash", "aspectRatio": "16:9"}'
```

**Response:**
```json
{
  "image": {
    "base64": "iVBORw0KGgo...",
    "mimeType": "image/png",
    "dataUrl": "data:image/png;base64,..."
  },
  "description": "AI generated description"
}
```

---

## Style Examples

See `examples/` directory for 18+ style samples:
- **Anime:** Doraemon, Naruto, Ghibli, One Piece
- **Trendy:** Cyberpunk, Vaporwave, Pixel Art
- **Artistic:** Ink Wash, Van Gogh, Art Deco

See `tips/ppt-image-generation.md` for prompt keywords per style.

---

## Delivering Output

After generating slide images, upload them to the Artifact Store so the user can access them.

## Tips

| Topic | File |
|-------|------|
| Article to ASCII methodology | `tips/article-to-ascii-ppt.md` |
| Style prompt keywords | `tips/ppt-image-generation.md` |
| Text correction | `tips/text-correction.md` |
| 4K upscale | `tips/4k-upscale.md` |
