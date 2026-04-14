#!/usr/bin/env bash
# Build the presentation viewer (index.html) from individual slide files.
# Usage: bash build-viewer.sh /code/<project-name>
set -euo pipefail

PROJECT_DIR="${1:?Usage: build-viewer.sh <project-dir>}"
SLIDES_DIR="$PROJECT_DIR/slides"

if [ ! -d "$SLIDES_DIR" ]; then
  echo "Error: $SLIDES_DIR does not exist" >&2
  exit 1
fi

# Collect slide files in order
SLIDE_FILES=($(ls "$SLIDES_DIR"/slide-*.html 2>/dev/null | sort))

if [ ${#SLIDE_FILES[@]} -eq 0 ]; then
  echo "Error: No slide-*.html files found in $SLIDES_DIR" >&2
  exit 1
fi

TOTAL=${#SLIDE_FILES[@]}

# Build the slide list for JS
SLIDE_LIST=""
for f in "${SLIDE_FILES[@]}"; do
  NAME=$(basename "$f")
  SLIDE_LIST="${SLIDE_LIST}    'slides/${NAME}',
"
done

cat > "$PROJECT_DIR/index.html" << 'VIEWER_EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Presentation</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: -apple-system, sans-serif; }

.viewer {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}

.slide-container {
  position: relative;
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
}

.slide-container iframe {
  border: none; background: #fff;
  transform-origin: center center;
}

.controls {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 16px;
  background: rgba(0,0,0,0.7); backdrop-filter: blur(12px);
  border-radius: 40px; padding: 8px 24px;
  z-index: 100; opacity: 0; transition: opacity 0.3s;
  user-select: none;
}
body:hover .controls, .controls:focus-within { opacity: 1; }

.controls button {
  background: none; border: none; color: #fff; cursor: pointer;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; transition: background 0.15s;
}
.controls button:hover { background: rgba(255,255,255,0.15); }
.controls button:disabled { opacity: 0.3; cursor: default; }
.controls button:disabled:hover { background: none; }

.counter {
  color: rgba(255,255,255,0.7); font-size: 14px;
  font-variant-numeric: tabular-nums; min-width: 60px; text-align: center;
}
</style>
</head>
<body>
<div class="viewer">
  <div class="slide-container" id="container">
    <iframe id="slide-frame" sandbox="allow-same-origin"></iframe>
  </div>
</div>

<div class="controls">
  <button id="prev" title="Previous (←)">◀</button>
  <span class="counter" id="counter">1 / 1</span>
  <button id="next" title="Next (→)">▶</button>
  <button id="fullscreen" title="Fullscreen (F)">⛶</button>
</div>

<script>
VIEWER_EOF

# Inject the slide list
echo "const SLIDES = [" >> "$PROJECT_DIR/index.html"
echo "$SLIDE_LIST" >> "$PROJECT_DIR/index.html"
echo "];" >> "$PROJECT_DIR/index.html"

cat >> "$PROJECT_DIR/index.html" << 'VIEWER_JS'
const SLIDE_W = 1920;
const SLIDE_H = 1080;
let current = 0;

const frame = document.getElementById('slide-frame');
const counter = document.getElementById('counter');
const container = document.getElementById('container');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const fsBtn = document.getElementById('fullscreen');

function showSlide(index) {
  current = Math.max(0, Math.min(index, SLIDES.length - 1));
  frame.src = SLIDES[current];
  counter.textContent = `${current + 1} / ${SLIDES.length}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === SLIDES.length - 1;
}

function resize() {
  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const scale = Math.min(cw / SLIDE_W, ch / SLIDE_H);
  frame.style.width = SLIDE_W + 'px';
  frame.style.height = SLIDE_H + 'px';
  frame.style.transform = `scale(${scale})`;
}

prevBtn.addEventListener('click', () => showSlide(current - 1));
nextBtn.addEventListener('click', () => showSlide(current + 1));
fsBtn.addEventListener('click', () => {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); showSlide(current + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); showSlide(current - 1); }
  if (e.key === 'Home') { e.preventDefault(); showSlide(0); }
  if (e.key === 'End') { e.preventDefault(); showSlide(SLIDES.length - 1); }
  if (e.key === 'f' || e.key === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }
});

window.addEventListener('resize', resize);
resize();
showSlide(0);
</script>
</body>
</html>
VIEWER_JS

echo "Built viewer: $PROJECT_DIR/index.html ($TOTAL slides)"
