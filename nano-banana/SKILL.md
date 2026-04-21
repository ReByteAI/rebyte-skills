---
version: 2
name: nano-banana
description: Generate images from text prompts or edit existing images via Rebyte data API. Two backends selectable via the `provider` field — `gemini` (default, Nano Banana 2 / Gemini 3.1 Flash) or `gpt` (OpenAI gpt-image-2). Gemini is best for multi-aspect-ratio output (512px–4K) and fast multi-image edits; gpt-image-2 is best for high-fidelity photorealism and precise text rendering. Supports text-to-image and image-to-image on both. Triggers include "generate image", "create image", "make a picture", "draw", "illustrate", "image of", "picture of", "edit image", "modify image", "enhance image", "style transfer", "nano banana", "gpt image".
---

# Image Generation API (Nano Banana 2 + GPT Image 2)

Generate or edit images via a single endpoint `POST $API_URL/api/data/images/generate`. Choose the backend via the `provider` field:

| `provider` | Model | Best For |
|------------|-------|----------|
| `gemini` (default) | `gemini-3.1-flash-image-preview` (Nano Banana 2) | Multi-aspect-ratio output, 512px–4K, fast iterations, multi-image editing |
| `gpt` | `gpt-image-2` (OpenAI) | High-fidelity photorealism, precise text rendering, transparent-mode fine control |

Both providers support text-to-image and image-to-image (image-to-image is triggered by supplying the `image` field as base64).

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

## Gemini (default provider) — Text-to-Image

Create an image from a text description.

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic cityscape at sunset with flying cars",
    "aspectRatio": "16:9",
    "imageSize": "2K"
  }'
```

---

## Gemini — Image-to-Image

Edit, enhance, or transform an existing image by providing it as base64.

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Transform this into a watercolor painting style",
    "image": "<base64-encoded-image>",
    "imageMimeType": "image/png"
  }'
```

**Use Cases:**
- **Style Transfer**: "Make this photo look like a Van Gogh painting"
- **Enhancement**: "Improve the lighting and colors"
- **Editing**: "Remove the background and replace with a beach scene"
- **Text Correction**: "Fix the text in this image: change 'Helo' to 'Hello'"

---

## GPT Image 2 (provider: "gpt")

Use OpenAI's `gpt-image-2` for state-of-the-art photorealism and text rendering. Pass `"provider": "gpt"` to switch backends. Both text-to-image and image-to-image are supported.

### Cost guide — pick `quality` deliberately

This endpoint spends user credits. The gpt-image-2 backend is token-priced, so credits scale with `quality`:

| Call | Credits charged (1 credit = $0.01) |
|------|-----------------------------------|
| `provider: 'gemini'` (any) | **10** ($0.10) |
| `provider: 'gpt'`, `quality: 'low'` | **10** ($0.10) |
| `provider: 'gpt'`, `quality: 'medium'` or `'auto'` | **15** ($0.15) |
| `provider: 'gpt'`, `quality: 'high'` | **25** ($0.25) |

**Rules of thumb:**
- **Default to Gemini** for most image needs — it's cheaper and covers aspect ratios up to 4K.
- **Only use `provider: 'gpt'`** when the user specifically needs photorealism, precise text rendering in the image, or a layout gpt-image-2 handles better.
- **Only use `quality: 'high'`** for final deliverables (e.g. a single hero image), never for drafts, iterations, or batches. For iteration, use `quality: 'medium'` or `'low'`.
- If the user hasn't specified quality, omit it (= `auto` = medium tier). Don't upgrade to `'high'` unprompted.

### Text-to-image

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gpt",
    "prompt": "A minimalist poster reading \"HELLO WORLD\" in bold serif type, cream background",
    "size": "1024x1536",
    "quality": "high",
    "outputFormat": "png"
  }'
```

### Image-to-image (edits)

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "gpt",
    "prompt": "Replace the sky with a vivid aurora; keep the foreground untouched",
    "image": "<base64-encoded-image>",
    "imageMimeType": "image/png",
    "quality": "high"
  }'
```

---

## Parameters

