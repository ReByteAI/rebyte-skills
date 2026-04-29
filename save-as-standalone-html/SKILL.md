---
version: 1
name: save-as-standalone-html
description: Single self-contained file that works offline — produce or convert an artifact into one HTML file with all CSS, JS, fonts, and images inlined or embedded so it works without external assets. Use when the user wants an HTML deliverable they can open offline, email, or archive.
user-invocable: true
---

# save-as-standalone-html

Bundle the artifact into a single self-contained HTML file.

## How
- Inline all `<style>` and `<script>`
- Convert `<img>` and `@font-face` to `data:` URIs (small assets) OR upload large assets as public artifacts and reference by stable URL
- Strip dev-only build artifacts (sourcemaps, hot-reload hooks)

## Constraints
- Single `.html` file
- File size budget: ≤ 5 MB unless user accepts more
- Keep `<title>`, `<meta charset>`, and viewport meta intact

## Verification
- Save the file, disconnect network, double-click → renders identically
- No console errors about missing resources
