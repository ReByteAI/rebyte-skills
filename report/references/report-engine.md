# Report Engine — Pretext Hero Layout

The report engine loads Pretext from CDN and lays out the hero section text with obstacle routing. It runs once on `DOMContentLoaded` and re-runs on resize.

## Engine Code

Copy this verbatim into your `<script>` tag:

```javascript
(function() {
  'use strict';

  var hero = document.querySelector('.report-hero');
  if (!hero) return;

  var heroStyle = hero.getAttribute('data-hero-style') || 'none';
  if (heroStyle === 'none') return;

  var heroText = hero.querySelector('.hero-text');
  if (!heroText) return;

  var text = heroText.textContent || '';
  if (!text.trim()) return;

  // Find the obstacle element
  var obstacle = null;
  if (heroStyle === 'wrap-circle') {
    obstacle = hero.querySelector('.hero-decoration');
  } else if (heroStyle === 'wrap-image') {
    obstacle = hero.querySelector('.hero-image');
  } else if (heroStyle === 'drop-cap') {
    obstacle = null; // handled separately
  }

  // Container for positioned lines
  var lineContainer = document.createElement('div');
  lineContainer.className = 'pretext-lines';
  lineContainer.style.position = 'static';

  var loaded = false;
  var pretextModule = null;
  var prepared = null;

  // Read font from computed style
  function getFont(el, sizeOverride) {
    var cs = window.getComputedStyle(el);
    var size = sizeOverride || cs.fontSize;
    var weight = cs.fontWeight;
    var family = cs.fontFamily;
    return weight + ' ' + size + ' ' + family;
  }

  // Get obstacle rect relative to hero
  function getObstacleRect() {
    if (!obstacle) return null;
    var heroRect = hero.getBoundingClientRect();
    var obsRect = obstacle.getBoundingClientRect();
    return {
      left: obsRect.left - heroRect.left,
      top: obsRect.top - heroRect.top,
      right: obsRect.right - heroRect.left,
      bottom: obsRect.bottom - heroRect.top,
      width: obsRect.width,
      height: obsRect.height
    };
  }

  // Calculate the starting Y position for text layout
  function getTextStartY() {
    var heroRect = hero.getBoundingClientRect();
    var byline = hero.querySelector('.byline');
    var anchor = byline || hero.querySelector('h1');
    if (anchor) {
      var anchorRect = anchor.getBoundingClientRect();
      return anchorRect.bottom - heroRect.top + 24;
    }
    return 160;
  }

  // Layout hero text with Pretext
  function layoutHero() {
    if (!loaded || !pretextModule || !prepared) return;

    var layoutNextLine = pretextModule.layoutNextLine;

    // Clear previous lines
    lineContainer.innerHTML = '';

    var heroRect = hero.getBoundingClientRect();
    var heroWidth = hero.offsetWidth;
    var lineHeight = 34; // 20px font * 1.7 line-height
    var textStartY = getTextStartY();
    var obsRect = getObstacleRect();
    var dropCapSize = 0;
    var dropCapLines = 0;

    // Drop cap setup
    if (heroStyle === 'drop-cap' && text.length > 0) {
      dropCapSize = 96;
      dropCapLines = 3;
      var dropCapEl = document.createElement('span');
      dropCapEl.className = 'pretext-line';
      dropCapEl.textContent = text.charAt(0);
      dropCapEl.style.fontSize = dropCapSize + 'px';
      dropCapEl.style.lineHeight = '0.85';
      dropCapEl.style.fontWeight = '400';
      dropCapEl.style.color = 'var(--widget-accent-fg)';
      dropCapEl.style.left = '0px';
      dropCapEl.style.top = textStartY + 'px';
      lineContainer.appendChild(dropCapEl);
    }

    // Prepare the text (skip first char if drop cap)
    var layoutText = heroStyle === 'drop-cap' ? text.slice(1) : text;
    if (heroStyle === 'drop-cap' && prepared.fullText !== layoutText) {
      prepared = pretextModule.prepareWithSegments(layoutText, getFont(heroText));
    }

    var cursor = { segmentIndex: 0, graphemeIndex: 0 };
    var lineTop = textStartY;
    var padding = 16; // padding around obstacle
    var maxY = textStartY + 800; // safety limit
    var lineIndex = 0;

    while (lineTop < maxY) {
      var bandTop = lineTop;
      var bandBottom = lineTop + lineHeight;
      var lineLeft = 0;
      var maxWidth = heroWidth;

      // Check obstacle overlap
      if (obsRect && bandBottom > obsRect.top - padding && bandTop < obsRect.bottom + padding) {
        // Text is to the left of the obstacle
        maxWidth = obsRect.left - padding;
        if (maxWidth < 100) {
          // Not enough space to the left, skip this line
          lineTop += lineHeight;
          continue;
        }
      }

      // Drop cap indentation for first N lines
      if (heroStyle === 'drop-cap' && lineIndex < dropCapLines) {
        var indent = dropCapSize * 0.65 + 12;
        lineLeft = indent;
        maxWidth = maxWidth - indent;
      }

      var line = layoutNextLine(prepared, cursor, maxWidth);
      if (line === null) break;

      var span = document.createElement('span');
      span.className = 'pretext-line';
      span.textContent = line.text;
      span.style.font = getFont(heroText);
      span.style.left = lineLeft + 'px';
      span.style.top = lineTop + 'px';
      span.style.width = maxWidth + 'px';
      lineContainer.appendChild(span);

      cursor = line.end;
      lineTop += lineHeight;
      lineIndex++;
    }

    // Set hero height and mark as active
    var totalHeight = lineTop + 20;
    hero.style.setProperty('--hero-computed-height', totalHeight + 'px');
    hero.setAttribute('data-pretext-active', 'true');

    // Insert line container if not already there
    if (!lineContainer.parentNode) {
      hero.appendChild(lineContainer);
    }

    // Report height
    var h = Math.min(document.body.scrollHeight, 8000);
    try { window.parent.postMessage({ type: 'html-viewer-height', height: h }, '*'); } catch(e) {}
  }

  // Load Pretext and run layout
  async function init() {
    try {
      pretextModule = await import('https://cdn.jsdelivr.net/npm/@chenglou/pretext@0.0.3/dist/layout.js');
      var font = getFont(heroText);
      var layoutText = heroStyle === 'drop-cap' ? text.slice(1) : text;
      prepared = pretextModule.prepareWithSegments(layoutText, font);
      loaded = true;
      layoutHero();
    } catch (e) {
      // Pretext failed to load — hero text stays as normal CSS flow
      console.warn('Pretext load failed, falling back to CSS flow:', e);
    }
  }

  // Debounced resize handler
  var resizeTimer = null;
  window.addEventListener('resize', function() {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (loaded) {
        // Re-prepare with potentially new font metrics
        var font = getFont(heroText);
        var layoutText = heroStyle === 'drop-cap' ? text.slice(1) : text;
        prepared = pretextModule.prepareWithSegments(layoutText, font);
        layoutHero();
      }
    }, 150);
  });

  // Wait for fonts to load before measuring
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    // Fallback: init after short delay
    setTimeout(init, 200);
  }
})();
```
