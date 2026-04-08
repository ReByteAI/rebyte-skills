# Report Template

Base HTML template for editorial reports. Set `data-aesthetic` and `data-font` on `<html>`, include fallback CSS vars, and fill in the content sections.

## Template

```html
<!DOCTYPE html>
<html lang="en" data-aesthetic="editorial" data-font="instrument-serif">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
/* === Reset & Root === */
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  /* Fallback values — viewer overrides these when rendered in-app */
  --widget-bg-primary: #faf8f4;
  --widget-bg-secondary: #f0ede6;
  --widget-bg-tertiary: #e5e0d6;
  --widget-text-primary: #1a1a2e;
  --widget-text-secondary: #4a4a5a;
  --widget-text-muted: #8a8a96;
  --widget-accent: #c8a55a;
  --widget-accent-fg: #a07820;
  --widget-accent-text: #1a1a2e;
  --widget-border: #d8d4ca;
  --widget-border-radius: 12px;
  --widget-shadow-sm: 0 1px 2px rgba(26,26,46,0.04);
  --widget-shadow-md: 0 4px 8px rgba(26,26,46,0.08);
  --widget-font-sans: 'Instrument Serif', serif;
  --widget-font-mono: 'JetBrains Mono', monospace;
  --widget-chart-1: #a07820;
  --widget-chart-2: #5a8a5a;
  --widget-chart-3: #7a5a8a;
  --widget-chart-4: #8a5a5a;
  --widget-chart-5: #5a7a8a;
  --widget-chart-6: #8a8a5a;
  --widget-chart-7: #5a5a8a;
  --widget-chart-8: #6a7a6a;
}

/* === Paste all CSS from references/css-patterns.md here === */

html, body {
  width: 100%;
  min-height: 100%;
  overflow-y: auto;
  font-family: var(--widget-font-sans);
  -webkit-font-smoothing: antialiased;
  background: var(--widget-bg-primary);
  color: var(--widget-text-primary);
}
body { padding: 0; }
.report { max-width: 1100px; margin: 0 auto; padding: 64px 48px 80px; }

/* Hero */
.report-hero { position: relative; margin-bottom: 48px; padding-bottom: 40px; border-bottom: 1px solid var(--widget-border); }
.report-hero .hero-label { font-family: var(--widget-font-mono); font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--widget-accent-fg); margin-bottom: 20px; }
.report-hero h1 { font-size: 48px; font-weight: 400; line-height: 1.15; max-width: 800px; margin-bottom: 16px; }
.report-hero h1 em { font-style: italic; color: var(--widget-accent-fg); }
.report-hero .byline { font-family: var(--widget-font-mono); font-size: 13px; letter-spacing: 0.06em; color: var(--widget-text-muted); margin-bottom: 32px; display: flex; align-items: center; gap: 8px; }
.report-hero .byline .separator { color: var(--widget-border); }
.report-hero .hero-text { font-size: 20px; line-height: 1.7; color: var(--widget-text-secondary); max-width: 100%; }
.report-hero .pretext-line { position: absolute; white-space: pre; color: var(--widget-text-secondary); user-select: text; transition: color 150ms ease; }
.report-hero .pretext-line:hover { color: var(--widget-text-primary); }
.report-hero .hero-decoration { position: absolute; width: 200px; height: 200px; border-radius: 50%; background: var(--widget-accent); opacity: 0.12; right: 0; top: 120px; pointer-events: none; }
.report-hero .hero-image { position: absolute; right: 0; top: 120px; max-width: 280px; max-height: 280px; object-fit: cover; border-radius: var(--widget-border-radius); pointer-events: none; }
.report-hero[data-pretext-active="true"] { min-height: var(--hero-computed-height, 400px); }
.report-hero[data-pretext-active="true"] .hero-text { visibility: hidden; position: absolute; }

/* Body */
.report-body { display: flex; flex-direction: column; gap: 40px; }
.report-section { column-count: 2; column-gap: 48px; column-rule: 1px solid var(--widget-border); }
.report-section.single-column { column-count: 1; }
.report-section h2 { column-span: all; font-size: 32px; font-weight: 400; line-height: 1.25; margin-bottom: 24px; }
.report-section h2 em { font-style: italic; color: var(--widget-accent-fg); }
.report-section h3 { font-size: 24px; font-weight: 400; line-height: 1.3; margin-top: 24px; margin-bottom: 12px; }
.report-section h3 em { font-style: italic; color: var(--widget-accent-fg); }
.report-section p { font-size: 18px; line-height: 1.75; color: var(--widget-text-secondary); margin-bottom: 16px; }
.report-section ul, .report-section ol { font-size: 18px; line-height: 1.75; color: var(--widget-text-secondary); margin-bottom: 16px; padding-left: 24px; }
.report-section li { margin-bottom: 8px; }

/* Pull Quote */
.report-pullquote { float: right; width: 45%; margin: 4px 0 24px 32px; padding: 24px 0 24px 24px; border-left: 3px solid var(--widget-accent); }
.report-pullquote blockquote { font-size: 24px; font-style: italic; line-height: 1.5; color: var(--widget-text-primary); }
.report-pullquote .attribution { font-size: 14px; color: var(--widget-text-muted); margin-top: 12px; font-style: normal; }

/* Callout */
.report-callout { background: var(--widget-bg-secondary); border: 1px solid var(--widget-border); border-radius: var(--widget-border-radius); padding: 28px 32px; break-inside: avoid; }
.report-callout .callout-label { font-family: var(--widget-font-mono); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--widget-accent-fg); margin-bottom: 12px; }
.report-callout .callout-label::before { content: ''; display: inline-block; width: 36px; height: 3px; background: var(--widget-accent); border-radius: 2px; margin-right: 12px; vertical-align: middle; }
.report-callout .callout-text { font-size: 18px; line-height: 1.65; color: var(--widget-text-primary); }

/* Stats */
.report-stat-row { display: flex; gap: 32px; padding: 36px; background: var(--widget-bg-secondary); border: 1px solid var(--widget-border); border-radius: var(--widget-border-radius); }
.stat-item { flex: 1; text-align: center; }
.stat-item .stat-value { font-family: var(--widget-font-mono); font-size: 42px; font-weight: 500; color: var(--widget-accent-fg); line-height: 1; }
.stat-item .stat-label { font-size: 14px; color: var(--widget-text-muted); margin-top: 10px; }

/* Figure */
.report-figure { margin: 8px 0; break-inside: avoid; }
.report-figure img, .report-figure canvas { width: 100%; height: auto; border-radius: var(--widget-border-radius); border: 1px solid var(--widget-border); }
.report-figure figcaption { font-size: 14px; color: var(--widget-text-muted); margin-top: 10px; text-align: center; font-style: italic; }

/* Three Columns */
.report-columns-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
.report-columns-3 > div { font-size: 18px; line-height: 1.65; color: var(--widget-text-secondary); }

/* Sidebar */
.report-sidebar { background: var(--widget-bg-tertiary); border-radius: var(--widget-border-radius); padding: 28px 32px; break-inside: avoid; }
.report-sidebar .sidebar-title { font-family: var(--widget-font-mono); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--widget-accent-fg); margin-bottom: 16px; }
.report-sidebar .sidebar-title::before { content: ''; display: inline-block; width: 36px; height: 3px; background: var(--widget-accent); border-radius: 2px; margin-right: 12px; vertical-align: middle; }
.report-sidebar p { font-size: 16px; line-height: 1.65; color: var(--widget-text-secondary); }

/* Footnotes */
.report-footnotes { margin-top: 16px; padding-top: 32px; border-top: 1px solid var(--widget-border); }
.report-footnotes h3 { font-family: var(--widget-font-mono); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: var(--widget-text-muted); margin-bottom: 16px; }
.report-footnotes ol { padding-left: 20px; }
.report-footnotes li { font-size: 14px; line-height: 1.6; color: var(--widget-text-muted); margin-bottom: 6px; }

/* Divider */
.report-divider { height: 1px; background: var(--widget-border); margin: 8px 0; }
.report-divider::after { content: ''; display: block; width: 48px; height: 3px; background: var(--widget-accent); border-radius: 2px; margin: -2px auto 0; }

/* Responsive */
@media (max-width: 700px) {
  .report { padding: 36px 20px 48px; }
  .report-hero h1 { font-size: 32px; }
  .report-hero .hero-decoration { width: 120px; height: 120px; top: 80px; }
  .report-hero .hero-image { max-width: 160px; max-height: 160px; top: 80px; }
  .report-section { column-count: 1; }
  .report-section h2 { font-size: 26px; }
  .report-pullquote { float: none; width: 100%; margin: 24px 0; }
  .report-stat-row { flex-direction: column; gap: 24px; padding: 24px; }
  .stat-item .stat-value { font-size: 32px; }
  .report-columns-3 { grid-template-columns: 1fr; }
}
</style>
</head>
<body tabindex="0">
  <article class="report">

    <!-- HERO SECTION -->
    <header class="report-hero" data-hero-style="wrap-circle">
      <div class="hero-label">REPORT CATEGORY</div>
      <h1>Report <em>Title</em> Goes Here</h1>
      <div class="byline">
        <span class="author">Author Name</span>
        <span class="separator">·</span>
        <span class="date">March 2026</span>
      </div>
      <div class="hero-decoration"></div>
      <p class="hero-text">Opening paragraph that introduces the key themes and findings of this report. This text will be laid out by the Pretext engine, flowing around the decorative circle element to create a magazine-style visual effect. Write a compelling opening that draws the reader in.</p>
    </header>

    <!-- BODY -->
    <div class="report-body">

      <!-- Standard 2-column section -->
      <section class="report-section">
        <h2>Section <em>Heading</em></h2>
        <p>Body text here. This automatically flows into two CSS columns.</p>
        <p>More paragraphs continue in the column flow.</p>
      </section>

      <!-- Stat row -->
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

      <!-- Section with pull quote -->
      <section class="report-section">
        <h2>Analysis &amp; <em>Findings</em></h2>
        <aside class="report-pullquote">
          <blockquote>A significant pull quote from the report.</blockquote>
          <div class="attribution">— Source, 2026</div>
        </aside>
        <p>Body text that flows around the pull quote.</p>
        <p>Additional paragraphs continue here.</p>
      </section>

      <!-- Callout -->
      <div class="report-callout">
        <div class="callout-label">Key Finding</div>
        <div class="callout-text">An important insight or conclusion highlighted for the reader.</div>
      </div>

      <!-- Footnotes -->
      <footer class="report-footnotes">
        <h3>References</h3>
        <ol>
          <li>Source one, "Title," Year.</li>
          <li>Source two, "Title," Year.</li>
        </ol>
      </footer>

    </div>
  </article>

  <script>
  /* === Report Engine — copy verbatim from references/report-engine.md === */
  </script>

  <script>
  /* === Height Reporting === */
  (function() {
    function reportHeight() {
      var h = Math.min(document.body.scrollHeight, 8000);
      try { window.parent.postMessage({ type: 'html-viewer-height', height: h }, '*'); } catch(e) {}
    }
    reportHeight();
    window.addEventListener('resize', reportHeight);
    new MutationObserver(reportHeight).observe(document.body, { childList: true, subtree: true });
  })();
  </script>
</body>
</html>
```

