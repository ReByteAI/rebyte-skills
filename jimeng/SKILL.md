---
name: jimeng
description: Generate images from text prompts using ByteDance Jimeng (Seedream) via Rebyte data API. High-quality image generation with up to 4K resolution. Triggers include "generate image", "create image", "make a picture", "draw", "illustrate", "image of", "picture of", "jimeng", "seedream", "instant dream".
---

# Jimeng - Image Generation API

Generate images from text prompts using ByteDance Jimeng (Seedream 4.5), a high-quality image generation model.

{{include:auth.md}}

## Text-to-Image Generation

Create an image from a text description.

```bash
curl -X POST "$API_URL/api/data/jimeng/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A futuristic cityscape at sunset with flying cars",
    "size": "2K",
    "aspectRatio": "16:9"
  }'
```

---

## Image-to-Image Generation

Provide a reference image URL to guide generation.

```bash
curl -X POST "$API_URL/api/data/jimeng/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Transform this into a cyberpunk style",
    "image": "https://example.com/photo.jpg"
  }'
```

**Note:** The `image` parameter must be a publicly accessible URL (not base64).

---

## Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Text description of the image to generate |
| `image` | string | No | - | Public URL of a reference image (for image-to-image) |
| `model` | string | No | `seedream-4.5` | Model variant |
| `size` | string | No | `2K` | Output size: `1K`, `2K`, or `4K` |
| `aspectRatio` | string | No | `1:1` | Output aspect ratio |

**Aspect Ratios:**

| Ratio | Use Case | 2K Resolution |
|-------|----------|---------------|
| `1:1` | Square (social media, icons) | 2048x2048 |
| `16:9` | Landscape (presentations, banners) | 2560x1440 |
| `9:16` | Portrait (mobile, stories) | 1440x2560 |
| `4:3` | Standard landscape | 2304x1728 |
| `3:4` | Standard portrait | 1728x2304 |
| `3:2` | Photo landscape | 2304x1536 |
| `2:3` | Photo portrait | 1536x2304 |
| `21:9` | Ultra-wide (cinematic) | 2560x1097 |

---

## Response

```json
{
  "image": {
    "base64": "iVBORw0KGgoAAAANSUhEUgAA...",
    "mimeType": "image/png",
    "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  },
  "description": null
}
```

| Field | Description |
|-------|-------------|
| `image.base64` | Base64-encoded image data |
| `image.mimeType` | Image MIME type |
| `image.dataUrl` | Ready-to-use data URL for HTML/CSS |
| `description` | Always `null` (Seedream does not return descriptions) |

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
    image_url: str = None,
    size: str = "2K",
    aspect_ratio: str = "1:1"
) -> dict:
    """Generate an image from text, or use a reference image."""
    payload = {
        "prompt": prompt,
        "size": size,
        "aspectRatio": aspect_ratio
    }

    if image_url:
        payload["image"] = image_url

    response = requests.post(
        f"{API_URL}/api/data/jimeng/generate",
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

# Example 1: Text-to-image
result = generate_image(
    prompt="A serene mountain landscape at dawn with mist in the valley",
    aspect_ratio="16:9"
)
save_image(result, "landscape.png")

# Example 2: Image-to-image with reference URL
result = generate_image(
    prompt="Transform this into a watercolor painting",
    image_url="https://example.com/photo.jpg",
    size="2K"
)
save_image(result, "watercolor.png")
```

---

## Using with Node.js

```javascript
const fs = require('fs');
const { execSync } = require('child_process');

// Get auth token and API URL
const AUTH_TOKEN = execSync('/home/user/.local/bin/rebyte-auth').toString().trim();
const authConfig = JSON.parse(fs.readFileSync('/home/user/.rebyte.ai/auth.json'));
const API_URL = authConfig.sandbox.relay_url;

async function generateImage(prompt, options = {}) {
  const payload = {
    prompt,
    size: options.size || '2K',
    aspectRatio: options.aspectRatio || '1:1'
  };

  if (options.imageUrl) {
    payload.image = options.imageUrl;
  }

  const response = await fetch(`${API_URL}/api/data/jimeng/generate`, {
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
    { aspectRatio: '21:9', size: '2K' }
  );
  saveImage(result, 'cyberpunk.png');
})();
```

---

## Prompt Tips

```
Bad:  "A dog"
Good: "A golden retriever puppy playing in autumn leaves, warm afternoon sunlight, shallow depth of field"
```

- Be specific: describe subject, setting, lighting, mood, style
- Seedream excels at photorealistic and artistic styles
- Chinese prompts work well (the model is trained on Chinese + English)

---

## Error Handling

**Missing or Invalid Auth Token:**
```json
{
  "error": "Missing sandbox token"
}
```
Solution: Run `rebyte-auth` and include the token in your request.

**API Error:**
```json
{
  "error": "Request failed",
  "message": "Jimeng API error (400): ..."
}
```
Check your prompt and parameters. Some prompts may be blocked by content safety filters.

---

## Delivering Output

After generating images, upload them to the Artifact Store so the user can access them.

## Important Notes

- Default size is `2K` (higher quality than nano-banana's default `1K`)
- Generated images include watermarks
- The `image` parameter for image-to-image must be a **public URL**, not base64
- Chinese prompts are well supported
- Content safety filters may block certain prompts
