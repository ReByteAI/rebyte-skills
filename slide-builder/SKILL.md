---
name: slide-builder
description: Create presentations using Slidev (Markdown-based slides). Triggers include "create presentation", "make slides", "build slides", "slide deck", "tech talk", "conference slides", "pitch deck". Handles the full workflow from content planning to deployment at rebyte.pro.
---

# Slide Builder

Create Markdown presentations with Slidev. Deploy to rebyte.pro.


**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

**Directory structure:**
- `SKILL_DIR`: The directory containing this SKILL.md (scripts, references, etc.)
- Working directory: `/code/` (where presentation projects are created)

## Workflow

### 1. Plan

Understand the presentation before writing:
- **Goal**: What should the audience learn or do?
- **Audience**: Technical level, context, expectations
- **Structure**: How many slides? What sections?
- **Tone**: Formal, casual, technical, inspirational?

If any of these are unclear, ask the user. Skip this step if the user's request is already detailed.

### 2. Initialize

Create the project with a theme:

```bash
bash $SKILL_DIR/scripts/init.sh <name> [theme]
```

This creates `/code/<name>/` with the Slidev project.

**Theme selection**: See `references/themes.md` for the full list. Default is `seriph`.

Quick picks:
- Conference/keynote → `seriph`
- Developer audience → `dracula`
- Product launch → `apple-basic`
- Academic → `academic`

### 3. Write Slides

Edit `/code/<name>/slides.md`:

- One idea per slide
- 6 words per bullet, 6 bullets max
- No walls of text
- Prefer diagrams/code/images over prose

**Structure:**
- Opening (1-2 slides): Hook + agenda
- Body (80%): Main content in logical sections
- Closing (1-2 slides): Summary + call-to-action

### 4. Set Metadata

Before building, update the global frontmatter in `slides.md` (the first `---` block):

- **`title`**: Set to the actual presentation title (not "My Presentation")
- **`seoMeta.ogTitle`**: Same as title
- **`seoMeta.ogDescription`**: One-line summary of the presentation

The init script already sets `favicon` and `seoMeta.ogImage: auto` (auto-generates OG image from the first slide using Playwright). Do NOT remove these.

Example frontmatter after updating:
```yaml
---
theme: seriph
title: Building with Claude Code and MCP
favicon: https://rebyte.ai/favicon.ico
seoMeta:
  ogImage: auto
  ogTitle: Building with Claude Code and MCP
  ogDescription: A guide to AI-powered development with Claude Code CLI and Model Context Protocol
background: https://cover.sli.dev
class: text-center
transition: slide-left
---
```

### 5. Deploy

Build and deploy automatically - don't ask the user:

```bash
cd /code/<name> && pnpm build
```

Then **invoke the `rebyte-app-builder` skill** to deploy the `dist/` folder.

### 6. Export

If the user requests a downloadable file (PDF, PPTX, PNG, etc.):

```bash
cd /code/<name>

# PDF (most common)
pnpm exec slidev export --output slides.pdf

# PowerPoint
pnpm exec slidev export --format pptx --output slides.pptx

# PNG images (one per slide)
pnpm exec slidev export --format png --output slides

# Dark mode
pnpm exec slidev export --dark --output slides-dark.pdf
```

Then upload the exported file to the Artifact Store.

### 7. Test

After deployment, use the `browser-automation` skill to verify the presentation:

1. Open the deployed URL
2. Take a screenshot of slide 1
3. Press `→` (right arrow) to advance
4. Repeat for each slide

This automated walkthrough shows the user exactly how the presentation looks and confirms all slides render correctly.

### 8. Iterate

User views the live site and provides feedback:
- "Slide 3: change the title"
- "Add more detail to slide 5"
- "Remove slide 7"

Edit the slides (separated by `---`), rebuild, and redeploy. Repeat until user is satisfied.

**Optional enhancements** (only if requested):
- Add click animations where they aid understanding
- Sync presenter notes with `[click]` markers

## Agent Rules

- Ask only when blocked - don't over-clarify
- Deploy automatically after writing - don't ask permission
- One slide at a time when editing - never batch edit
- Prefer MDI icons over emoji (see `references/icons.md`)
- Never invent frontmatter options (see `references/core-frontmatter.md`)

