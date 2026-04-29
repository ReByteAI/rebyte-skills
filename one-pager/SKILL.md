---
version: 1
name: one-pager
description: Single-page summary or brief — concise document hitting one purpose: pitch, exec brief, product overview, or strategy memo. Tight hierarchy, scannable, optimized for a 30-second skim. Use when the user wants a one-pager, brief, exec summary, or single-page document.
user-invocable: true
---

# one-pager

Produce a single-page document that passes a 30-second skim.

## Structure
1. **Title** — one sentence stating the thesis
2. **Hook** — 2–3 line context paragraph
3. **3–5 sections** with clear subheads, scannable bullets or short paragraphs
4. **Closer** — call-to-action or next-step

## Length budget
- Letter or A4, single page after PDF render
- ~250–400 words depending on hierarchy density

## Form-specific verification
- Fits on ONE page in the rendered PDF (run `save-as-pdf` to check)
- Reader can extract the thesis in 30 seconds
- No section is a wall of prose; use bullets or short paragraphs

## When not to use
Use `make-a-deck` for narrative pitch, `resume` for CV, `letter` for correspondence.
