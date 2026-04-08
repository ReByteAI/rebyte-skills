---
name: report
description: Create beautiful editorial reports as magazine-style HTML documents rendered inline in chat. Pretext-powered hero typography with text wrapping around decorations, multi-column body, pull quotes, stat callouts, and figures. Uses the widget aesthetic system. Triggers include "create a report", "write a report", "format as a report", "magazine layout", "editorial report", "formatted analysis", "beautiful document", "publish-quality report", "research report", "analysis brief".
---

# Editorial Report

Create long-form reports as magazine-style HTML. Pretext-powered hero typography, multi-column body, pull quotes, data callouts. Rendered as a scrollable widget in chat.

**How it works:** The entire report is a single HTML file output as a `widget` code block. The hero section uses the Pretext library for magazine-style text wrapping around decorative elements. The body uses CSS columns and grid for layout. The frontend renders the widget inline in chat.

**Deploy is optional.** Only deploy to rebyte.pro when the user explicitly asks for a shareable URL. See `references/deploy.md`.

{{include:non-technical-user.md}}

{{include:auth.md}}

**Directory structure:**
- `SKILL_DIR`: The directory containing this SKILL.md
- Working directory: `/code/` (where report projects are created)

## Aesthetic Direction (MANDATORY)

Pick ONE aesthetic. Set `data-aesthetic="name"` on `<html>`. The frontend resolves to actual colors — **never hardcode hex colors**.

| Aesthetic | Feel | Best for |
|-----------|------|----------|
| `editorial` | Serif, generous whitespace, earth tones + gold | Research reports, analyses |
| `paper-ink` | Warm cream, terracotta/sage | Briefs, creative reports |
| `warm` | Peach/cream, friendly | General purpose |
| `blueprint` | Technical drawing, slate/blue palette | Technical reports |
| `nord` | Cool arctic blues, minimalist | Clean, minimal reports |
| `data-dense` | Tight spacing, maximum information | Data-heavy reports |

**Recommended:** `editorial` or `paper-ink` produce the most distinctive magazine-style results.

## Font Pairing (MANDATORY)

Pick ONE font pair. Set `data-font="name"` on `<html>`.

| Name | Body font | Code font | Voice |
|------|-----------|-----------|-------|
| `instrument-serif` | Instrument Serif | JetBrains Mono | Literary, editorial |
| `crimson-pro` | Crimson Pro | Noto Sans Mono | Classic serif |
| `playfair` | Playfair Display | Roboto Mono | Elegant, high-contrast |
| `fraunces` | Fraunces | Source Code Pro | Warm, ornamental |
| `dm-sans` | DM Sans | Fira Code | Clean, modern |
| `ibm-plex` | IBM Plex Sans | IBM Plex Mono | Technical, precise |
| `libre-franklin` | Libre Franklin | Inconsolata | Neutral, versatile |

**Recommended pairings:**
- editorial → `instrument-serif`, `crimson-pro`, `playfair`, `fraunces`
- paper-ink → `crimson-pro`, `fraunces`, `libre-franklin`
- warm → `crimson-pro`, `instrument-serif`
- blueprint → `ibm-plex`, `dm-sans`

**NEVER use Inter, Roboto, or Arial.**

## CSS Variable Contract

Always use these. NEVER hardcode colors.

| Variable | Purpose |
|----------|---------|
| `--widget-bg-primary` | Page background |
| `--widget-bg-secondary` | Card / callout background |
| `--widget-bg-tertiary` | Code blocks, sidebar background |
| `--widget-text-primary` | Headings, body text |
| `--widget-text-secondary` | Secondary text |
| `--widget-text-muted` | Captions, labels, bylines |
| `--widget-accent` | Decorations, borders, dividers |
| `--widget-accent-fg` | Accent text color |
| `--widget-accent-text` | Text on accent bg |
| `--widget-border` | Borders |
| `--widget-border-radius` | Border radius (12px) |
| `--widget-shadow-sm` / `--widget-shadow-md` | Shadows |
| `--widget-font-sans` | Body font |
| `--widget-font-mono` | Code, data values, labels |
| `--widget-chart-1` … `--widget-chart-8` | Chart colors |

---

## Creating Reports

The entire report is one `widget` code block containing all sections inside `<article class="report">`.

### Output Format

