# Slide Template (Deploy Mode)

Every slide in deploy mode is a self-contained HTML file. Use this as your base template.

Set the `data-aesthetic` and `data-font` attributes, and include fallback CSS vars matching your chosen aesthetic palette.

```html
<!DOCTYPE html>
<html lang="en" data-aesthetic="editorial" data-font="instrument-serif">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1920,height=1080">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
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
}
html, body {
  width: 1920px; height: 1080px; overflow: hidden;
  font-family: var(--widget-font-sans);
  -webkit-font-smoothing: antialiased;
}
body {
  background: var(--widget-bg-primary);
  color: var(--widget-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 140px;
}
</style>
</head>
<body>
  <!-- Slide content goes here -->
</body>
</html>
```

## Layout Patterns

### Centered Title Slide
```html
<div style="text-align:center;max-width:1400px">
  <p data-bp-id="label-1" style="font-family:var(--widget-font-mono);font-size:14px;font-weight:500;text-transform:uppercase;letter-spacing:0.15em;color:var(--widget-accent-fg);margin-bottom:32px">LABEL</p>
  <h1 data-bp-id="title-1" style="font-size:80px;font-weight:400;line-height:1.1;margin-bottom:32px">Presentation <em style="color:var(--widget-accent-fg)">Title</em></h1>
  <p data-bp-id="subtitle-1" style="font-size:28px;color:var(--widget-text-secondary);line-height:1.5">Subtitle or tagline</p>
  <div style="width:80px;height:3px;background:var(--widget-accent);margin:40px auto 0;border-radius:2px"></div>
</div>
```

### Content Slide (Heading + Bullets)
```html
<div style="width:100%;max-width:1600px;display:flex;flex-direction:column;align-items:flex-start">
  <h2 data-bp-id="heading-2" style="font-size:52px;font-weight:400;margin-bottom:48px">Slide <em style="color:var(--widget-accent-fg)">Heading</em></h2>
  <ul data-bp-id="list-2" style="list-style:none;font-size:26px;line-height:1.7;color:var(--widget-text-secondary)">
    <li data-bp-id="item-2-1" style="padding-left:28px;position:relative;margin-bottom:16px">
      <span style="position:absolute;left:0;top:14px;width:10px;height:10px;border-radius:50%;background:var(--widget-accent)"></span>
      First point
    </li>
  </ul>
</div>
```

### Two-Column Layout
```html
<div style="width:100%;max-width:1600px;display:flex;flex-direction:column;align-items:flex-start">
  <h2 data-bp-id="heading-3" style="font-size:48px;font-weight:400;margin-bottom:56px">Comparison</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;width:100%">
    <div data-bp-id="card-3-1" style="background:var(--widget-bg-secondary);border:1px solid var(--widget-border);border-radius:var(--widget-border-radius);padding:40px">
      <div style="width:48px;height:3px;background:var(--widget-accent);margin-bottom:24px;border-radius:2px"></div>
      <h3 data-bp-id="heading-3-1" style="font-size:28px;font-weight:400;margin-bottom:20px">Left</h3>
      <p data-bp-id="desc-3-1" style="font-size:22px;line-height:1.6;color:var(--widget-text-secondary)">Content</p>
    </div>
    <div data-bp-id="card-3-2" style="background:var(--widget-bg-secondary);border:1px solid var(--widget-border);border-radius:var(--widget-border-radius);padding:40px">
      <div style="width:48px;height:3px;background:var(--widget-accent);margin-bottom:24px;border-radius:2px"></div>
      <h3 data-bp-id="heading-3-2" style="font-size:28px;font-weight:400;margin-bottom:20px">Right</h3>
      <p data-bp-id="desc-3-2" style="font-size:22px;line-height:1.6;color:var(--widget-text-secondary)">Content</p>
    </div>
  </div>
</div>
```

### Big Number / Stat Slide
```html
<div style="text-align:center">
  <p data-bp-id="label-4" style="font-family:var(--widget-font-mono);font-size:14px;text-transform:uppercase;letter-spacing:0.15em;color:var(--widget-text-muted);margin-bottom:40px">BY THE NUMBERS</p>
  <p data-bp-id="stat-num-4" style="font-family:var(--widget-font-mono);font-size:96px;font-weight:500;color:var(--widget-accent-fg);line-height:1">87%</p>
  <p data-bp-id="stat-label-4" style="font-size:22px;color:var(--widget-text-secondary);margin-top:16px">of developers prefer this approach</p>
</div>
```

### Quote Slide
```html
<div style="max-width:1200px;text-align:center">
  <p style="font-size:120px;line-height:0.5;color:var(--widget-accent);opacity:0.4;margin-bottom:24px">"</p>
  <blockquote data-bp-id="quote-5" style="font-size:38px;font-style:italic;line-height:1.6">The best way to predict the future is to invent it.</blockquote>
  <p data-bp-id="attr-5" style="font-size:20px;color:var(--widget-text-muted);margin-top:40px"><strong style="color:var(--widget-text-secondary)">Alan Kay</strong> — Computer scientist</p>
</div>
```

### Code Slide
```html
<div style="width:100%;max-width:1600px;display:flex;flex-direction:column;align-items:flex-start">
  <h2 data-bp-id="heading-6" style="font-size:42px;font-weight:400;margin-bottom:40px">Code Example</h2>
  <pre data-bp-id="code-6" style="background:var(--widget-bg-tertiary);border:1px solid var(--widget-border);border-radius:var(--widget-border-radius);padding:32px;font-size:20px;line-height:1.6;font-family:var(--widget-font-mono);overflow-x:auto;width:100%"><code><span style="color:var(--widget-accent-fg)">const</span> result = <span style="color:var(--widget-accent-fg)">await</span> fetch(<span style="color:var(--widget-chart-2)">'/api/data'</span>)</code></pre>
</div>
```

## Design Tips

1. **Padding**: 100px top/bottom, 140px sides. Content never touches edges.
2. **Contrast**: Use `var(--widget-text-primary)` on `var(--widget-bg-primary)` for maximum contrast.
3. **Hierarchy**: One element dominates each slide.
4. **White space**: Less content per slide is always better.
5. **Consistency**: Use the same `data-aesthetic` and `data-font` on every slide file.
6. **Border radius**: Use `var(--widget-border-radius)` (12px) on cards and code blocks.
