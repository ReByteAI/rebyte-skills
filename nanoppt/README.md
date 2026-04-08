# NanoPPT

Generate stylized presentation images using Nano Banana AI.

## What is NanoPPT?

NanoPPT uses Nano Banana (Google Gemini) to generate artistic slide images in 18+ styles. Unlike the PPTX skill which creates `.pptx` files, NanoPPT focuses on **AI image generation** for presentations.

## Quick Start

```
Article → ASCII Framework → AI Images → Use in PPT
```

### 1. Convert Article to ASCII Framework

```
Help me convert this article to an ASCII PPT framework
```

### 2. Generate Images by Style

```
Generate slide 1 in Doraemon style
```

### 3. Fix Text if Needed

```
Fix the text in slide-01.png: change "Helo" to "Hello"
```

## Supported Styles

| Category | Styles |
|----------|--------|
| Anime | Doraemon, Naruto, Ghibli, Makoto Shinkai, One Piece |
| Trendy | Cyberpunk, Vaporwave, Pixel Art, Street Graffiti |
| Artistic | Ink Wash, Van Gogh, Art Deco, Ukiyo-e |
| 3D | Pixar 3D, LEGO Blocks, Claymation |
| Comics | Marvel Comics |
| Basic | Flat Illustration, Isometric, Tech Gradient |

## File Structure

```
nanoppt/
├── SKILL.md              # Main workflow + API reference
├── README.md             # This file
├── examples/             # Style samples (18 images)
└── tips/
    ├── article-to-ascii-ppt.md   # ASCII framework methodology
    ├── ppt-image-generation.md   # Style prompt keywords
    ├── text-correction.md        # Fix text in images
    └── 4k-upscale.md             # Enhance to 4K
```

## API

Uses the Rebyte Data Proxy with Nano Banana (Google Gemini). See [SKILL.md](./SKILL.md) for how to obtain `$API_URL` and `$AUTH_TOKEN`.

```bash
curl -X POST "$API_URL/api/data/images/generate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "...", "model": "pro", "aspectRatio": "16:9"}'
```