````
```widget
<html data-aesthetic="editorial" data-font="instrument-serif">
  <head>...</head>
  <body tabindex="0">
    <article class="report">
      <header class="report-hero" data-hero-style="wrap-circle">...</header>
      <div class="report-body">
        <section class="report-section">...</section>
        ...
      </div>
    </article>
    <script>/* report engine from references/report-engine.md */</script>
  </body>
</html>
```
````

**Do NOT save as files.** Output the widget directly in your response.

**Size limit:** Under 5 MB.

### HTML Architecture

One scrollable HTML document with semantic sections. See `references/css-patterns.md` for the complete CSS. See `references/report-template.md` for the base template. See `references/report-engine.md` for the Pretext engine JS.

```html
<!DOCTYPE html>
<html lang="en" data-aesthetic="editorial" data-font="instrument-serif">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
  <style>
    :root { /* Fallback CSS vars matching chosen aesthetic */ }
    /* All CSS from references/css-patterns.md */
  </style>
</head>
<body tabindex="0">
  <article class="report">
    <header class="report-hero" data-hero-style="wrap-circle">
      <div class="hero-label">CATEGORY LABEL</div>
      <h1>Report <em>Title</em> Here</h1>
      <div class="byline">
        <span class="author">Author Name</span>
        <span class="separator">·</span>
        <span class="date">March 2026</span>
      </div>
      <div class="hero-decoration"></div>
      <p class="hero-text">Opening paragraph text that flows around the decoration...</p>
    </header>

    <div class="report-body">
      <section class="report-section">
        <h2>Section <em>Heading</em></h2>
        <p>Body text in CSS columns...</p>
      </section>
    </div>
  </article>

  <script>/* Report engine from references/report-engine.md — copy verbatim */</script>
</body>
</html>
```

**CRITICAL rules:**
1. Include `<link>` for Google Fonts (needed for standalone rendering)
2. Set fallback CSS vars in `:root` matching your chosen aesthetic
3. Include `tabindex="0"` on `<body>` for keyboard focus in iframe
4. Copy the report engine JS verbatim from `references/report-engine.md`
5. The document scrolls — do NOT set `overflow: hidden` on body

---

## Hero Styles

Set `data-hero-style` on `<header class="report-hero">` to control the Pretext-powered hero layout:

| Style | Effect | Hero elements |
|-------|--------|---------------|
| `wrap-circle` | Text wraps around a decorative accent circle | `.hero-decoration` (auto-styled as circle) |
| `wrap-image` | Text wraps around an image | `<img class="hero-image" src="...">` |
| `drop-cap` | Oversized first letter, text flows around it | `.hero-text` (first letter auto-enlarged) |
| `none` | No Pretext, standard centered layout | Just `h1`, `.byline` |

The report engine JS handles all Pretext calls automatically based on `data-hero-style`. You only write the semantic HTML.

**Fallback:** If Pretext fails to load (CDN unavailable), the hero text renders with normal CSS flow. The report is always readable.

---

## Section Types

Use these inside `<div class="report-body">`:

| Class | When | Key elements |
|-------|------|--------------|
| `report-section` | Standard body section (2-column) | `h2`, `p` elements |
| `report-section single-column` | Full-width body section | `h2`, `p` elements |
| `report-pullquote` | Magazine pull quote | `blockquote`, `.attribution` |
| `report-callout` | Highlighted insight box | `.callout-label`, `.callout-text` |
| `report-stat-row` | Key metrics display | `.stat-item` > `.stat-value` + `.stat-label` |
| `report-figure` | Image or chart with caption | `img` or `canvas`, `figcaption` |
| `report-columns-3` | Explicit 3-column section | Child `<div>` elements |
| `report-sidebar` | Inset sidebar card | `.sidebar-title`, content |
| `report-footnotes` | References / citations | `ol > li` |
| `report-divider` | Visual section break | Empty element, auto-styled |

### Section Examples

**Standard section (2-column body):**
```html
<section class="report-section">
  <h2>Market <em>Analysis</em></h2>
  <p>First paragraph of body text flows into two CSS columns automatically...</p>
  <p>Second paragraph continues in the column flow...</p>
</section>
```

**Pull quote (floats inside a section):**
```html
<aside class="report-pullquote">
  <blockquote>The most significant shift in a decade.</blockquote>
  <div class="attribution">— Industry Report, 2026</div>
</aside>
```

**Callout box:**
```html
<div class="report-callout">
  <div class="callout-label">Key Finding</div>
  <div class="callout-text">Revenue grew 47% year-over-year, driven primarily by expansion in Southeast Asian markets.</div>
</div>
```

