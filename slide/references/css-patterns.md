# HTML Slides — CSS Patterns Reference

Complete CSS and JS for widget mode (single-file slides).

## Slide Engine

```css
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 100%; height: 100%; overflow: hidden;
  background: #111;
  font-family: var(--widget-font-sans);
}
body { display: flex; align-items: center; justify-content: center; }

.deck {
  position: relative;
  width: 1920px; height: 1080px;
  transform-origin: center center;
  overflow: hidden;
  background: var(--widget-bg-primary);
}

.slide {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 100px 140px;
  color: var(--widget-text-primary);
  background: var(--widget-bg-primary);
  opacity: 0; pointer-events: none;
  will-change: transform, opacity;
}
```

## Transitions

### Slide (default)
```css
.deck[data-transition="slide"] .slide,
.deck:not([data-transition]) .slide {
  transition: transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.55s ease;
  transform: translateX(100%);
}
.deck[data-transition="slide"] .slide--active,
.deck:not([data-transition]) .slide--active {
  opacity: 1; pointer-events: auto; transform: translateX(0);
}
.deck[data-transition="slide"] .slide--prev,
.deck:not([data-transition]) .slide--prev {
  transform: translateX(-100%);
}
```

### Fade
```css
.deck[data-transition="fade"] .slide {
  transition: opacity 0.5s ease; transform: none;
}
.deck[data-transition="fade"] .slide--active {
  opacity: 1; pointer-events: auto;
}
```

### None
```css
.deck[data-transition="none"] .slide { transition: none; transform: none; }
.deck[data-transition="none"] .slide--active { opacity: 1; pointer-events: auto; }
```

## Controls

```css
.slide-controls {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 12px;
  background: rgba(26,26,46,0.85); backdrop-filter: blur(12px);
  border-radius: 32px; padding: 8px 20px;
  z-index: 100; opacity: 0; transition: opacity 0.3s;
  user-select: none;
}
body:hover .slide-controls { opacity: 1; }

.ctrl-btn {
  background: none; border: none; color: rgba(255,255,255,0.8);
  cursor: pointer; width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; transition: background 0.15s;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.15); }
.ctrl-btn:disabled { opacity: 0.3; cursor: default; }

.slide-counter {
  color: rgba(255,255,255,0.6); font-size: 13px;
  font-family: var(--widget-font-mono);
  font-variant-numeric: tabular-nums;
  min-width: 50px; text-align: center;
}

.slide-progress {
  position: fixed; top: 0; left: 0; height: 3px;
  background: var(--widget-accent);
  transition: width 0.4s ease; z-index: 101;
}
```

## Layout Classes

**Note on `data-page` and `data-bp-id` attributes:** Every `<section>` must have `data-page="N"` and every editable element must have a unique `data-bp-id`. These are data-only attributes for iteration support -- **never write CSS selectors that target them**. All styling uses the class-based selectors below.