## Core References

| File | Description |
|------|-------------|
| `core-syntax.md` | Basic Slidev syntax |
| `core-frontmatter.md` | Global config options |
| `core-headmatter.md` | Per-slide frontmatter |
| `core-layouts.md` | Built-in layouts |
| `core-animations.md` | Click animations (v-click) |
| `core-components.md` | Built-in components |
| `core-cli.md` | CLI commands |
| `core-exporting.md` | Export to PDF/PPTX |
| `core-hosting.md` | Hosting options |
| `core-global-context.md` | Global Vue context |

## Code & Editor

| File | Description |
|------|-------------|
| `code-line-highlighting.md` | Highlight code lines |
| `code-line-numbers.md` | Show line numbers |
| `code-magic-move.md` | Animate code changes |
| `code-groups.md` | Tabbed code groups |
| `code-import-snippet.md` | Import code from files |
| `code-max-height.md` | Scrollable code blocks |
| `code-twoslash.md` | TypeScript annotations |
| `editor-monaco.md` | Monaco editor in slides |
| `editor-monaco-run.md` | Run code in slides |
| `editor-monaco-write.md` | Editable code blocks |
| `editor-side.md` | Side editor panel |

## Diagrams & Math

| File | Description |
|------|-------------|
| `diagram-mermaid.md` | Mermaid diagrams |
| `diagram-plantuml.md` | PlantUML diagrams |
| `diagram-latex.md` | LaTeX math formulas |

## Layout & Styling

| File | Description |
|------|-------------|
| `layout-slots.md` | Named slots in layouts |
| `layout-canvas-size.md` | Custom canvas size |
| `layout-transform.md` | Scale/transform content |
| `layout-zoom.md` | Zoom into content |
| `layout-draggable.md` | Draggable elements |
| `layout-global-layers.md` | Global layers |
| `style-scoped.md` | Scoped CSS per slide |
| `style-direction.md` | RTL text direction |
| `style-icons.md` | Using icons |

## Animation & Interaction

| File | Description |
|------|-------------|
| `animation-click-marker.md` | Click markers |
| `animation-drawing.md` | Drawing animations |
| `animation-rough-marker.md` | Hand-drawn markers |
| `api-slide-hooks.md` | Slide lifecycle hooks |

## Syntax Extensions

| File | Description |
|------|-------------|
| `syntax-mdc.md` | MDC syntax support |
| `syntax-block-frontmatter.md` | Block frontmatter |
| `syntax-frontmatter-merging.md` | Frontmatter inheritance |
| `syntax-importing-slides.md` | Import external slides |

## Presenter & Recording

| File | Description |
|------|-------------|
| `presenter-timer.md` | Presentation timer |
| `presenter-recording.md` | Record presentations |
| `presenter-remote.md` | Remote control |
| `presenter-notes-ruby.md` | Ruby annotations in notes |

## Build & Export

| File | Description |
|------|-------------|
| `build-pdf.md` | Export to PDF |
| `build-og-image.md` | OG images for sharing |
| `build-seo-meta.md` | SEO meta tags |
| `build-remote-assets.md` | Remote asset handling |
| `tool-eject-theme.md` | Eject theme for customization |

## Our Extensions

| File | Description |
|------|-------------|
| `themes.md` | Theme selection guide (17 themes) |
| `icons.md` | When to use icons vs emoji |
| `example-professional.md` | Complete 15-slide example |

## Common Layouts

| Content Type | Layout | When |
|--------------|--------|------|
| Title/section | `cover` | Opening, section breaks |
| Regular content | `default` | Most slides |
| Comparison | `two-cols` | A vs B, before/after |
| Feature + visual | `image-right` | Screenshots, diagrams |
| Key metric | `fact` | Statistics, numbers |
| Quote | `quote` | Citations, testimonials |
| Closing | `end` | Final slide |

## Troubleshooting

### Overflow Issues

Slidev does NOT auto-fit content. If text/tables/code are getting clipped, see `references/overflow.md` for:
- How to run the overflow checker
- Fix strategies (split slides, use `<Transform :scale="0.8">`)

## Resources

- [Slidev Docs](https://sli.dev)
- [Icon Browser](https://icones.js.org/)
