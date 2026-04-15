#!/usr/bin/env bash
# Export each slide page as a high-resolution PNG.
# Usage: bash export-pages.sh /code/slides/{slug}/index.html
#
# Readiness contract per slide:
#   1. Mark it .slide--active, hide nav chrome
#   2. Poll a readiness probe — active slide has size, images decoded,
#      canvases have dimensions. Bounded by AGENT_BROWSER_DEFAULT_TIMEOUT.
#   3. If readiness still false, click the slide to kick interaction-gated
#      animations / IntersectionObserver / lazy renderers. Poll again.
#   4. Screenshot.
#
# This replaces a fixed 300ms sleep that was losing every race on heavy
# slides (images, charts, web fonts). Agents were then retrying
# export-pages.sh 20+ times per deck. Now the wait is real and bounded.
set -euo pipefail

HTML_FILE="${1:?Usage: export-pages.sh <path-to-index.html>}"
OUT_DIR="$(dirname "$HTML_FILE")"

export AGENT_BROWSER_AUTO_CONNECT=1
# Per-action wait cap. `wait --fn` uses this as its polling timeout.
export AGENT_BROWSER_DEFAULT_TIMEOUT="${AGENT_BROWSER_DEFAULT_TIMEOUT:-8000}"

# Ensure Chrome is running
if ! pgrep -f chromium > /dev/null 2>&1 && ! pgrep -f chrome > /dev/null 2>&1; then
  CHROME_BIN=$(command -v chromium || command -v google-chrome || command -v google-chrome-stable || echo "")
  if [ -z "$CHROME_BIN" ]; then
    echo "Error: no Chrome/Chromium found" >&2
    exit 1
  fi
  "$CHROME_BIN" --remote-debugging-port=9222 --headless --no-sandbox --disable-gpu &
  sleep 2
fi

# Open the deck, let network settle, force fonts to load once.
agent-browser open "file://${HTML_FILE}"
agent-browser wait --load networkidle || agent-browser wait --load load
agent-browser set viewport 1920 1080
agent-browser eval "document.fonts && document.fonts.ready" >/dev/null 2>&1 || true
agent-browser wait --fn "document.fonts ? document.fonts.status === 'loaded' : true" >/dev/null 2>&1 || true

TOTAL=$(agent-browser eval "document.querySelectorAll('section[data-page]').length")

echo "Exporting ${TOTAL} pages to ${OUT_DIR}/"

# Readiness probe — runs in the browser. Returns true when the currently
# active slide looks fully painted: images decoded, deck container has
# real size, canvases have dimensions.
READY_FN='(() => { const a=document.querySelector("section.slide--active"); if(!a) return false; const imgs=[...a.querySelectorAll("img")]; if(!imgs.every(i=>i.complete && i.naturalWidth>0)) return false; const cs=[...a.querySelectorAll("canvas")]; if(!cs.every(c=>c.width>0 && c.height>0)) return false; const r=a.getBoundingClientRect(); return r.width>100 && r.height>100; })()'

for (( i=0; i<TOTAL; i++ )); do
  PAGE_NUM=$((i + 1))
  PADDED=$(printf '%02d' "$PAGE_NUM")

  # Activate this slide, deactivate all others, hide chrome.
  agent-browser eval "(() => {
    const slides = document.querySelectorAll('section[data-page]');
    slides.forEach(s => s.classList.remove('slide--active','slide--prev','slide--next'));
    slides[${i}].classList.add('slide--active');
    slides[${i}].scrollIntoView({block:'start',inline:'start'});
    document.querySelector('.slide-controls')?.style.setProperty('display','none');
    document.querySelector('.slide-progress')?.style.setProperty('display','none');
  })()" >/dev/null

  # First pass: bounded poll for readiness.
  if ! agent-browser wait --fn "$READY_FN" >/dev/null 2>&1; then
    # Kick interaction-gated renderers (animations paused until user
    # interaction, IntersectionObserver hold-until-touched, etc.) and
    # poll again with a fresh budget.
    agent-browser click "section.slide--active" >/dev/null 2>&1 || true
    agent-browser wait --fn "$READY_FN" >/dev/null 2>&1 || \
      echo "  warn: ${PADDED}.png readiness timeout — capturing anyway" >&2
  fi

  agent-browser screenshot ".deck" "${OUT_DIR}/${PADDED}.png"
  echo "  ${PADDED}.png"
done

echo "Done. ${TOTAL} pages exported to ${OUT_DIR}/"