### Expected HTML structure
```html
<section class="slide slide--title" data-page="1">
  <p class="label" data-bp-id="label-1">KEYNOTE</p>
  <h1 data-bp-id="title-1">Presentation <em>Title</em></h1>
  <p class="subtitle" data-bp-id="subtitle-1">Subtitle</p>
  <div class="divider"></div>
</section>
<section class="slide slide--section" data-page="2">
  <p class="section-number" data-bp-id="label-2">01</p>
  <h2 data-bp-id="heading-2">Section <em>Name</em></h2>
</section>
<section class="slide slide--content" data-page="3">
  <h2 data-bp-id="heading-3">Content <em>Heading</em></h2>
  <ul data-bp-id="list-3">
    <li data-bp-id="item-3-1">First point</li>
    <li data-bp-id="item-3-2">Second point</li>
  </ul>
</section>
<section class="slide slide--two-col" data-page="4">
  <h2 data-bp-id="heading-4">Comparison</h2>
  <div class="col-grid">
    <div class="col-card" data-bp-id="card-4-1">
      <div class="accent-bar"></div>
      <h3 data-bp-id="heading-4-1">Left</h3>
      <p data-bp-id="desc-4-1">Content</p>
    </div>
    <div class="col-card" data-bp-id="card-4-2">
      <div class="accent-bar"></div>
      <h3 data-bp-id="heading-4-2">Right</h3>
      <p data-bp-id="desc-4-2">Content</p>
    </div>
  </div>
</section>
<section class="slide slide--stat" data-page="5">
  <p class="label" data-bp-id="label-5">BY THE NUMBERS</p>
  <div class="stat-grid" data-bp-id="stat-5">
    <div class="stat-item" data-bp-id="stat-5-1">
      <p class="big-number" data-bp-id="stat-num-5-1">87%</p>
      <p class="stat-label" data-bp-id="stat-label-5-1">Adoption rate</p>
    </div>
    <div class="stat-item" data-bp-id="stat-5-2">
      <p class="big-number" data-bp-id="stat-num-5-2">2.4x</p>
      <p class="stat-label" data-bp-id="stat-label-5-2">Performance gain</p>
    </div>
  </div>
</section>
<section class="slide slide--quote" data-page="6">
  <p class="quote-mark">"</p>
  <blockquote data-bp-id="quote-6">The best way to predict the future is to invent it.</blockquote>
  <p class="attribution" data-bp-id="attr-6"><strong>Alan Kay</strong> — Computer scientist</p>
</section>
<section class="slide slide--code" data-page="7">
  <h2 data-bp-id="heading-7">Code Example</h2>
  <pre data-bp-id="code-7"><code>...</code></pre>
</section>
<section class="slide slide--closing" data-page="8">
  <h2 data-bp-id="heading-8">Thank <em>You</em></h2>
  <div class="cta" data-bp-id="cta-8">Get Started</div>
  <p class="footer-text" data-bp-id="footer-8">team@example.com</p>
</section>
```

### Title
```css
.slide--title { flex-direction: column; text-align: center; }
.slide--title .label {
  font-family: var(--widget-font-mono);
  font-size: 14px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.15em;
  color: var(--widget-accent-fg); margin-bottom: 32px;
}
.slide--title h1 { font-size: 80px; font-weight: 400; line-height: 1.1; max-width: 1200px; }
.slide--title h1 em { font-style: italic; color: var(--widget-accent-fg); }
.slide--title .subtitle { font-size: 28px; color: var(--widget-text-secondary); margin-top: 32px; }
.slide--title .divider {
  width: 80px; height: 3px; background: var(--widget-accent);
  margin: 40px auto 0; border-radius: 2px;
}
```

### Section Divider
```css
.slide--section { flex-direction: column; text-align: center; }
.slide--section h2 { font-size: 64px; font-weight: 400; }
.slide--section h2 em { font-style: italic; color: var(--widget-accent-fg); }
.slide--section .section-number {
  font-family: var(--widget-font-mono); font-size: 18px;
  color: var(--widget-text-muted); margin-bottom: 24px;
}
```

### Content (bullets)
```css
.slide--content { flex-direction: column; align-items: flex-start; }
.slide--content h2 { font-size: 52px; font-weight: 400; margin-bottom: 48px; }
.slide--content h2 em { font-style: italic; color: var(--widget-accent-fg); }
.slide--content ul {
  list-style: none; font-size: 26px; line-height: 1.7;
  color: var(--widget-text-secondary);
}
.slide--content ul li { padding-left: 28px; position: relative; margin-bottom: 16px; }
.slide--content ul li::before {
  content: ''; position: absolute; left: 0; top: 14px;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--widget-accent);
}
```

### Two Column
```css
.slide--two-col { flex-direction: column; align-items: flex-start; }
.slide--two-col h2 { font-size: 48px; font-weight: 400; margin-bottom: 56px; }
.col-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; width: 100%; }
.col-card {
  background: var(--widget-bg-secondary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  padding: 40px;
}
.col-card h3 { font-size: 28px; font-weight: 400; margin-bottom: 20px; }
.col-card p { font-size: 22px; line-height: 1.6; color: var(--widget-text-secondary); }
.col-card .accent-bar {
  width: 48px; height: 3px; background: var(--widget-accent);
  margin-bottom: 24px; border-radius: 2px;
}
```

