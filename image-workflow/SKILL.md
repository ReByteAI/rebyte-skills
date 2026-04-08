---
name: image-workflow
description: Generate images from text descriptions or edit existing images using AI. Use when user wants to create logos, illustrations, product photos, social media graphics, concept art, or edit/transform uploaded images. Triggers include "generate image", "create logo", "make illustration", "product photo", "social media graphic", "concept art", "edit image", "transform photo", "style transfer", "image to image", "remove background".
---

# Image Generation Workflow

Generate images from text prompts or edit existing images using Google Gemini's native image generation. Supports logos, illustrations, product shots, social media graphics, concept art, and photo editing.

## Sub-Skills

- `rebyteai/nano-banana` — AI image generation via Google Gemini (Nano Banana 2, `gemini-3.1-flash-image-preview`).
  - Supports multi-size output: `512` (fast previews), `1K` (default), `2K`, `4K` (final assets).
  - Use `imageSize` to control quality/speed tradeoff.
  - Supports text-to-image, image-to-image editing, style transfer, and enhancement.
  - All images include invisible SynthID watermarking.
- `rebyteai/internet-search` — Research visual references, brand guidelines, style inspiration, and design trends.

## Workflow

### Step 0: Ensure Sub-Skills Are Installed

Before starting, check if the required sub-skills are available:

```bash
ls ~/.skills/rebyteai-nano-banana/SKILL.md ~/.skills/rebyteai-internet-search/SKILL.md 2>/dev/null
```

If either is missing, use the `skill-installer` skill to install them by slug:
- `nano-banana` — for AI image generation
- `internet-search` — for visual reference research

Do NOT proceed to image generation until `nano-banana` is installed and usable as a skill.

### Step 1: Understand the Request

Parse what the user wants. Identify:
- **Subject** — What should the image show? (logo, person, product, scene, abstract)
- **Style** — Photorealistic, flat illustration, watercolor, pixel art, 3D render, minimalist vector?
- **Dimensions** — Square (1:1), landscape (16:9), portrait (9:16), or specific size?
- **Purpose** — Logo, social media post, blog header, app icon, print material, concept art?
- **Edit or create?** — New image from scratch, or modify an uploaded image?

If the user uploads an image, this is an image-to-image task (edit, style transfer, enhance).

### Step 2: Research References (if needed)

Use `internet-search` when the user references something specific:
- Brand logos or visual identity ("make it look like the Stripe logo style")
- Art movements or artists ("in the style of Studio Ghibli")
- Real products or places ("a photo of the Tokyo Skytree at sunset")
- Current design trends ("modern SaaS landing page hero image style")

Skip for abstract prompts or when the user provides clear specifications.

### Step 3: Generate

**Text-to-image (creating from scratch):**

1. Craft a detailed prompt for `nano-banana`. Include:
   - Subject and composition
   - Style and medium (e.g., "flat vector illustration", "cinematic photograph")
   - Colors and mood
   - Background (e.g., "white background", "gradient", "transparent-style")
   - What to exclude (e.g., "no text", "no people", "simple shapes only")

2. Generate 2-4 variations at `512` or `1K` size (fast iteration)
3. Show the user and get feedback
4. Refine based on feedback — adjust prompt or use image-to-image editing
5. Generate final version at `2K` or `4K` size for high resolution

**Image-to-image (editing uploaded images):**

Use `nano-banana` with the uploaded image + edit instructions:
- Style transfer: "Convert to watercolor style"
- Enhancement: "Increase detail, improve lighting"
- Modification: "Remove the background", "Change the color to blue"
- Transformation: "Make it look like a vintage film photo"

### Step 4: Iterate

Design is iterative. Common refinement patterns:

| Feedback | Action |
|----------|--------|
| "Make it brighter/darker" | Adjust prompt with lighting keywords |
| "Try different colors" | Specify exact colors in prompt |
| "More minimal" | Add "minimalist, simple, clean" to prompt |
| "More detail" | Add specific detail descriptions |
| "I like this one but change X" | Use image-to-image with the liked version |
| "Try a completely different style" | Generate new variations with different style keywords |

Use `512` or `1K` imageSize for all iterations. Switch to `2K` or `4K` for the final approved version.

### Step 5: Deliver

Upload final images to the Artifact Store.

For different use cases, provide appropriate formats:
- **Logos** — Generate on both light and dark backgrounds
- **Social media** — Generate at platform-specific aspect ratios (1:1 Instagram, 16:9 Twitter, 9:16 Stories)
- **App icons** — Generate at high resolution, note it works at small sizes
- **Print** — Use `4K` imageSize for maximum resolution

Note any limitations:
- AI-generated text in images may be imperfect — suggest adding text in a design tool
- Exact geometric layouts work better as HTML/CSS than as generated images
- Generated images include SynthID watermarking (invisible, detectable)

## Decision Points

- **"What imageSize?"** — `512` or `1K` for exploration and iteration (fast). `2K` or `4K` for final delivery (high quality). Always start small.

- **"How many variations?"** — Generate 3-4 for initial exploration. For refinement rounds, generate 2 at a time. Show all options so the user can direct the style.

- **"Text in images?"** — AI image generation struggles with precise text rendering. If the image needs specific text (logo wordmark, poster headline), generate the image without text and suggest compositing text in a design tool, or use HTML/CSS for pixel-perfect text.

- **"The user wants something very specific (exact layout, pixel-perfect)"** — AI image generation is better for creative/organic work. For precise layouts, consider suggesting the `design-workflow` skill instead, which can build interactive mockups with HTML/CSS.