## Google Fonts Links by Font Pair

Choose the matching `<link>` for your `data-font`:

| Font pair | Google Fonts URL |
|-----------|-----------------|
| `instrument-serif` | `https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap` |
| `crimson-pro` | `https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;1,400&family=Noto+Sans+Mono:wght@400;500&display=swap` |
| `playfair` | `https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto+Mono:wght@400;500&display=swap` |
| `fraunces` | `https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;1,400&family=Source+Code+Pro:wght@400;500&display=swap` |
| `dm-sans` | `https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Fira+Code:wght@400;500&display=swap` |
| `ibm-plex` | `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap` |
| `libre-franklin` | `https://fonts.googleapis.com/css2?family=Libre+Franklin:ital,wght@0,400;0,500;0,600;1,400&family=Inconsolata:wght@400;500&display=swap` |

## Fallback CSS Vars by Aesthetic

Use these in `:root` to match your chosen aesthetic:

### editorial (default)
```css
:root {
  --widget-bg-primary: #faf8f4;
  --widget-bg-secondary: #f0ede6;
  --widget-bg-tertiary: #e5e0d6;
  --widget-text-primary: #1a1a2e;
  --widget-text-secondary: #4a4a5a;
  --widget-text-muted: #8a8a96;
  --widget-accent: #c8a55a;
  --widget-accent-fg: #a07820;
  --widget-accent-text: #1a1a2e;
  --widget-border: #d8d4ca;
}
```

### paper-ink
```css
:root {
  --widget-bg-primary: #faf6f0;
  --widget-bg-secondary: #f2ece2;
  --widget-bg-tertiary: #e8e0d4;
  --widget-text-primary: #2a1f14;
  --widget-text-secondary: #5a4a3a;
  --widget-text-muted: #8a7a6a;
  --widget-accent: #c75a3a;
  --widget-accent-fg: #a84420;
  --widget-accent-text: #faf6f0;
  --widget-border: #d8d0c4;
}
```

### warm
```css
:root {
  --widget-bg-primary: #fdf8f0;
  --widget-bg-secondary: #f5ede2;
  --widget-bg-tertiary: #ebe2d4;
  --widget-text-primary: #2a2018;
  --widget-text-secondary: #5a4e40;
  --widget-text-muted: #8a7e70;
  --widget-accent: #e8a060;
  --widget-accent-fg: #c07830;
  --widget-accent-text: #2a2018;
  --widget-border: #ddd4c6;
}
```
