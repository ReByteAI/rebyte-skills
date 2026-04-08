---
name: nano-banana
description: Generate images from text prompts or edit existing images using Google Nano Banana 2 (Gemini 3.1 Flash image generation) via Rebyte data API. Supports multi-size output (512px–4K), improved text rendering, and multi-image input. Use for text-to-image generation or image-to-image editing/enhancement. Triggers include "generate image", "create image", "make a picture", "draw", "illustrate", "image of", "picture of", "edit image", "modify image", "enhance image", "style transfer", "nano banana".
---

# Nano Banana 2 - Image Generation API

Generate images from text prompts or edit existing images using Google Nano Banana 2 (Gemini 3.1 Flash — `gemini-3.1-flash-image-preview`).

**Key capabilities:**
- Multi-size output: 512px, 1K, 2K, 4K
- Improved text rendering
- Multi-image input for editing and style transfer
- Multiple aspect ratios (1:1, 16:9, 9:16, etc.)

{{include:auth.md}}

## Text-to-Image Generation

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

## Image-to-Image Generation

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

## Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prompt` | string | Yes | - | Text description or editing instructions |
| `image` | string | No | - | Base64-encoded source image (for image-to-image) |
| `imageMimeType` | string | No | `image/png` | MIME type: `image/png`, `image/jpeg`, `image/webp` |
| `aspectRatio` | string | No | `1:1` | Output aspect ratio |
| `imageSize` | string | No | `1K` | Output size: `512`, `1K`, `2K`, or `4K` |

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
  "description": "A vibrant futuristic cityscape..."
}
```

| Field | Description |
|-------|-------------|
| `image.base64` | Base64-encoded image data |
| `image.mimeType` | Image MIME type (typically `image/png`) |
| `image.dataUrl` | Ready-to-use data URL for HTML/CSS |
| `description` | Model's description of the generated image |

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
    aspect_ratio: str = "1:1",
    image_size: str = "1K"
) -> dict:
    """Generate an image from text, or edit an existing image."""
    payload = {
        "prompt": prompt,
        "aspectRatio": aspect_ratio,
        "imageSize": image_size
    }

    # Add source image for image-to-image
    if image_path:
        image_data = Path(image_path).read_bytes()
        payload["image"] = base64.b64encode(image_data).decode()
        # Detect mime type from extension
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

# Example 1: Text-to-image
result = generate_image(
    prompt="A serene mountain landscape at dawn with mist in the valley",
    aspect_ratio="16:9"
)
save_image(result, "landscape.png")

# Example 2: Image-to-image (style transfer)
result = generate_image(
    prompt="Transform this into a watercolor painting",
    image_path="photo.jpg",
    image_size="2K"
)
save_image(result, "watercolor.png")

# Example 3: High-resolution output
result = generate_image(
    prompt="A detailed botanical illustration of a rose",
    image_size="4K"
)
save_image(result, "rose_4k.png")
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
