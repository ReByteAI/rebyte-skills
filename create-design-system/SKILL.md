---
version: 1
name: create-design-system
description: Create a design system or UI kit — visual tokens, typography, color palette, component library, and design principles bundled into a coherent identity. Use when user wants to define a brand, set up styling rules, or build a UI kit before producing artifacts.
user-invocable: true
---

# create-design-system

Define the visual identity for the project before producing artifacts.

## Output
Write `.impeccable.md` at project root with:
- **Aesthetic Direction** — typography, color tokens, spacing scale, motion rules
- **Brand Personality** — voice and tone
- **Design Principles** — 3–5 rules every artifact must follow

Optional companion assets in `.skills/design-systems/<slug>/`: `styles.css`, `templates/*.html`, `fonts/`.

## Rules
- One `.impeccable.md` per project, written once. Bind it; do not regenerate per turn.
- Reference vendored fonts/CSS by relative path under `.skills/design-systems/`.
- Keep tokens machine-readable (CSS custom properties, JSON).