**Stat row:**
```html
<div class="report-stat-row">
  <div class="stat-item">
    <div class="stat-value">$4.2B</div>
    <div class="stat-label">Market Size</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">47%</div>
    <div class="stat-label">YoY Growth</div>
  </div>
  <div class="stat-item">
    <div class="stat-value">12</div>
    <div class="stat-label">Markets</div>
  </div>
</div>
```

**Figure with caption:**
```html
<figure class="report-figure">
  <canvas id="chart1" width="800" height="400"></canvas>
  <figcaption>Figure 1: Revenue growth by quarter, 2024–2026</figcaption>
</figure>
```

**Sidebar:**
```html
<aside class="report-sidebar">
  <div class="sidebar-title">Methodology</div>
  <p>Data sourced from public filings and proprietary surveys of 500+ enterprises.</p>
</aside>
```

**Footnotes:**
```html
<footer class="report-footnotes">
  <h3>References</h3>
  <ol>
    <li>World Bank, "Global Economic Prospects," 2026.</li>
    <li>McKinsey & Company, "State of AI," 2025.</li>
  </ol>
</footer>
```

---

## Typography Scale

```
Hero title h1:     48px  weight 400  line-height 1.15
Section h2:        32px  weight 400  line-height 1.25
Subsection h3:     24px  weight 400  line-height 1.3
Body text:         18px  weight 400  line-height 1.75
Hero text:         20px  weight 400  line-height 1.7
Pull quote:        24px  weight 400  italic
Stat value:        42px  monospace   accent color
Label / byline:    13px  monospace   uppercase  letter-spacing 0.12em
Caption:           14px  muted color
Footnotes:         14px  muted color
```

## CDN Libraries

| Library | CDN URL | Use for |
|---------|---------|---------|
| Pretext | `https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.3/dist/layout.js` | Hero text layout (loaded by engine) |
| Chart.js 4 | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1` | Charts |
| D3 v7 | `https://cdn.jsdelivr.net/npm/d3@7` | Custom visualizations |

**Note:** Pretext is loaded automatically by the report engine. Only add Chart.js or D3 `<script>` tags when the report includes charts.

## Design Rules

1. **Hero section is the "wow" moment** — text wrapping around decoration is the signature visual
2. **Use `<em>` in headings** for italic accent words
3. **Generous whitespace** — let the content breathe
4. **Pull quotes break monotony** — use at least one in longer reports
5. **Stat rows for key numbers** — big monospace numbers draw the eye
6. **Accent bar decorations** — small colored bars above callouts and sidebar titles
7. **Monospace for data** — numbers, stats, metrics use `var(--widget-font-mono)`
8. **2 columns default** — body sections auto-flow into 2 columns; use `single-column` class when content is short or includes wide elements
9. **Max width 1100px** — report is centered with comfortable reading width
10. **Opening paragraph in hero** — the first paragraph goes in `.hero-text` (Pretext-powered), not in the body

## Quality Gates

1. All colors use `var(--widget-*)` — no hardcoded hex
2. `data-aesthetic` and `data-font` set on `<html>`
3. Fallback CSS vars in `:root` match chosen aesthetic
4. `data-hero-style` set on `.report-hero`
5. Report engine JS copied verbatim from references
6. Typography hierarchy clear (h1 > h2 > h3 > body > caption)
7. No horizontal overflow
8. Document scrolls (no `overflow: hidden` on body)
9. Google Fonts `<link>` included
10. Under 5 MB total

## Anti-Patterns (NEVER)

- Emoji section headers
- Hardcoded hex colors
- `overflow: hidden` on body or article
- Gradient text headings
- Glowing box-shadows
- Generic stock photo URLs (use decorative CSS shapes or real data charts instead)
- Fixed-height containers that clip content
- More than 3 columns (illegible at widget widths)
- Writing Pretext JavaScript yourself (the engine handles it)
- Using `data-slides="true"` (that's for the slide skill)

## Deploying as a Standalone URL (only when user asks)

See `references/deploy.md`. Save the widget HTML as `index.html` and run `rebyte deploy`. Do NOT attempt deployment unless the user explicitly requests a shareable URL.

## Reference Files

| File | Description |
|------|-------------|
| `references/report-template.md` | Base HTML template for reports |
| `references/report-engine.md` | Pretext-powered hero rendering engine (copy verbatim) |
| `references/css-patterns.md` | CSS for all section types |
| `references/deploy.md` | How to deploy as a standalone URL |
