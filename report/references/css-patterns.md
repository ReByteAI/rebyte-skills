# Editorial Report — CSS Patterns Reference

Complete CSS for the report widget. Copy all of this into your `<style>` tag.

## Base Document

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

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

.report {
  max-width: 1100px;
  margin: 0 auto;
  padding: 64px 48px 80px;
}

@media (max-width: 700px) {
  .report { padding: 36px 20px 48px; }
}
```

## Hero Section

```css
.report-hero {
  position: relative;
  margin-bottom: 48px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--widget-border);
}

.report-hero .hero-label {
  font-family: var(--widget-font-mono);
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--widget-accent-fg);
  margin-bottom: 20px;
}

.report-hero h1 {
  font-size: 48px;
  font-weight: 400;
  line-height: 1.15;
  max-width: 800px;
  margin-bottom: 16px;
}

.report-hero h1 em {
  font-style: italic;
  color: var(--widget-accent-fg);
}

.report-hero .byline {
  font-family: var(--widget-font-mono);
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--widget-text-muted);
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-hero .byline .separator {
  color: var(--widget-border);
}

/* Hero text — initially rendered by CSS, then replaced by Pretext engine */
.report-hero .hero-text {
  font-size: 20px;
  line-height: 1.7;
  color: var(--widget-text-secondary);
  max-width: 100%;
}

/* Pretext-rendered hero lines (absolutely positioned by engine) */
.report-hero .pretext-line {
  position: absolute;
  white-space: pre;
  color: var(--widget-text-secondary);
  user-select: text;
  transition: color 150ms ease;
}

.report-hero .pretext-line:hover {
  color: var(--widget-text-primary);
}

/* Hero decoration — circle by default */
.report-hero .hero-decoration {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: var(--widget-accent);
  opacity: 0.12;
  right: 0;
  top: 120px;
  pointer-events: none;
}

/* Hero image for wrap-image style */
.report-hero .hero-image {
  position: absolute;
  right: 0;
  top: 120px;
  max-width: 280px;
  max-height: 280px;
  object-fit: cover;
  border-radius: var(--widget-border-radius);
  pointer-events: none;
}

/* When Pretext is active, the hero text container becomes a positioning context */
.report-hero[data-pretext-active="true"] {
  min-height: var(--hero-computed-height, 400px);
}

.report-hero[data-pretext-active="true"] .hero-text {
  visibility: hidden;
  position: absolute;
}

