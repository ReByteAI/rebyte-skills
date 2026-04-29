---
version: 1
name: export-pptx-editable
description: Native text and shapes — editable in PowerPoint. Convert an HTML deck artifact to a .pptx where each slide's text, shapes, and tables remain editable downstream. Use when the user needs the deliverable to be opened and modified in PowerPoint or Google Slides. Trade-off: visual fidelity slightly lower than the screenshot variant.
user-invocable: true
---

# export-pptx-editable

Export the project's deck as a .pptx with editable native shapes and text.

## How
- Use `pptx` skill or pptxgenjs to build slide-by-slide from the HTML source
- Map: `h1/h2` → title, paragraphs → text frames, divs with bg → shapes
- Preserve link colors and font families if available

## Verification
- Open in PowerPoint: every text element is selectable and editable
- No slide is a single flattened image
- Speaker notes carry over

## When not to use
For pixel-perfect visual fidelity over editability, use `export-pptx-screenshots`.
