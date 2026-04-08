# Gallery Engine — Spring Physics & Game Loop

The gallery engine replaces CSS transitions with a spring-physics game loop. Slides are positioned absolutely via `transform: translate3d() scale()`. Two views: **gallery** (thumbnails on dark canvas) and **full** (single slide fills viewport).

## Engine Code

Copy this verbatim into your `<script>` tag:

```javascript
(function() {
  'use strict';

  // ─── Spring Physics ───────────────────────
  var sp = function(v, k, d) {
    return { v: v, t: v, vel: 0, k: k || 180, d: d || 22 };
  };
  var spTick = function(s, dt) {
    var dx = s.v - s.t;
    s.vel += (-s.k * dx - s.d * s.vel) * dt;
    s.v += s.vel * dt;
    return Math.abs(s.vel) > 0.01 || Math.abs(dx) > 0.005;
  };
  var spSnap = function(s, v) { s.v = v; s.t = v; s.vel = 0; };

  // ─── Constants ────────────────────────────
  var SW = 1920, SH = 1080, COLS = 3, GAP = 24;
  var G_TOP = 80, G_SIDE = 60, F_PAD = 60;

  // ─── State ────────────────────────────────
  var mode = 'gallery'; // 'gallery' | 'full'
  var cur = -1, hov = -1;
  var scroll = sp(0, 120, 22);
  var overlaySp = sp(0, 200, 26);
  var counterSp = sp(0, 200, 26);
  var hintSp = hint ? sp(1, 200, 26) : null;
  var running = false, last = 0;

  // ─── DOM ──────────────────────────────────
  var overlay = document.getElementById('gallery-overlay');
  var counter = document.getElementById('gallery-counter');
  var hint = document.getElementById('gallery-hint'); // optional, may not exist
  var navL = document.getElementById('gallery-nav-left');
  var navR = document.getElementById('gallery-nav-right');
  var slideEls = document.querySelectorAll('.slide');
  var total = slideEls.length;

  var nodes = [];
  for (var i = 0; i < total; i++) {
    slideEls[i].dataset.i = i;
    nodes.push({
      el: slideEls[i],
      x: sp(0, 180, 22),
      y: sp(0, 180, 22),
      s: sp(0.2, 180, 22),
      o: sp(1, 220, 26)
    });
  }

  // ─── Layout Calculations ──────────────────
  function thumbW() {
    return Math.min(420, (innerWidth - G_SIDE * 2 - GAP * (COLS - 1)) / COLS);
  }

  function galPos(i) {
    var tw = thumbW();
    var sc = tw / SW;
    var gw = tw * COLS + GAP * (COLS - 1);
    var sx = (innerWidth - gw) / 2;
    return {
      x: sx + (i % COLS) * (tw + GAP),
      y: G_TOP + Math.floor(i / COLS) * (SH * sc + GAP),
      s: sc
    };
  }

  function fullPos() {
    var sc = Math.min((innerWidth - F_PAD * 2) / SW, (innerHeight - F_PAD * 2) / SH);
    return {
      x: (innerWidth - SW * sc) / 2,
      y: (innerHeight - SH * sc) / 2,
      s: sc
    };
  }

  function maxScroll() {
    var tw = thumbW();
    var sc = tw / SW;
    var rows = Math.ceil(total / COLS);
    return Math.max(0, G_TOP + rows * (SH * sc + GAP) - innerHeight + 40);
  }

  // ─── Set Spring Targets ───────────────────
  function setTargets() {
    overlaySp.t = mode === 'full' ? 1 : 0;
    counterSp.t = mode === 'full' ? 1 : 0;
    if (hintSp) hintSp.t = mode === 'full' ? 0 : 1;

    if (mode === 'gallery') {
      for (var i = 0; i < nodes.length; i++) {
        var g = galPos(i);
        nodes[i].x.t = g.x;
        nodes[i].y.t = g.y - scroll.t;
        nodes[i].s.t = i === hov ? g.s * 1.06 : g.s;
        nodes[i].o.t = 1;
      }
    } else {
      var f = fullPos();
      for (var i = 0; i < nodes.length; i++) {
        var dx = (i - cur) * (SW * f.s + 80);
        nodes[i].x.t = f.x + dx;
        nodes[i].y.t = f.y;
        nodes[i].s.t = f.s;
        nodes[i].o.t = Math.abs(i - cur) === 0 ? 1 : Math.abs(i - cur) === 1 ? 0.12 : 0;
      }
    }
  }

  // ─── Game Loop ────────────────────────────
  function tick(ts) {
    var dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    var m = false;

    m |= spTick(scroll, dt);
    m |= spTick(overlaySp, dt);
    m |= spTick(counterSp, dt);
    if (hintSp) m |= spTick(hintSp, dt);

    // Gallery mode: Y tracks scroll continuously
    if (mode === 'gallery') {
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].y.t = galPos(i).y - scroll.v;
      }
    }

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      m |= spTick(n.x, dt);
      m |= spTick(n.y, dt);
      m |= spTick(n.s, dt);
      m |= spTick(n.o, dt);
      n.el.style.transform = 'translate3d(' + n.x.v + 'px,' + n.y.v + 'px,0)scale(' + n.s.v + ')';
      n.el.style.opacity = n.o.v;
      n.el.style.pointerEvents = n.o.v < 0.05 ? 'none' : 'auto';
      n.el.style.zIndex = (mode === 'full' && i === cur) ? 10 : 2;
    }

    // UI elements
    overlay.style.opacity = overlaySp.v * 0.75;
    overlay.style.pointerEvents = overlaySp.v > 0.1 ? 'auto' : 'none';
    counter.style.opacity = counterSp.v;
    if (hint && hintSp) hint.style.opacity = hintSp.v;
    navL.style.opacity = counterSp.v;
    navR.style.opacity = counterSp.v;
    navL.style.pointerEvents = mode === 'full' ? 'auto' : 'none';
    navR.style.pointerEvents = mode === 'full' ? 'auto' : 'none';
    if (mode === 'full') counter.textContent = (cur + 1) + ' / ' + total;

    // Post height to parent (widget iframe)
    try {
      var h = mode === 'gallery'
        ? Math.ceil(G_TOP + Math.ceil(total / COLS) * (SH * thumbW() / SW + GAP) + 40)
        : Math.ceil(SH * fullPos().s + F_PAD * 2);
      window.parent.postMessage({ type: 'html-viewer-height', height: Math.min(h, innerHeight) }, '*');
    } catch(e) {}

    if (m) requestAnimationFrame(tick);
    else running = false;
  }

  function wake() {
    if (!running) { running = true; last = performance.now(); requestAnimationFrame(tick); }
  }

  // ─── Actions ──────────────────────────────
  function enterFull(i) {
    mode = 'full'; cur = i;
    setTargets(); wake();
  }

  function exitFull() {
    mode = 'gallery'; cur = -1;
    setTargets(); wake();
  }

  function navigate(dir) {
    if (mode !== 'full') return;
    var next = cur + dir;
    if (next < 0 || next >= total) return;
    cur = next;
    setTargets(); wake();
  }

  // ─── Events ───────────────────────────────
  // Click / tap
  document.body.addEventListener('click', function(e) {
    if (e.target === navL || e.target === navR) return;
    var sl = e.target.closest('.slide');
    if (mode === 'gallery' && sl) enterFull(+sl.dataset.i);
    else if (mode === 'full' && !sl) exitFull();
  });

  navL.addEventListener('click', function(e) { e.stopPropagation(); navigate(-1); });
  navR.addEventListener('click', function(e) { e.stopPropagation(); navigate(1); });

  // Keyboard
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mode === 'full') exitFull();
    if ((e.key === 'ArrowRight' || e.key === ' ') && mode === 'full') { e.preventDefault(); navigate(1); }
    if (e.key === 'ArrowLeft' && mode === 'full') { e.preventDefault(); navigate(-1); }
    if (e.key === 'f' || e.key === 'F') {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    }
  });

  // Scroll (gallery only)
  document.body.addEventListener('wheel', function(e) {
    if (mode !== 'gallery') return;
    scroll.t = Math.max(0, Math.min(maxScroll(), scroll.t + e.deltaY * 0.8));
    setTargets(); wake();
  }, { passive: true });

  // Hover
  for (var i = 0; i < nodes.length; i++) {
    (function(idx) {
      nodes[idx].el.addEventListener('mouseenter', function() {
        if (mode === 'gallery') { hov = idx; setTargets(); wake(); }
      });
      nodes[idx].el.addEventListener('mouseleave', function() {
        if (hov === idx) { hov = -1; setTargets(); wake(); }
      });
    })(i);
  }

  // Touch swipe
  var tx0 = 0, ty0 = 0;
  document.body.addEventListener('touchstart', function(e) {
    tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY;
  }, { passive: true });
  document.body.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - tx0;
    var dy = e.changedTouches[0].clientY - ty0;
    if (mode === 'full' && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navigate(dx < 0 ? 1 : -1);
    }
  });

  // Resize
  window.addEventListener('resize', function() { setTargets(); wake(); });

  // ─── Init: staggered entrance ─────────────
  for (var i = 0; i < nodes.length; i++) {
    var g = galPos(i);
    spSnap(nodes[i].x, g.x);
    spSnap(nodes[i].y, g.y + 300 + i * 60);
    spSnap(nodes[i].s, g.s);
    spSnap(nodes[i].o, 0);
    nodes[i].y.t = g.y;
    nodes[i].o.t = 1;
  }
  spSnap(overlaySp, 0);
  spSnap(counterSp, 0);
  if (hintSp) spSnap(hintSp, 1);
  wake();
  document.body.focus();
})();
```

## Navigation

### Gallery View (default)
- **Scroll**: mouse wheel / trackpad to scroll through slide thumbnails
- **Hover**: slide scales up slightly (spring-animated)
- **Click**: enter full view for that slide

### Full View
- **Space / Right arrow**: next slide (spring slide-in)
- **Left arrow**: previous slide
- **Escape / click outside**: return to gallery
- **F**: toggle fullscreen
- **Touch swipe**: left/right (50px threshold)
- **On-screen arrows**: left/right navigation buttons

## Required DOM Elements

The engine expects these IDs in the HTML:

```html
<div id="gallery-overlay"></div>
<div id="gallery-counter"></div>
<button id="gallery-nav-left">&#9664;</button>
<button id="gallery-nav-right">&#9654;</button>
```

And slides as:

```html
<div class="slide slide--title">...</div>
<div class="slide slide--content">...</div>
```

**Note:** Slides are `<div>` elements (not `<section>`) with `position: absolute`. The engine manages all positioning — do not set position, transform, or opacity in CSS on `.slide`.
