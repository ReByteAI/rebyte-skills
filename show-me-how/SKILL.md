---
name: show-me-how
description: Create interactive HTML widgets, charts, dashboards, and visual explainers rendered inline in chat. Use when user needs interactive visualizations, data exploration tools, calculators, or visual explanations. Triggers include "show me how", "visualize", "interactive chart", "make a widget", "show me how X works", "build a calculator", "create a dashboard", "interactive explainer", "explore this data", "chart this", "graph", "plot".
---

# Show Me How — Interactive Widget Skill

Aesthetic system and design patterns adapted from [nicobailon/visual-explainer](https://github.com/nicobailon/visual-explainer).

Generate interactive HTML widgets that render inline in chat as sandboxed iframes.

## Output Format

Wrap HTML in a fenced code block with `widget` language tag:

````
```widget
<html data-aesthetic="editorial" data-font="crimson-pro">...</html>
```
````

**Do NOT save widgets as files.** Output them directly in your response.

## Size Limit

Total widget size must be **under 5 MB**. For larger assets (images, audio), use the `embed-assets` skill to compress and base64-encode them first.

## Aesthetic Direction (MANDATORY)

Before generating, pick ONE aesthetic. Set it as `data-aesthetic="name"` on the `<html>` element. The frontend resolves this to actual colors — **never hardcode hex colors**.

| Aesthetic | Feel | Best for |
|-----------|------|----------|
| `editorial` | Serif headlines, generous whitespace, earth tones + gold | Reports, narratives, overviews |
| `blueprint` | Technical drawing, grid feel, slate/blue palette | Architecture, system diagrams, specs |
| `paper-ink` | Warm cream, terracotta/sage, informal warmth | Tutorials, explainers, creative |
| `mono-terminal` | Green/amber on dark, CRT feel, monospace | CLI tools, logs, technical demos |
| `data-dense` | Tight spacing, small type, maximum information | Dashboards, tables, data-heavy |
| `warm` | Peach/cream palette, friendly, approachable | General purpose |
| `dracula` | Purple-heavy, Dracula IDE color scheme | Developer tools, code-focused |
| `nord` | Cool arctic blues, Nord color scheme | Clean, minimalist |

**Constrained aesthetics** (editorial, blueprint, paper-ink, mono-terminal) produce more distinctive results. **Flexible aesthetics** (data-dense, dracula, nord, warm) are safer but less unique.

If unsure, pick one. The frontend randomizes when omitted.

## Font Pairing (MANDATORY)

Pick ONE font pair. Set it as `data-font="name"` on the `<html>` element. The frontend loads the actual Google Fonts — **do not add `<link>` tags for fonts yourself**.

| Name | Body font | Code font | Voice |
|------|-----------|-----------|-------|
| `dm-sans` | DM Sans | Fira Code | Clean, modern sans |
| `instrument-serif` | Instrument Serif | JetBrains Mono | Literary, editorial |
| `ibm-plex` | IBM Plex Sans | IBM Plex Mono | Technical, precise |
| `bricolage` | Bricolage Grotesque | Fragment Mono | Bold, contemporary |
| `jakarta` | Plus Jakarta Sans | Azeret Mono | Friendly, rounded |
| `outfit` | Outfit | Space Mono | Geometric, clean |
| `sora` | Sora | IBM Plex Mono | Modern, geometric |
| `crimson-pro` | Crimson Pro | Noto Sans Mono | Classic serif |
| `fraunces` | Fraunces | Source Code Pro | Warm, ornamental |
| `red-hat` | Red Hat Display | Red Hat Mono | Distinctive, branded |
| `libre-franklin` | Libre Franklin | Inconsolata | Neutral, versatile |
| `playfair` | Playfair Display | Roboto Mono | Elegant, high-contrast |

**Recommended pairings with aesthetics:**
- editorial → `instrument-serif`, `crimson-pro`, `playfair`, `fraunces`
- blueprint → `ibm-plex`, `dm-sans`, `sora`
- paper-ink → `crimson-pro`, `fraunces`, `libre-franklin`
- mono-terminal → `ibm-plex` (use `var(--widget-font-mono)` for body text too)
- data-dense → `ibm-plex`, `dm-sans`, `libre-franklin`

**NEVER use Inter, Roboto, or Arial** — they produce the generic AI-generated look.

If unsure, pick one. The frontend randomizes when omitted.

## CSS Variable Contract

The iframe injects these automatically based on your `data-aesthetic` choice. **ALWAYS use them. NEVER hardcode colors.**

| Variable | Purpose |
|----------|---------|
| `--widget-bg-primary` | Page background |
| `--widget-bg-secondary` | Card background |
| `--widget-bg-tertiary` | Input fields, code blocks |
| `--widget-text-primary` | Headings, body text |
| `--widget-text-secondary` | Descriptions |
| `--widget-text-muted` | Captions, axis labels |
| `--widget-accent` | Buttons, highlights |
| `--widget-accent-hover` | Hover state |
| `--widget-accent-text` | Text on accent bg |
| `--widget-border` | Borders, grid lines |
| `--widget-border-radius` | Border radius (12px) |
| `--widget-shadow-sm` | Subtle shadow |
| `--widget-shadow-md` | Card shadow |
| `--widget-font-sans` | Body font (set by `data-font`) |
| `--widget-font-mono` | Data values, code (set by `data-font`) |
| `--widget-chart-1` … `--widget-chart-8` | Chart data series colors |

### Reading Colors in JS

```javascript
const s = getComputedStyle(document.documentElement);
const colors = [1,2,3,4,5,6,7,8].map(i => s.getPropertyValue('--widget-chart-'+i).trim());
```

For D3/SVG, explicitly set `fill` and `stroke` — SVG elements don't inherit CSS `color`.

For p5.js, parse hex to RGB:
```javascript
function hexToRgb(hex) {
  hex = hex.replace('#','');
  return [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
}
```

## Library Selection

If multiple libraries could handle the request, pick one.

## CDN Libraries

| Library | CDN URL | Use for |
|---------|---------|---------|
| **Chart.js 4** | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1` | **Default for charts.** Bar, line, pie, doughnut, scatter, radar, polar. |
| **D3 v7** | `https://cdn.jsdelivr.net/npm/d3@7` | Custom/complex visualizations, force graphs, treemaps |
| **ECharts 5** | `https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js` | Animated charts, heatmaps, geographic maps |
| **Three.js** | `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` | 3D visualizations |
| **Mermaid** | `https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js` | Flowcharts, sequence diagrams |
| **GSAP 3** | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js` | Animated explainers, step-by-step walkthroughs |
| **p5.js** | `https://cdn.jsdelivr.net/npm/p5@1.9.0/lib/p5.min.js` | Physics simulations, generative visuals |
| **anime.js** | `https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js` | Staggered reveals, count-up, path drawing |

**Chart.js is the default for any chart.** Only use D3/ECharts when Chart.js can't handle the visualization type.

For full API references, use the `context7` MCP tool to look up each library's docs.

## Widget HTML Boilerplate

```html
<!DOCTYPE html>
<html lang="en" data-aesthetic="editorial" data-font="instrument-serif">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- CDN scripts here. Do NOT add Google Font links — the frontend handles fonts. -->
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--widget-font-sans);
      background: var(--widget-bg-primary);
      color: var(--widget-text-primary);
      padding: 24px;
    }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: var(--widget-text-secondary); font-size: 0.875rem; margin-bottom: 20px; }
    .card {
      background: var(--widget-bg-secondary);
      border: 1px solid var(--widget-border);
      border-radius: var(--widget-border-radius);
      padding: 20px;
      box-shadow: var(--widget-shadow-sm);
    }
    .card--hero {
      background: var(--widget-bg-secondary);
      box-shadow: var(--widget-shadow-md);
      border-left: 3px solid var(--widget-accent);
    }
    .card--recessed {
      background: var(--widget-bg-tertiary);
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
    }
  </style>
</head>
<body>
  <h1>Title</h1>
  <p class="subtitle">Description</p>
  <div class="card"><!-- content --></div>
</body>
</html>
```

## Rules

1. **NEVER hardcode colors** — always `var(--widget-*)`. Dark/light mode works automatically.
2. **Self-contained** — all CSS and JS inline or from allowed CDNs.
3. **Responsive** — `width: 100%`, flexbox/grid. No fixed pixel widths.
4. **Vanilla only** — HTML + CSS + JS. No React, no bundlers.
5. **Explain after** — add brief text explanation below the widget.
6. **No font `<link>` tags** — the frontend injects fonts from `data-font`. Do not load fonts yourself.

## Depth Tiers

Use depth to create visual hierarchy:

| Tier | Use for | CSS |
|------|---------|-----|
| **hero** | Key metric, main chart, summary | Accent border-left + `shadow-md` |
| **elevated** | Cards, sections | `bg-secondary` + `shadow-sm` |
| **default** | Flat content, body text | `bg-primary`, no shadow |
| **recessed** | Inputs, metadata, footnotes | `bg-tertiary` + inset shadow |

## Overflow Prevention (MANDATORY)

Always apply these — widgets break silently without them:

```css
/* On ALL grid/flex children */
.grid > *, .flex > * { min-width: 0; }

/* On text containers */
p, td, li, span { overflow-wrap: break-word; }

/* NEVER display:flex on <li> — breaks list markers. Use absolute positioning for custom markers. */

/* Images/embeds */
img, canvas, svg { max-width: 100%; height: auto; }
```

## Mermaid Zoom Controls (MANDATORY for Mermaid diagrams)

Every Mermaid diagram MUST have interactive zoom. Wrap the diagram in a container with controls:

```html
<div class="diagram-shell">
  <div class="diagram-toolbar">
    <button onclick="zoomIn()">+</button>
    <button onclick="zoomOut()">−</button>
    <button onclick="zoomFit()">Fit</button>
  </div>
  <div class="diagram-viewport" style="overflow:hidden;cursor:grab;">
    <div class="diagram-canvas" style="transform-origin:0 0;">
      <pre class="mermaid">graph TD; A-->B;</pre>
    </div>
  </div>
</div>
```

Implement scroll-to-zoom, click-drag pan, and button controls. See `css-patterns.md` for the full implementation.

## Animation Patterns

### Staggered Entrance (anime.js)

```javascript
anime({ targets: '.card', opacity: [0, 1], translateY: [20, 0], delay: anime.stagger(80), easing: 'easeOutCubic', duration: 500 });
```

### Count-Up Numbers

```javascript
anime({ targets: '.kpi-value', innerHTML: [0, el => +el.dataset.target], round: 1, easing: 'easeOutExpo', duration: 1200 });
```

### Respect Motion Preferences

```javascript
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.card').forEach(el => el.style.opacity = 1);
} else { /* run animations */ }
```

## Quality Gates

Before delivering, verify:

1. **Squint test** — visual hierarchy is clear when you mentally blur the widget
2. **Swap test** — the output has distinctive character, not a generic template
3. **Overflow check** — no horizontal scroll, text doesn't overflow containers
4. **Content complete** — the widget visualizes exactly what was asked

## Anti-Patterns (NEVER do these)

These produce the "AI-generated" look. Avoid them:

- **Emoji section headers** — no `📊 Data`, `🔧 Tools`, `🎯 Goals`
- **Uniform 3-column card grids** with identical styling
- **Three-dot macOS window chrome** on cards (the `● ● ●` dots)
- **Gradient text headings** — `background: linear-gradient(...); -webkit-background-clip: text`
- **Glowing box-shadows** — `box-shadow` with spread > 10px and saturated color
- **Generic placeholder images** — `via.placeholder.com` or stock photo URLs

## Chart Type Guide

| Data scenario | Chart type | Notes |
|---------------|-----------|-------|
| Compare categories | `bar` | Horizontal: `indexAxis: 'y'` |
| Trend over time | `line` | `tension: 0.3` for smooth curves |
| Parts of a whole | `doughnut` or `pie` | Doughnut preferred |
| Distribution | `scatter` | Use `pointRadius` for emphasis |
| Multi-variable comparison | `radar` | Comparing profiles |
| Stacked comparison | `bar` with `stacked: true` | Set on both x and y scales |

## GSAP Animated Explainers

For step-by-step visual explanations. Always include play/pause/restart controls.

```javascript
const tl = gsap.timeline({ paused: true });
tl.to('#step1', { opacity: 1, y: 0, duration: 0.5 })
  .to('#step2', { opacity: 1, x: 100, duration: 0.6 }, '+=0.3')  // delay after prev
  .to('#arrow', { scaleX: 1, duration: 0.4 }, '<')                // same start as prev
  .to('.items', { opacity: 1, stagger: 0.15, duration: 0.3 });    // stagger children

tl.play(); tl.pause(); tl.restart(); tl.progress(); // 0-1 for scrubber
```

## Design Guidelines

1. **KPI row at top** — 2-4 key numbers above charts, use `var(--widget-font-mono)` for values
2. **Depth tiers** — hero for primary content, elevated for cards, recessed for metadata
3. **Generous spacing** — 20-24px padding, 12-20px gaps
4. **Compositional variety** — alternate centered, left-heavy, right-heavy layouts. Avoid uniform grids.
5. **Card-based layout** — wrap sections in cards with `--widget-bg-secondary`
