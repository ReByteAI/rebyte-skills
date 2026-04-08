# CSS Patterns Reference

Extended patterns for the show-me-how skill. Read this when building complex widgets.

## Depth Tiers

```css
/* Hero — prominent section with accent border */
.card--hero {
  background: var(--widget-bg-secondary);
  border-left: 3px solid var(--widget-accent);
  box-shadow: var(--widget-shadow-md);
  padding: 24px;
  border-radius: var(--widget-border-radius);
}

/* Elevated — default card */
.card {
  background: var(--widget-bg-secondary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  padding: 20px;
  box-shadow: var(--widget-shadow-sm);
}

/* Recessed — inputs, metadata, footnotes */
.card--recessed {
  background: var(--widget-bg-tertiary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  padding: 16px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
}
```

## KPI / Metric Cards

```html
<div class="kpi-row">
  <div class="kpi">
    <span class="kpi-value" data-target="1234">0</span>
    <span class="kpi-label">Total Users</span>
  </div>
  <div class="kpi">
    <span class="kpi-value" data-target="89">0</span>
    <span class="kpi-label">Success Rate %</span>
  </div>
</div>
```

```css
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.kpi {
  background: var(--widget-bg-secondary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  padding: 16px;
  text-align: center;
}
.kpi-value {
  font-family: var(--widget-font-mono);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--widget-accent-fg);
  display: block;
}
.kpi-label {
  font-size: 0.75rem;
  color: var(--widget-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

## Status Indicators

```css
.status { display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 500; padding: 2px 8px; border-radius: 4px; }
.status--match  { color: #166534; background: #dcfce7; }
.status--gap    { color: #991b1b; background: #fee2e2; }
.status--warn   { color: #854d0e; background: #fef9c3; }
.status--info   { color: var(--widget-accent-fg); background: var(--widget-bg-tertiary); }
```

## Data Tables

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.data-table th {
  position: sticky;
  top: 0;
  background: var(--widget-bg-tertiary);
  color: var(--widget-text-secondary);
  font-weight: 600;
  text-align: left;
  padding: 10px 12px;
  border-bottom: 2px solid var(--widget-border);
  white-space: nowrap;
}
.data-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--widget-border);
  overflow-wrap: break-word;
}
.data-table tr:nth-child(even) td {
  background: var(--widget-bg-secondary);
}
.data-table .num {
  font-family: var(--widget-font-mono);
  text-align: right;
}
```

## Collapsible Sections

```html
<details class="collapsible">
  <summary>Section Title</summary>
  <div class="collapsible-body">Content here</div>
</details>
```

```css
.collapsible {
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  margin-bottom: 12px;
}
.collapsible summary {
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  color: var(--widget-text-primary);
  list-style: none;
}
.collapsible summary::before {
  content: '▶';
  display: inline-block;
  margin-right: 8px;
  transition: transform 0.2s;
  font-size: 0.7em;
}
.collapsible[open] summary::before { transform: rotate(90deg); }
.collapsible-body { padding: 0 16px 16px; }
```

## Mermaid Zoom Controls — Full Implementation

```html
<div class="diagram-shell">
  <div class="diagram-toolbar">
    <button class="dia-btn" data-action="zoom-in" title="Zoom in">+</button>
    <button class="dia-btn" data-action="zoom-out" title="Zoom out">−</button>
    <button class="dia-btn" data-action="fit" title="Fit to view">Fit</button>
    <button class="dia-btn" data-action="reset" title="Reset zoom">1:1</button>
  </div>
  <div class="diagram-viewport">
    <div class="diagram-canvas">
      <pre class="mermaid">
        graph TD
          A[Start] --> B[Process]
          B --> C[End]
      </pre>
    </div>
  </div>
</div>
```

```css
.diagram-shell { position: relative; border: 1px solid var(--widget-border); border-radius: var(--widget-border-radius); overflow: hidden; }
.diagram-toolbar { display: flex; gap: 4px; padding: 8px; background: var(--widget-bg-secondary); border-bottom: 1px solid var(--widget-border); }
.dia-btn { padding: 4px 10px; border: 1px solid var(--widget-border); border-radius: 4px; background: var(--widget-bg-primary); color: var(--widget-text-secondary); cursor: pointer; font-size: 0.8rem; }
.dia-btn:hover { background: var(--widget-bg-tertiary); }
.diagram-viewport { overflow: hidden; cursor: grab; height: 400px; position: relative; }
.diagram-viewport.grabbing { cursor: grabbing; }
.diagram-canvas { transform-origin: 0 0; position: absolute; top: 0; left: 0; }
```

```javascript
(function() {
  var shells = document.querySelectorAll('.diagram-shell');
  shells.forEach(function(shell) {
    var viewport = shell.querySelector('.diagram-viewport');
    var canvas = shell.querySelector('.diagram-canvas');
    if (!viewport || !canvas) return;

    var scale = 1, panX = 0, panY = 0;
    var isDragging = false, startX = 0, startY = 0;
    var MIN_SCALE = 0.2, MAX_SCALE = 5;

    function apply() {
      canvas.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + scale + ')';
    }

    function fit() {
      var svg = canvas.querySelector('svg');
      if (!svg) return;
      var vw = viewport.clientWidth, vh = viewport.clientHeight;
      var sw = svg.getBoundingClientRect().width / scale;
      var sh = svg.getBoundingClientRect().height / scale;
      scale = Math.min(vw / sw, vh / sh, 2) * 0.9;
      panX = (vw - sw * scale) / 2;
      panY = (vh - sh * scale) / 2;
      apply();
    }

    // Toolbar buttons
    shell.querySelectorAll('.dia-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.action;
        if (action === 'zoom-in')  { scale = Math.min(scale * 1.3, MAX_SCALE); apply(); }
        if (action === 'zoom-out') { scale = Math.max(scale / 1.3, MIN_SCALE); apply(); }
        if (action === 'fit')      { fit(); }
        if (action === 'reset')    { scale = 1; panX = 0; panY = 0; apply(); }
      });
    });

    // Scroll zoom
    viewport.addEventListener('wheel', function(e) {
      e.preventDefault();
      var rect = viewport.getBoundingClientRect();
      var mx = e.clientX - rect.left, my = e.clientY - rect.top;
      var factor = e.deltaY < 0 ? 1.15 : 1/1.15;
      var newScale = Math.max(MIN_SCALE, Math.min(scale * factor, MAX_SCALE));
      panX = mx - (mx - panX) * (newScale / scale);
      panY = my - (my - panY) * (newScale / scale);
      scale = newScale;
      apply();
    }, { passive: false });

    // Drag pan
    viewport.addEventListener('pointerdown', function(e) {
      isDragging = true; startX = e.clientX - panX; startY = e.clientY - panY;
      viewport.classList.add('grabbing');
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', function(e) {
      if (!isDragging) return;
      panX = e.clientX - startX; panY = e.clientY - startY;
      apply();
    });
    viewport.addEventListener('pointerup', function() {
      isDragging = false;
      viewport.classList.remove('grabbing');
    });

    // Auto-fit after Mermaid renders
    setTimeout(fit, 500);
    setTimeout(fit, 1500);
  });
})();
```

## Animation Choreography

### Staggered Card Entrance (anime.js)

```javascript
anime({
  targets: '.card',
  opacity: [0, 1],
  translateY: [20, 0],
  delay: anime.stagger(80),
  easing: 'easeOutCubic',
  duration: 500,
});
```

### Count-Up Numbers

```javascript
document.querySelectorAll('.kpi-value[data-target]').forEach(function(el) {
  anime({
    targets: el,
    innerHTML: [0, +el.dataset.target],
    round: 1,
    easing: 'easeOutExpo',
    duration: 1200,
  });
});
```

### SVG Path Drawing

```javascript
anime({
  targets: '.connector path',
  strokeDashoffset: [anime.setDashoffset, 0],
  easing: 'easeInOutSine',
  duration: 800,
  delay: anime.stagger(200),
});
```

### Respect Reduced Motion

Always check before animating:

```javascript
var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReduced) {
  // Make everything visible immediately
  document.querySelectorAll('.card, .kpi-value').forEach(function(el) {
    el.style.opacity = 1;
    el.style.transform = 'none';
  });
  // Set count-up targets immediately
  document.querySelectorAll('.kpi-value[data-target]').forEach(function(el) {
    el.textContent = el.dataset.target;
  });
} else {
  // Run animations
}
```

## Overflow Prevention Patterns

These are critical for inline iframe widgets:

```css
/* Grid/flex children MUST have min-width: 0 to prevent overflow */
.grid > *, [style*="display: grid"] > *,
.flex > *, [style*="display: flex"] > * {
  min-width: 0;
}

/* Text wrapping */
p, td, th, li, span, label, dt, dd {
  overflow-wrap: break-word;
  word-break: break-word;
}

/* Code blocks */
pre, code {
  white-space: pre-wrap;
  overflow-x: auto;
  max-width: 100%;
}

/* Images and canvas */
img, canvas, svg, video, iframe {
  max-width: 100%;
  height: auto;
}

/* Tables — wrap in scrollable container for wide tables */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* NEVER use display:flex on <li> — it breaks list markers.
   For custom markers, use position:absolute instead. */
li {
  position: relative;
  padding-left: 1.5em;
}
li::before {
  position: absolute;
  left: 0;
}
```

## Connectors

### CSS Vertical Arrow

```css
.arrow-down {
  width: 2px;
  height: 30px;
  background: var(--widget-border);
  margin: 0 auto;
  position: relative;
}
.arrow-down::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: var(--widget-border);
}
```

### CSS Horizontal Arrow

```css
.arrow-right {
  height: 2px;
  background: var(--widget-border);
  position: relative;
  flex: 1;
}
.arrow-right::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-left-color: var(--widget-border);
}
```
