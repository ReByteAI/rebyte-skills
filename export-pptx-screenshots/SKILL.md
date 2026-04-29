---
version: 1
name: export-pptx-screenshots
description: Flat images — pixel-perfect but not editable. Convert an HTML deck artifact to a .pptx where each slide is a high-resolution screenshot. Use when visual fidelity matters more than downstream editability — final pitch decks, hand-off PDFs, archival.
user-invocable: true
---

# export-pptx-screenshots

Export the project's deck as a .pptx where each slide is a rendered screenshot.

## How
- Render each slide of the HTML deck to PNG at 1920×1080 or 2x retina
- Build .pptx with one full-bleed image per slide
- Preserve speaker notes as text below each image

## Verification
- Open in PowerPoint: identical to source HTML
- File size reasonable (each slide PNG ≤ 500KB JPEG-able)

## When not to use
If the user needs to edit text in PowerPoint, use `export-pptx-editable`.
