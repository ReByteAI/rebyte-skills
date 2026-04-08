---
name: embed-assets
description: Embed images, audio, and other assets into a single HTML file using base64 data URIs. Use when building self-contained HTML widgets or pages that need inline media. Triggers include "embed image", "embed audio", "inline asset", "base64 embed", "self-contained HTML", "single-file HTML with media".
---

# Embed Assets into Single HTML

Total size limit: **5 MB** per widget. Compress first, embed second.

## Step 1: Compress

**Images** — convert to WebP, resize to display dimensions:
```bash
# Best: WebP lossy (tiny, good quality)
ffmpeg -i input.png -vf scale=800:-1 -quality 75 output.webp

# Or with ImageMagick
convert input.png -resize 800x -quality 75 output.webp
```

**Audio** — convert to low-bitrate MP3 or Opus:
```bash
# MP3, 64kbps mono (voice/narration)
ffmpeg -i input.wav -ac 1 -b:a 64k output.mp3

# Opus in WebM container (smaller, modern browsers)
ffmpeg -i input.wav -ac 1 -b:a 48k -c:a libopus output.webm
```

**Video** — avoid embedding video. Deploy to rebyte.pro instead.

## Step 2: Embed as base64 data URI

```bash
# Encode to base64
base64 -w0 output.webp > output.b64   # Linux
base64 -i output.webp -o output.b64   # macOS
```

Then use in HTML:
```html
<!-- Image -->
<img src="data:image/webp;base64,PASTE_HERE" alt="description">

<!-- Audio -->
<audio controls src="data:audio/mpeg;base64,PASTE_HERE"></audio>

<!-- Audio (Opus/WebM) -->
<audio controls src="data:audio/webm;base64,PASTE_HERE"></audio>
```

## MIME types

| Format | MIME type |
|--------|-----------|
| WebP | `image/webp` |
| PNG | `image/png` |
| JPEG | `image/jpeg` |
| SVG | `image/svg+xml` |
| MP3 | `audio/mpeg` |
| Opus/WebM | `audio/webm` |
| WAV | `audio/wav` |

## Size guidelines

| Asset | Target | Approach |
|-------|--------|----------|
| Icon/thumbnail | < 20 KB | WebP, 128px |
| Chart/diagram | < 100 KB | SVG preferred |
| Photo | < 200 KB | WebP, 800px, q75 |
| Voice clip (30s) | < 250 KB | MP3 64kbps mono |
| Total page | < 5 MB | Hard limit for inline widgets |

If total exceeds 5 MB, deploy to rebyte.pro with assets in the `static/` directory instead.
