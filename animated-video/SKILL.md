---
version: 1
name: animated-video
description: Timeline-based motion design — produce short looping or narrative animations. Use when user asks for an animated explainer, intro/outro, kinetic typography, or motion graphic. Output is a self-contained HTML file with CSS/JS keyframes or a Remotion/Lottie composition.
user-invocable: true
---

# animated-video

Build a short animated piece that runs in the browser without external runtime.

## Default form
- Single HTML file with inline CSS keyframes / WAAPI / requestAnimationFrame
- 1080×1080 or 16:9 stage, target ≤30s, ≤60fps
- All assets inlined or fetched from public artifact URLs (no relative paths)

## Structure
1. Stage container with fixed aspect ratio
2. Layered scenes (intro / hold / outro)
3. Easing curves chosen for purpose, not novelty (overuse of bounce = AI slop)

## Verification
- Loops cleanly if requested as loop
- Plays in Chrome + Safari without console errors
- Pauses on `prefers-reduced-motion: reduce`