### Shared (all providers)

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `provider` | string | No | `gemini` | `gemini` or `gpt` |
| `prompt` | string | Yes | - | Text description or editing instructions |
| `image` | string | No | - | Base64-encoded source image (triggers image-to-image) |
| `imageMimeType` | string | No | `image/png` | MIME type: `image/png`, `image/jpeg`, `image/webp` |

### Gemini-only

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `aspectRatio` | string | No | `1:1` | Output aspect ratio |
| `imageSize` | string | No | `1K` | Output size: `512`, `1K`, `2K`, or `4K` |

### GPT-only

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `size` | string | No | `auto` | `1024x1024`, `1024x1536`, `1536x1024`, or `auto` |
| `quality` | string | No | `auto` | `low`, `medium`, `high`, or `auto` |
| `outputFormat` | string | No | `png` | `png`, `webp`, or `jpeg` |
| `background` | string | No | `auto` | `opaque` or `auto` (gpt-image-2 does not support transparent) |
| `moderation` | string | No | `auto` | `auto` or `low` (less restrictive filtering) |
| `n` | number | No | `1` | Images to request (response still normalises to the first image) |

**Aspect Ratios:**

| Ratio | Use Case |
|-------|----------|
| `1:1` | Square (social media, icons) |
| `16:9` | Landscape (presentations, banners) |
| `9:16` | Portrait (mobile, stories) |
| `4:3` | Standard landscape |
| `3:4` | Standard portrait |
| `21:9` | Ultra-wide (cinematic) |
| `4:1`, `8:1` | Extreme landscape (panoramic) |
| `1:4`, `1:8` | Extreme portrait (tall banners) |
| `2:3`, `3:2`, `4:5`, `5:4` | Various formats |

**Image Sizes:**

| Size | Resolution | Best For |
|------|-----------|----------|
| `512` | 512px | Quick previews, thumbnails |
| `1K` | ~1024px | Standard web use (default) |
| `2K` | ~2048px | High-quality web, presentations |
| `4K` | ~4096px | Print, final assets |

---

## Response

```json
{
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "mimeType": "image/png",
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "description": "A vibrant futuristic cityscape...",
  "provider": "gemini",
  "model": "gemini-3.1-flash-image-preview"
}
```

| Field | Description |
|-------|-------------|
| `image.base64` | Base64-encoded image data |
| `image.mimeType` | Image MIME type (typically `image/png`) |
| `image.dataUrl` | Ready-to-use data URL for HTML/CSS |
| `description` | Model's description (gemini) or revised_prompt (gpt); may be null |
| `provider` | `gemini` or `gpt` — the backend that served this request |
| `model` | Exact model snapshot used |

---

## Using with Python

```python
import subprocess
import requests
import base64
import json
from pathlib import Path

# Get auth token and API URL
AUTH_TOKEN = subprocess.check_output(["/home/user/.local/bin/rebyte-auth"]).decode().strip()
with open('/home/user/.rebyte.ai/auth.json') as f:
    API_URL = json.load(f)['sandbox']['relay_url']

HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}

def generate_image(
    prompt: str,
    image_path: str = None,
    provider: str = "gemini",
    **kwargs,
) -> dict:
    """Generate an image from text, or edit an existing image.

    kwargs are passed through as-is — use gemini keys (aspectRatio, imageSize)
    or gpt keys (size, quality, outputFormat, background, moderation, n).
    """
    payload = {"prompt": prompt, "provider": provider, **kwargs}

    # Add source image for image-to-image (both providers)
    if image_path:
        image_data = Path(image_path).read_bytes()
        payload["image"] = base64.b64encode(image_data).decode()
        ext = Path(image_path).suffix.lower()
        mime_map = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}
        payload["imageMimeType"] = mime_map.get(ext, 'image/png')

    response = requests.post(
        f"{API_URL}/api/data/images/generate",
        headers=HEADERS,
        json=payload
    )
    return response.json()

def save_image(result: dict, filepath: str) -> None:
    """Save generated image to a file."""
    if "image" in result:
        image_data = base64.b64decode(result["image"]["base64"])
        Path(filepath).write_bytes(image_data)
        print(f"Saved to {filepath}")
    else:
        print(f"Error: {result.get('error', 'Unknown error')}")

# Example 1: Gemini text-to-image (default provider)
result = generate_image(
    prompt="A serene mountain landscape at dawn with mist in the valley",
    aspectRatio="16:9",
)
save_image(result, "landscape.png")

# Example 2: Gemini image-to-image (style transfer)
result = generate_image(
    prompt="Transform this into a watercolor painting",
    image_path="photo.jpg",
    imageSize="2K",
)
save_image(result, "watercolor.png")

# Example 3: GPT Image 2 text-to-image — high-fidelity text rendering
result = generate_image(
    prompt='A minimalist poster reading "HELLO WORLD" in bold serif, cream background',
    provider="gpt",
    size="1024x1536",
    quality="high",
)
save_image(result, "poster.png")

# Example 4: GPT Image 2 image-to-image (edits)
result = generate_image(
    prompt="Replace the sky with a vivid aurora; keep the foreground untouched",
    image_path="photo.jpg",
    provider="gpt",
    quality="high",
)
save_image(result, "aurora.png")
```

