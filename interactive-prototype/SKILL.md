---
version: 1
name: interactive-prototype
description: Working app prototype with real interactions — clickable, navigable, with stateful UI. Not a wireframe, not a slide deck. Use when user asks for a prototype, demo app, clickable mockup, or interactive concept. Output is a self-contained HTML/JS app exercising the happy path plus a few key edge cases.
user-invocable: true
---

# interactive-prototype

Build a runnable prototype, not a static mockup.

## Default form
- Single HTML file (or app builder deploy) with real DOM events
- All buttons respond, forms validate, navigation works
- Mock data inline; no real backend unless asked

## Structure
1. Routing/state (hash-based or simple SPA)
2. At least one happy-path flow end-to-end
3. Empty/loading/error states for each list or fetch
4. Keyboard support on primary CTA

## When not to use
Use `make-a-deck` for narrative slides, `one-pager` for flat docs, `wireframe` for low-fi exploration.
