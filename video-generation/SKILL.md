---
version: 1
name: video-generation
description: Generate videos from text prompts or images using Google Veo via Rebyte data API. Use for text-to-video generation or image-to-video animation. Triggers include "generate video", "create video", "make a video", "animate", "video of", "text to video", "image to video", "video generation".
---

# Video Generation

Generate videos from text descriptions or animate images using Google Veo 3.1 Fast via the Rebyte data proxy.

## Authentication

**IMPORTANT:** All API requests require authentication. Get your auth token and API URL by running:

```bash
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")
```

Include the token in all API requests as a Bearer token, and use `$API_URL` as the base for all API endpoints.

## Model

| Model | ID | Audio | Notes |
|-------|-----|-------|-------|
| **Veo 3.1 Fast** | `veo-3.1-fast` | Yes (native) | Default. Cost-efficient, up to 1080p. |

**Note:** Video generation is a long-running operation. It typically takes 30–120 seconds to complete. Do not set short timeouts.

---

## Text-to-Video

```bash
curl -X POST "$API_URL/api/data/video/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A slow-motion close-up of espresso being poured into a cup, steam rising, warm golden window light, shallow depth of field, cinematic",
    "aspectRatio": "16:9",
    "duration": 8
  }'
```

## Image-to-Video

Animate a still image by providing it as base64.

```bash
curl -X POST "$API_URL/api/data/video/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "The flower slowly blooms in timelapse, petals unfolding",
    "image": "<base64-encoded-image>",
    "imageMimeType": "image/png",
    "duration": 8
  }'
```

---

## Parameters

| Name | Type | Required | Default | Values | Description |
|------|------|----------|---------|--------|-------------|
| `prompt` | string | **Yes** | — | — | Text description of the video |
| `image` | string | No | — | — | Base64-encoded source image (for image-to-video) |
| `imageMimeType` | string | No | `image/png` | `image/png`, `image/jpeg`, `image/webp` | MIME type of source image |
| `resolution` | string | No | `720p` | `720p`, `1080p` | Video resolution. **1080p requires `duration: 8`** |
| `aspectRatio` | string | No | `16:9` | `16:9`, `9:16` | Landscape or portrait |
| `duration` | number | No | `8` | `4`, `6`, `8` | Seconds. **Only 4, 6, or 8.** 1080p requires 8 |

---

## Response

```json
{
  "video": {
    "url": "https://api.rebyte.ai/api/public/artifacts/<workspaceId>/veo-1712345678-a1b2c3d4.mp4",
    "mimeType": "video/mp4",
    "model": "veo-3.1-fast-generate-preview",
    "resolution": "720p",
    "aspectRatio": "16:9",
    "duration": 8
  }
}
```

The video URL is already publicly downloadable — the relay has stored the video in the workspace's artifact store on your behalf. You can:

- **Share directly**: embed `video.url` in HTML, markdown, or chat. No auth required.
- **Download locally** if you need the bytes (e.g. to pass to ffmpeg or re-upload elsewhere):

  ```bash
  curl -L -o output.mp4 "<video-url>"
  ```

You do **not** need to re-upload the video to the Artifact Store — it's already there.

---

## Writing Effective Video Prompts

Good video prompts describe **motion and time**, not just a static scene. Include:

- **Subject and action**: What is happening, who/what is moving
- **Camera work**: Pan, tilt, zoom, tracking shot, drone shot, static, handheld
- **Scene setting**: Location, time of day, weather, environment
- **Style**: Cinematic, documentary, slow motion, timelapse, animation
- **Mood and atmosphere**: Lighting, color grading, emotional tone
- **Temporal flow**: What happens first, then next

### Prompt Examples

**Simple:**
> A drone shot slowly flying over a misty mountain range at sunrise

**Cinematic:**
> A slow-motion close-up of a coffee cup being filled with espresso, steam rising, warm golden light from a nearby window, shallow depth of field, cinematic color grading

**Action:**
> A tracking shot following a cyclist riding through autumn leaves on a tree-lined path, golden hour lighting, leaves swirling in their wake

**Abstract:**
> Flowing liquid mercury forming geometric shapes in zero gravity, reflecting prismatic light, smooth transitions between forms, dark background, studio lighting

**Narrative:**
> A time-lapse of a flower blooming in a garden, starting from a tight bud to full bloom, morning dew evaporating, soft natural lighting, macro lens perspective

### Camera Movement Keywords

| Keyword | Effect |
|---------|--------|
| Static | Fixed camera, no movement |
| Pan | Horizontal rotation (left/right) |
| Tilt | Vertical rotation (up/down) |
| Zoom in/out | Moving closer or further |
| Tracking/dolly | Camera moves alongside subject |
| Drone/aerial | Overhead or elevated perspective |
| Handheld | Slight natural camera shake |
| Orbit | Camera circles around subject |
| Crane | Vertical camera movement (rising/lowering) |

### Style Keywords

| Keyword | Effect |
|---------|--------|
| Cinematic | Film-quality, 24fps feel, color graded |
| Documentary | Natural, observational |
| Slow motion | Time-stretched action |
| Timelapse | Compressed time |
| Hyperlapse | Moving timelapse |
| Animation | Animated/cartoon style |
| Vintage/retro | Film grain, muted colors |
| Noir | High contrast, dramatic shadows |

---

## Using with Python

```python
import subprocess
import requests
import base64
import json
from pathlib import Path

AUTH_TOKEN = subprocess.check_output(["/home/user/.local/bin/rebyte-auth"]).decode().strip()
with open('/home/user/.rebyte.ai/auth.json') as f:
    API_URL = json.load(f)['sandbox']['relay_url']

HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}"}

def generate_video(prompt, image_path=None, aspect_ratio="16:9", resolution="720p", duration=8):
    payload = {"prompt": prompt, "aspectRatio": aspect_ratio, "resolution": resolution, "duration": duration}
    if image_path:
        payload["image"] = base64.b64encode(Path(image_path).read_bytes()).decode()
        ext = Path(image_path).suffix.lower()
        payload["imageMimeType"] = {'.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'}.get(ext, 'image/png')
    return requests.post(f"{API_URL}/api/data/video/generate", headers=HEADERS, json=payload, timeout=300).json()

def save_video(result, filepath):
    if "video" not in result:
        print(f"Error: {result.get('error', 'Unknown error')}"); return
    # video.url is a public relay URL — no auth header needed.
    resp = requests.get(result["video"]["url"])
    resp.raise_for_status()
    Path(filepath).write_bytes(resp.content)
    print(f"Saved to {filepath}")

result = generate_video("A drone shot over a misty mountain range at sunrise, cinematic")
save_video(result, "mountains.mp4")
```

---

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `durationSeconds is out of bound` | Invalid duration value | Use exactly 4, 6, or 8 |
| `Veo generation failed` | Content safety filter | Rephrase the prompt |
| `Veo operation timed out` | Generation took >6 min | Simpler prompt or shorter duration |

---

## Important Notes

- **Generation time**: 30–120 seconds. The API call blocks until ready.
- **Audio**: Veo 3.1 generates native audio matching the scene.
- **Video URL**: Public relay URL — share directly, no auth needed. Already stored in the workspace artifact store.
- **SynthID**: All generated videos include invisible watermarking.
- **Duration**: Only 4, 6, or 8 seconds. No arbitrary values.
- **Aspect ratio**: Only 16:9 (landscape) or 9:16 (portrait).
- **Shorter durations** tend to produce higher quality results.
- Be specific about camera movement — it dramatically changes the result.