---

## Using with Node.js

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get auth token and API URL
const AUTH_TOKEN = execSync('/home/user/.local/bin/rebyte-auth').toString().trim();
const authConfig = JSON.parse(fs.readFileSync('/home/user/.rebyte.ai/auth.json'));
const API_URL = authConfig.sandbox.relay_url;

async function generateImage(prompt, options = {}) {
  const payload = {
    prompt,
    aspectRatio: options.aspectRatio || '1:1',
    imageSize: options.imageSize || '1K'
  };

  // Add source image for image-to-image
  if (options.imagePath) {
    const imageBuffer = fs.readFileSync(options.imagePath);
    payload.image = imageBuffer.toString('base64');
    const ext = path.extname(options.imagePath).toLowerCase();
    const mimeMap = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'};
    payload.imageMimeType = mimeMap[ext] || 'image/png';
  }

  const response = await fetch(`${API_URL}/api/data/images/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return response.json();
}

function saveImage(result, filepath) {
  if (result.image) {
    const buffer = Buffer.from(result.image.base64, 'base64');
    fs.writeFileSync(filepath, buffer);
    console.log(`Saved to ${filepath}`);
  } else {
    console.error('Error:', result.error || 'Unknown error');
  }
}

// Example: Text-to-image
(async () => {
  const result = await generateImage(
    'A neon-lit cyberpunk street scene at night',
    { aspectRatio: '21:9', imageSize: '2K' }
  );
  saveImage(result, 'cyberpunk.png');
})();

// Example: Image-to-image
(async () => {
  const result = await generateImage(
    'Make this look like a Studio Ghibli animation',
    { imagePath: 'photo.jpg', imageSize: '2K' }
  );
  saveImage(result, 'ghibli_style.png');
})();
```

---

## Prompt Tips

### Text-to-Image
```
Bad:  "A dog"
Good: "A golden retriever puppy playing in autumn leaves, warm sunlight"
```

### Image-to-Image
```
Style Transfer: "Transform into oil painting style", "Make it look like anime"
Enhancement: "Improve lighting and contrast", "Make colors more vibrant"
Editing: "Remove the person in the background", "Add a rainbow to the sky"
Text Fix: "Change the text from 'Helo' to 'Hello'"
```

---

## Error Handling

**Missing or Invalid Auth Token:**
```json
{
  "error": "Missing sandbox token"
}
```
Solution: Run `rebyte-auth` and include the token in your request.

**No Image Generated:**
```json
{
  "error": "No image generated",
  "message": "SAFETY"
}
```
This occurs when the prompt triggers content safety filters.

---

## Delivering Output

After generating images, upload them to the Artifact Store so the user can access them.

## Important Notes

- All generated images include invisible **SynthID watermarking**
- Images are generated server-side; base64 responses can be large
- Use `imageSize` to control quality/speed tradeoff: `512` for fast previews, `4K` for final assets
- Content safety filters may block certain prompts
- For image-to-image, the source image is sent as base64 in the request body
