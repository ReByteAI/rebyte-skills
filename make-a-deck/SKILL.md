---
version: 1
name: make-a-deck
description: Slide presentation in HTML — narrative-driven deck with one idea per slide, speaker notes, and keyboard navigation. Use when user asks for slides, a deck, a presentation, a pitch, or wants to walk an audience through points. Output is a single HTML file using the project's deck stage component.
user-invocable: true
---

# make-a-deck

Produce a slide deck as a single HTML file.

## Default form
- Use the project's `deck-stage` component for slide framing, navigation, scaling, and speaker-notes
- 16:9 stage, max ~12 slides for a typical pitch (cap 24)
- One idea per slide; titles as full sentences

## Structure
1. Cover (title + subtitle + presenter)
2. Body slides (one claim each, supporting visual)
3. Closer (CTA or summary)

## Speaker notes
Use the conventional `<aside class="notes">` block per slide.

## Verification
- Arrow keys / space advance slides
- Print-to-PDF retains layout
- One idea per slide; no slide is a wall of text