### Stat / Big Number
```css
.slide--stat { flex-direction: column; text-align: center; }
.stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 80px; margin-top: 40px; }
.stat-item .big-number {
  font-family: var(--widget-font-mono);
  font-size: 96px; font-weight: 500;
  color: var(--widget-accent-fg); line-height: 1;
}
.stat-item .stat-label { font-size: 22px; color: var(--widget-text-secondary); margin-top: 16px; }
.stat-item .stat-detail { font-size: 16px; color: var(--widget-text-muted); margin-top: 8px; }
```

### Quote
```css
.slide--quote { flex-direction: column; text-align: center; max-width: 1200px; margin: 0 auto; }
.slide--quote .quote-mark {
  font-size: 120px; line-height: 0.5;
  color: var(--widget-accent); opacity: 0.4; margin-bottom: 24px;
}
.slide--quote blockquote { font-size: 38px; font-style: italic; line-height: 1.6; }
.slide--quote .attribution {
  font-size: 20px; color: var(--widget-text-muted); margin-top: 40px; font-style: normal;
}
.slide--quote .attribution strong { color: var(--widget-text-secondary); }
```

### Code
```css
.slide--code { flex-direction: column; align-items: flex-start; }
.slide--code h2 { font-size: 42px; font-weight: 400; margin-bottom: 40px; }
.slide--code pre {
  background: var(--widget-bg-tertiary);
  border: 1px solid var(--widget-border);
  border-radius: var(--widget-border-radius);
  padding: 32px; font-size: 20px; line-height: 1.6;
  font-family: var(--widget-font-mono);
  overflow-x: auto; width: 100%;
}
.slide--code .keyword { color: var(--widget-accent-fg); }
.slide--code .string { color: var(--widget-chart-2); }
.slide--code .comment { color: var(--widget-text-muted); font-style: italic; }
```

### Closing
```css
.slide--closing { flex-direction: column; text-align: center; }
.slide--closing h2 { font-size: 64px; font-weight: 400; }
.slide--closing h2 em { font-style: italic; color: var(--widget-accent-fg); }
.slide--closing .cta {
  display: inline-block; margin-top: 40px;
  padding: 16px 48px; border-radius: 8px;
  background: var(--widget-accent-fg); color: var(--widget-accent-text);
  font-size: 20px; font-family: var(--widget-font-mono);
}
.slide--closing .footer-text {
  font-size: 18px; color: var(--widget-text-muted); margin-top: 32px;
}
```

## Navigation Engine (JS)

Copy this verbatim into your `<script>` tag:

```javascript
(function() {
  var slides = document.querySelectorAll('.slide');
  var total = slides.length;
  var current = 0;
  var counter = document.getElementById('counter');
  var progress = document.getElementById('progress');
  var prevBtn = document.getElementById('prev-btn');
  var nextBtn = document.getElementById('next-btn');

  function show(index) {
    current = Math.max(0, Math.min(index, total - 1));
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      s.classList.remove('slide--active', 'slide--prev', 'slide--next');
      if (i === current) s.classList.add('slide--active');
      else if (i < current) s.classList.add('slide--prev');
      else s.classList.add('slide--next');
    }
    counter.textContent = (current + 1) + ' / ' + total;
    progress.style.width = ((current + 1) / total * 100) + '%';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    var h = Math.ceil(1080 * scale);
    try { window.parent.postMessage({ type: 'html-viewer-height', height: h }, '*'); } catch(e) {}
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      e.preventDefault(); show(current + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
      e.preventDefault(); show(current - 1);
    }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(total - 1); }
    if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });

  var startX = 0, startY = 0;
  document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - startX;
    var dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });

  prevBtn.addEventListener('click', function() { show(current - 1); });
  nextBtn.addEventListener('click', function() { show(current + 1); });

  function resize() {
    var deck = document.getElementById('deck');
    var scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    deck.style.transform = 'scale(' + scale + ')';
  }
  window.addEventListener('resize', resize);
  resize();
  // Read ?page=N (1-indexed) from URL — used by the visual review pass to jump directly to a page
  var startPage = parseInt(new URLSearchParams(window.location.search).get('page'), 10);
  show(isNaN(startPage) ? 0 : Math.max(0, startPage - 1));
  document.body.focus();
})();
```