@media (max-width: 700px) {
  .report-hero h1 { font-size: 32px; }
  .report-hero .hero-decoration { width: 120px; height: 120px; top: 80px; }
  .report-hero .hero-image { max-width: 160px; max-height: 160px; top: 80px; }
}
```

## Body Sections

```css
.report-body {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.report-section {
  column-count: 2;
  column-gap: 48px;
  column-rule: 1px solid var(--widget-border);
}

.report-section.single-column {
  column-count: 1;
}

.report-section h2 {
  column-span: all;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.25;
  margin-bottom: 24px;
}

.report-section h2 em {
  font-style: italic;
  color: var(--widget-accent-fg);
}

.report-section h3 {
  font-size: 24px;
  font-weight: 400;
  line-height: 1.3;
  margin-top: 24px;
  margin-bottom: 12px;
}

.report-section h3 em {
  font-style: italic;
  color: var(--widget-accent-fg);
}

.report-section p {
  font-size: 18px;
  line-height: 1.75;
  color: var(--widget-text-secondary);
  margin-bottom: 16px;
}

.report-section ul, .report-section ol {
  font-size: 18px;
  line-height: 1.75;
  color: var(--widget-text-secondary);
  margin-bottom: 16px;
  padding-left: 24px;
}

.report-section li {
  margin-bottom: 8px;
}

@media (max-width: 700px) {
  .report-section {
    column-count: 1;
  }
  .report-section h2 { font-size: 26px; }
}
```

## Pull Quote

```css
.report-pullquote {
  float: right;
  width: 45%;
  margin: 4px 0 24px 32px;
  padding: 24px 0 24px 24px;
  border-left: 3px solid var(--widget-accent);
}

.report-pullquote blockquote {
  font-size: 24px;
  font-style: italic;
  line-height: 1.5;
  color: var(--widget-text-primary);
}

.report-pullquote .attribution {
  font-size: 14px;
  color: var(--widget-text-muted);
  margin-top: 12px;
  font-style: normal;
}

@media (max-width: 700px) {
  .report-pullquote {
    float: none;
    width: 100%;
    margin: 24px 0;
  }
}
```

## Callout Box

```css
.report-callout {
  background: var(--widget-bg-secondary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  padding: 28px 32px;
  break-inside: avoid;
}

.report-callout .callout-label {
  font-family: var(--widget-font-mono);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--widget-accent-fg);
  margin-bottom: 12px;
}

.report-callout .callout-label::before {
  content: '';
  display: inline-block;
  width: 36px;
  height: 3px;
  background: var(--widget-accent);
  border-radius: 2px;
  margin-right: 12px;
  vertical-align: middle;
}

.report-callout .callout-text {
  font-size: 18px;
  line-height: 1.65;
  color: var(--widget-text-primary);
}
```

## Stat Row

```css
.report-stat-row {
  display: flex;
  gap: 32px;
  padding: 36px;
  background: var(--widget-bg-secondary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-item .stat-value {
  font-family: var(--widget-font-mono);
  font-size: 42px;
  font-weight: 500;
  color: var(--widget-accent-fg);
  line-height: 1;
}

.stat-item .stat-label {
  font-size: 14px;
  color: var(--widget-text-muted);
  margin-top: 10px;
}

@media (max-width: 700px) {
  .report-stat-row {
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }
  .stat-item .stat-value { font-size: 32px; }
}
```

## Figure

```css
.report-figure {
  margin: 8px 0;
  break-inside: avoid;
}

.report-figure img,
.report-figure canvas {
  width: 100%;
  height: auto;
  border-radius: var(--widget-border-radius);
  border: 1px solid var(--widget-border);
}

.report-figure figcaption {
  font-size: 14px;
  color: var(--widget-text-muted);
  margin-top: 10px;
  text-align: center;
  font-style: italic;
}
```

## Three Columns

```css
.report-columns-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.report-columns-3 > div {
  font-size: 18px;
  line-height: 1.65;
  color: var(--widget-text-secondary);
}

@media (max-width: 700px) {
  .report-columns-3 {
    grid-template-columns: 1fr;
  }
}
```

## Sidebar

```css
.report-sidebar {
  background: var(--widget-bg-tertiary);
  border-radius: var(--widget-border-radius);
  padding: 28px 32px;
  break-inside: avoid;
}

.report-sidebar .sidebar-title {
  font-family: var(--widget-font-mono);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--widget-accent-fg);
  margin-bottom: 16px;
}

.report-sidebar .sidebar-title::before {
  content: '';
  display: inline-block;
  width: 36px;
  height: 3px;
  background: var(--widget-accent);
  border-radius: 2px;
  margin-right: 12px;
  vertical-align: middle;
}

.report-sidebar p {
  font-size: 16px;
  line-height: 1.65;
  color: var(--widget-text-secondary);
}
```

## Footnotes

```css
.report-footnotes {
  margin-top: 16px;
  padding-top: 32px;
  border-top: 1px solid var(--widget-border);
}

.report-footnotes h3 {
  font-family: var(--widget-font-mono);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--widget-text-muted);
  margin-bottom: 16px;
}

.report-footnotes ol {
  padding-left: 20px;
}

.report-footnotes li {
  font-size: 14px;
  line-height: 1.6;
  color: var(--widget-text-muted);
  margin-bottom: 6px;
}
```

## Divider

```css
.report-divider {
  height: 1px;
  background: var(--widget-border);
  margin: 8px 0;
}

.report-divider::after {
  content: '';
  display: block;
  width: 48px;
  height: 3px;
  background: var(--widget-accent);
  border-radius: 2px;
  margin: -2px auto 0;
}
```

## Height Reporting

```javascript
// Copy this at the end of your <script> tag, after the report engine
(function() {
  function reportHeight() {
    var h = Math.min(document.body.scrollHeight, 8000);
    try { window.parent.postMessage({ type: 'html-viewer-height', height: h }, '*'); } catch(e) {}
  }
  reportHeight();
  window.addEventListener('resize', reportHeight);
  new MutationObserver(reportHeight).observe(document.body, { childList: true, subtree: true });
})();
```
