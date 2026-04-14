#!/usr/bin/env bash
# Export each slide page as a high-resolution PNG.
# Usage: bash export-pages.sh /code/slides/{slug}/index.html
set -euo pipefail

HTML_FILE="${1:?Usage: export-pages.sh <path-to-index.html>}"
OUT_DIR="$(dirname "$HTML_FILE")"

export AGENT_BROWSER_AUTO_CONNECT=1

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

# Open the deck and set viewport to native slide canvas size
agent-browser open "file://${HTML_FILE}" \
  && agent-browser wait --load load \
  && agent-browser set viewport 1920 1080

# Get total page count and screenshot each
TOTAL=$(agent-browser eval "document.querySelectorAll('section[data-page]').length")

echo "Exporting ${TOTAL} pages to ${OUT_DIR}/"

for (( i=0; i<TOTAL; i++ )); do
  PAGE_NUM=$((i + 1))

  # Toggle active slide: deactivate all, activate current
  agent-browser eval "(() => {
    const slides = document.querySelectorAll('section[data-page]');
    slides.forEach(s => s.classList.remove('slide--active','slide--prev','slide--next'));
    slides[${i}].classList.add('slide--active');
    document.querySelector('.slide-controls')?.style.setProperty('display','none');
    document.querySelector('.slide-progress')?.style.setProperty('display','none');
  })()"

  # Brief pause for fonts/images to settle
  agent-browser wait 300

  # Screenshot the deck container (1920x1080)
  PADDED=$(printf '%02d' "$PAGE_NUM")
  agent-browser screenshot ".deck" "${OUT_DIR}/${PADDED}.png"

  echo "  ${PADDED}.png"
done

echo "Done. ${TOTAL} pages exported to ${OUT_DIR}/"
