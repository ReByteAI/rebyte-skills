---
version: 1
name: save-as-pdf
description: Print-ready PDF export — convert any HTML artifact (one-pager, resume, letter, deck, report) to a high-quality PDF with proper page breaks, margins, and embedded fonts. Use when the user wants a downloadable, printable, or shareable PDF version of an existing artifact.
user-invocable: true
---

# save-as-pdf

Export the current HTML artifact as a print-ready PDF.

## How
- Default engine: WeasyPrint (via the `pdf` skill)
- Letter or A4 page size; honor `@page` rules in the source CSS
- Embed fonts; subset to used glyphs

## Defaults
- Letter, 0.5in margins
- Override via user request ("A4", "4x6", "no margins")

## Verification
- Page breaks fall on logical boundaries (not mid-paragraph)
- All fonts render (no fallback substitution)
- File opens in macOS Preview, Chrome, and Acrobat without warnings
