---
version: 4
name: image-generation
description: Generate images from text prompts or edit existing images via Rebyte data API. Two backends selectable via the `provider` field — `gemini` (default, Nano Banana 2 / Gemini 3.1 Flash) or `gpt` (OpenAI gpt-image-2). Gemini is best for multi-aspect-ratio output (512px–4K) and fast multi-image edits; gpt-image-2 is best for high-fidelity photorealism and precise text rendering. Supports text-to-image and image-to-image on both. Triggers include "generate image", "create image", "make a picture", "draw", "illustrate", "image of", "picture of", "edit image", "modify image", "enhance image", "style transfer", "nano banana", "gpt image".
---

# Image Generation CLI (Nano Banana 2 + GPT Image 2)

Generate or edit images via `{baseDir}/scripts/generate.py`. Choose the backend with `--provider`:

| `--provider` | Model | Best For |
|--------------|-------|----------|
| `gemini` (default) | Nano Banana 2 (Gemini 3.1 Flash) | Multi-aspect-ratio output, 512px–4K, fast iterations |
| `gpt` | gpt-image-2 (OpenAI) | High-fidelity photorealism, precise text rendering |

## Usage

```bash
# Text-to-image (Gemini, default)
python {baseDir}/scripts/generate.py --prompt "A mountain landscape at dawn" --aspect-ratio 16:9 --output landscape.png

# Text-to-image (GPT Image 2)
python {baseDir}/scripts/generate.py --prompt "A poster with bold serif text" --provider gpt --quality high --output poster.png

# Image-to-image (edit or composite)
python {baseDir}/scripts/generate.py --prompt "Place this photo in a card layout" --input photo.jpg --output card.png

# Image-to-image with GPT
python {baseDir}/scripts/generate.py --prompt "Replace the sky with aurora" --input photo.jpg --provider gpt --output edited.png
```

When the user provides a real-world photograph, preserve it as a photograph — do not redraw, stylize, or convert to illustration unless the user explicitly requests it.

## Parameters

| Flag | Default | Description |
|------|---------|-------------|
| `--prompt`, `-p` | *(required)* | Text prompt or editing instructions |
| `--output`, `-o` | *(required)* | Output image path |
| `--input`, `-i` | — | Input image path (triggers image-to-image) |
| `--provider` | `gemini` | `gemini` or `gpt` |
| `--aspect-ratio`, `-a` | `1:1` | [gemini] Aspect ratio: `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `21:9`, etc. |
| `--size`, `-s` | — | [gemini] Output size: `512`, `1K`, `2K`, `4K` |
| `--quality`, `-q` | — | [gpt] Render quality: `low`, `medium`, `high`, `auto` |
| `--image-size` | — | [gpt] Pixel dimensions: `1024x1024`, `1024x1536`, `1536x1024`, `auto` |
| `--format`, `-f` | — | [gpt] Output format: `png`, `webp`, `jpeg` |
| `--background` | — | [gpt] `opaque` or `auto` |
| `--moderation` | — | [gpt] `auto` or `low` (less restrictive) |

## Cost Guide

| Call | Credits (1 credit = $0.01) |
|------|---------------------------|
| gemini (any) | **10** ($0.10) |
| gpt, quality: low | **10** ($0.10) |
| gpt, quality: medium/auto | **15** ($0.15) |
| gpt, quality: high | **25** ($0.25) |

Default to Gemini for most needs. Only use `--provider gpt` when the user specifically needs photorealism or precise text rendering. Only use `--quality high` for final deliverables, not drafts.

## Error Handling

The script exits with code 1 and prints errors to stderr on failure:
- **Auth error**: Ensure `~/.rebyte.ai/auth.json` exists with valid credentials
- **Safety filter**: Prompt was blocked — rephrase and retry
- **No image**: API returned no image data — simplify the prompt

## Delivering Output

After generating images, upload them to the Artifact Store so the user can access them.
