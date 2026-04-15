#!/usr/bin/env bash
# Export each slide page as a high-resolution PNG, following the slide
# skill protocol (see references/protocol.md).
#
# Usage: bash export-pages.sh /code/slides/{slug}/index.html
#
# Protocol rules this script enforces:
#   1. PROGRESSIVE DISPLAY — capture first-screen state only. Never click,
#      tap, or simulate input on a slide's content; progressive/click-to-
#      reveal slides must be screenshotted as they initially appear.
#   2. TIMEOUTS — 30 seconds per slide is the budget. Total run aborts if
#      N slides exceed N × 30s wall-clock time.
#   3. EXECUTION — iterate `<section data-page="1..N">` in exact
#      data-page order, one screenshot per section, written as NN.png.
#
# Implementation notes:
#   - CSS transitions + animations are disabled globally via an injected
#     <style> tag so captures never catch a mid-fade frame.
#   - Non-active slides are forced display:none so stacking/overlap is
#     impossible (belt + braces on top of the protocol's slide--active).
#   - Readiness probe checks decoded images, non-zero canvases, and a
#     non-empty active-slide bounding box. Bounded by per-slide budget.
#   - If readiness times out, screenshot is taken anyway. A too-early
#     capture is better than no capture — size + visual validation in
#     CI will flag broken frames.
set -euo pipefail

HTML_FILE="${1:?Usage: export-pages.sh <path-to-index.html>}"
OUT_DIR="$(dirname "$HTML_FILE")"

export AGENT_BROWSER_AUTO_CONNECT=1
# Per-agent-browser-call wait cap. Each slide's readiness poll caps here.
# 30s matches the protocol per-slide budget.
export AGENT_BROWSER_DEFAULT_TIMEOUT="${AGENT_BROWSER_DEFAULT_TIMEOUT:-30000}"

# Ensure Chrome is listening on 9222. Don't trust pgrep — a Chrome
# process can exist without the remote-debugging port being open
# (crashed, different flags, different port). The only reliable test is
# a request to /json/version. If nothing answers, launch Chrome and
# poll until it does.
probe_cdp() { curl -sf -m 1 http://localhost:9222/json/version >/dev/null 2>&1; }

if ! probe_cdp; then
  CHROME_BIN=$(command -v chromium || command -v google-chrome || command -v google-chrome-stable || echo "")
  if [ -z "$CHROME_BIN" ]; then
    echo "Error: no Chrome/Chromium binary found on PATH" >&2
    exit 1
  fi
  "$CHROME_BIN" --remote-debugging-port=9222 --headless --no-sandbox --disable-gpu --disable-dev-shm-usage >/dev/null 2>&1 &
  # Poll up to 30s for the DevTools endpoint to answer. Cold-boot VMs
  # can take noticeably longer than warm ones (fonts, GPU init, etc.).
  for _ in $(seq 1 60); do
    probe_cdp && break
    sleep 0.5
  done
  if ! probe_cdp; then
    echo "Error: Chrome launched but /json/version on 9222 never responded" >&2
    exit 1
  fi
fi

# Connect agent-browser to the live CDP. AGENT_BROWSER_AUTO_CONNECT
# alone can fail after VM resume (daemon lost its session).
agent-browser connect 9222 >/dev/null 2>&1 || true

agent-browser open "file://${HTML_FILE}"
agent-browser wait --load networkidle || agent-browser wait --load load
agent-browser set viewport 1920 1080
agent-browser wait --fn "document.fonts ? document.fonts.status === 'loaded' : true" >/dev/null 2>&1 || true

# Kill transitions + animations and force non-active slides hidden for
# the duration of the export. Survives any deck CSS via !important.
agent-browser eval "(() => {
  let t = document.getElementById('__export_override');
  if (!t) { t = document.createElement('style'); t.id = '__export_override'; document.head.appendChild(t); }
  t.textContent = '*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important}section[data-page]:not(.slide--active){display:none!important}';
})()" >/dev/null

TOTAL=$(agent-browser eval "document.querySelectorAll('section[data-page]').length")
echo "Exporting ${TOTAL} pages to ${OUT_DIR}/"

# Protocol budget: 30s per slide. Shell-side deadline check aborts the
# whole run if we blow through the total — prevents runaway on a broken
# deck. Intended as an upper bound, not a typical-case timer.
PER_SLIDE_BUDGET=30
TOTAL_BUDGET=$(( TOTAL * PER_SLIDE_BUDGET ))
START=$(date +%s)

READY_FN='(() => { const a=document.querySelector("section.slide--active"); if(!a) return false; const imgs=[...a.querySelectorAll("img")]; if(!imgs.every(i=>i.complete && i.naturalWidth>0)) return false; const cs=[...a.querySelectorAll("canvas")]; if(!cs.every(c=>c.width>0 && c.height>0)) return false; const r=a.getBoundingClientRect(); return r.width>100 && r.height>100; })()'

for (( i=1; i<=TOTAL; i++ )); do
  NOW=$(date +%s)
  ELAPSED=$(( NOW - START ))
  if [ "$ELAPSED" -gt "$TOTAL_BUDGET" ]; then
    echo "Error: total budget ${TOTAL_BUDGET}s exceeded at page ${i} — aborting" >&2
    exit 2
  fi

  PADDED=$(printf '%02d' "$i")

  # Select by data-page value, not DOM index — protocol contract.
  # No click / no input simulation: progressive-display slides are
  # captured at first-screen state per Rule 1.
  agent-browser eval "(() => {
    const all = document.querySelectorAll('section[data-page]');
    all.forEach(s => {
      s.classList.remove('slide--active','slide--prev','slide--next');
      s.style.setProperty('display','none','important');
    });
    const target = document.querySelector('section[data-page=\"${i}\"]');
    if (target) {
      target.style.removeProperty('display');
      target.classList.add('slide--active');
      target.scrollIntoView({block:'start',inline:'start'});
    }
    document.querySelector('.slide-controls')?.style.setProperty('display','none');
    document.querySelector('.slide-progress')?.style.setProperty('display','none');
  })()" >/dev/null

  # Bounded readiness poll. On timeout: capture whatever's painted and
  # warn — do NOT click or otherwise touch the slide (Rule 1).
  agent-browser wait --fn "$READY_FN" >/dev/null 2>&1 || \
    echo "  warn: ${PADDED}.png readiness timeout — capturing first-screen state" >&2

  agent-browser screenshot ".deck" "${OUT_DIR}/${PADDED}.png"
  echo "  ${PADDED}.png"
done

echo "Done. ${TOTAL} pages exported to ${OUT_DIR}/ (elapsed $(( $(date +%s) - START ))s, budget ${TOTAL_BUDGET}s)"
