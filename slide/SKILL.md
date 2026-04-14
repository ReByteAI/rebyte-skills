---
name: slide
description: Professional slide creating, polish. The slides app at /code/slides/. Create, iterate, and publish HTML or image decks. Each {slug}/ folder is a deck, the code agent is the app's runtime user.
---

# Slide Skill

`/code/slides/` is an app. Each `{slug}/` is a deck. You are the app's runtime; the user is its user.

## Protocol (the contract)

Every deck must satisfy this. Full details + validation script: `references/protocol.md`.

```
/code/slides/
  .slide                           # Marker file (triggers gallery in frontend)
  {slug}/
    index.html                     # The deck — sections + nav engine
    outline.md                     # Deck outline (kept for re-generation)
    source.{ext}                   # Original input content
    prompts/                       # Per-slide prompts (IMAGE MODE ONLY)
      01-slide-{slug}.md, ...
    01.png, 02.png, ...            # One image per section (zero-padded, REQUIRED)
```

**Invariants:**
- `index.html` has N `<section data-page="1..N">` elements
- `NN.png` exists for every section — no missing, no extra
- After every change: run `scripts/validate-protocol.sh`, output `<rebyte-slide>` tag only if it passes
- Update `/code/INDEX.md` after every create/update/delete

---

## Workflow — New Deck

Copy this checklist and check off items as you complete them:

```
Slide Deck Progress:
- [ ] Step 1: Setup & Analyze
  - [ ] 1.1 Analyze content
  - [ ] 1.2 Check existing
- [ ] Step 2: Confirmation (4-6 questions)
- [ ] Step 3: Generate outline
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts (IMAGE MODE ONLY)
- [ ] Step 6: Review prompts (IMAGE MODE ONLY, conditional)
- [ ] Step 7: Generate slides (BRANCH: html/ or image/)
- [ ] Step 8: Assemble & Validate
- [ ] Step 9: Output
```

### Step 1: Setup & Analyze

**1.1 Analyze Content**

1. Save source content as `/code/slides/{slug}/source.{ext}`
   - If pasted, save as `source.md`
   - If uploaded to `/code/raw/`, copy from there (never modify raw/)
   - **Backup rule**: If `source.{ext}` exists, rename to `source-backup-YYYYMMDD-HHMMSS.{ext}`
2. Determine:
   - **Topic** and slug (2-4 words, kebab-case, max 40 chars, ASCII only)
   - **Audience** (general, beginners, experts, executives)
   - **Language** (from user's input language)
   - **Slide count**:

| Content | Slides |
|---------|--------|
| < 1000 words | 5-10 |
| 1000-3000 words | 10-18 |
| 3000-5000 words | 15-25 |
| > 5000 words | 20-30 |

3. Analyze content signals for style recommendation (see Auto Style Selection tables below)

**1.2 Check Existing Content**

```bash
test -d "/code/slides/{slug}" && echo "exists"
```

**If exists**, ask user:
```
header: "Existing"
question: "Existing content found. How to proceed?"
options:
  - label: "Regenerate all"
    description: "Backup existing, regenerate from scratch"
  - label: "Regenerate images only"
    description: "Keep outline, regenerate slides"
  - label: "Exit"
    description: "Cancel, keep existing"
```

### Step 2: Confirmation

**Language**: Use user's input language for all questions and responses.

**Display summary** before asking:
- Content type + topic identified
- Recommended style + slide count

#### Q1: Render Mode

```
header: "Mode"
question: "How should slides be rendered?"
options:
  - label: "HTML (Recommended)"
    description: "Rich HTML with pixel-perfect text, editable elements"
  - label: "Image"
    description: "Each slide is a generated image — artistic styles, visual storytelling"
```

#### Q2: Style

**If HTML selected:**
```
header: "Style"
question: "Which aesthetic?"
options:
  - label: "editorial"
    description: "Serif, generous whitespace, earth tones + gold"
  - label: "blueprint"
    description: "Technical drawing, slate/blue palette"
  - label: "paper-ink"
    description: "Warm cream, terracotta/sage"
  - label: "warm"
    description: "Peach/cream, friendly"
  - label: "mono-terminal"
    description: "Green/amber on dark, CRT feel"
```
Full aesthetic list: `html/html-slides.md`

**If Image selected:**
```
header: "Style"
question: "Which visual style?"
options:
  - label: "{recommended_preset} (Recommended)"
    description: "Best match based on content analysis"
  - label: "{alternative_preset}"
    description: "[description]"
  - label: "Custom dimensions"
    description: "Choose texture, mood, typography, density separately"
```

Auto Style Selection (Image mode):

| Content Signals | Preset |
|-----------------|--------|
| tutorial, learn, education, guide | `sketch-notes` |
| hand-drawn, infographic, diagram | `hand-drawn-edu` |
| architecture, system, technical | `blueprint` |
| investor, business, corporate | `corporate` |
| executive, minimal, clean | `minimal` |
| launch, marketing, keynote | `bold-editorial` |
| entertainment, gaming | `dark-atmospheric` |
| explainer, science communication | `editorial-infographic` |
| gaming, retro, pixel | `pixel-art` |
| biology, chemistry, medical | `scientific` |
| history, heritage, vintage | `vintage` |
| lifestyle, wellness, artistic | `watercolor` |
| Default | `blueprint` |

Full preset specs: `image/styles/*.md`. Dimensions: `image/dimensions/*.md`.

**If "Custom dimensions" selected** → Round 2 (4 questions for texture, mood, typography, density). See `image/how-to.md` for the full custom dimension question templates.

#### Q3: Audience

```
header: "Audience"
question: "Who is the primary reader?"
options:
  - label: "General readers (Recommended)"
  - label: "Beginners/learners"
  - label: "Experts/professionals"
  - label: "Executives"
```

#### Q4: Slide Count

```
header: "Slides"
question: "How many slides?"
options:
  - label: "{N} slides (Recommended)"
  - label: "Fewer ({N-3} slides)"
  - label: "More ({N+3} slides)"
```

#### Q5: Review Outline

```
header: "Outline"
question: "Review outline before generation?"
options:
  - label: "Yes, review outline (Recommended)"
  - label: "No, skip outline review"
```

#### Q6: Review Prompts (IMAGE MODE ONLY — skip for HTML)

```
header: "Prompts"
question: "Review prompts before generating images?"
options:
  - label: "Yes, review prompts (Recommended)"
  - label: "No, skip prompt review"
```

**After confirmation**: Store render mode, style, audience, slide count, review flags.

### Step 3: Generate Outline

Save as `/code/slides/{slug}/outline.md`:

```markdown
# Deck Outline: {Title}

**Slug**: {slug}
**Render**: html | image
**Style**: {aesthetic or preset name}
**Slides**: N
**Audience**: {audience}
**Language**: {language}

---

## Slide 1 of N
**Type**: cover
**Headline**: {main title}
**Sub-headline**: {tagline}
**Visual**: {description of imagery}

---

## Slide 2 of N
**Type**: content
**Headline**: {slide heading}
**Points**:
- {point 1}
- {point 2}
- {point 3}
**Visual**: {description}
**Layout**: bullets | two-col | stat | quote | code
```

**Image mode**: also build `<STYLE_INSTRUCTIONS>` block from style/dimensions. See `image/how-to.md` for STYLE_INSTRUCTIONS format and `image/outline-template.md` for the full template.

**After generation**: If `skip_outline_review` → skip Step 4.

### Step 4: Review Outline (conditional)

Show slide-by-slide summary table. Ask:
```
header: "Confirm"
question: "Ready to proceed?"
options:
  - label: "Yes, proceed (Recommended)"
  - label: "Edit outline first"
  - label: "Regenerate outline"
```

### Step 5: Generate Prompts (IMAGE MODE ONLY)

HTML mode skips this step — the outline is the spec, HTML itself is the artifact.

For image mode:
1. Read `image/base-prompt.md` for the prompt template
2. For each slide: build prompt from STYLE_INSTRUCTIONS + slide content + layout guidance from `image/layouts.md`
3. Save to `/code/slides/{slug}/prompts/01-slide-{slug}.md`, etc.

**After generation**: If `skip_prompt_review` → skip Step 6.

### Step 6: Review Prompts (IMAGE MODE ONLY, conditional)

Show prompt list. Ask same confirm/edit/regenerate question.

### Step 7: Generate Slides — THE BRANCH POINT

**IF HTML** → Read `html/html-slides.md`. Generate `<section>` elements with:
- Correct aesthetic + font (from `html/html-slides.md`)
- CSS variables (never hardcode colors)
- `data-page` and `data-bp-id` attributes
- Slide types: `slide--title`, `slide--content`, `slide--stat`, `slide--quote`, etc.
- Run DOM Lint Pass after generation (see `html/html-slides.md`)

**IF Image** → Read `image/how-to.md`. For each slide:
1. Generate image via nano-banana (see `references/nano-banana.md`)
   - `aspectRatio`: `"16:9"` (always)
   - `model`: `"flash"` for iteration/previews, `"pro"` for final output
   - `imageSize`: `"1K"` default, `"2K"` for high-res final exports
2. Save as `/code/slides/{slug}/NN.png`
3. Auto-retry once on failure. If second attempt fails, continue remaining slides.
4. Report progress: "Generated X/N"

### Step 8: Assemble & Validate

**Both modes**: Build `index.html` using shared template (`references/slide-template.md`) and nav engine (`references/css-patterns.md`).

**HTML mode**: Sections already contain rich HTML. Run `scripts/export-pages.sh` to screenshot each section as `NN.png`.

**Image mode**: Wrap each image in a thin section:
```html
<section class="slide slide--image" data-page="N">
  <img data-bp-id="img-N" crossorigin="anonymous"
       src="data:image/png;base64,{base64}"
       alt="Slide N: {headline}"
       style="width:100%;height:100%;object-fit:contain;display:block;" />
</section>
```

**Cleanup**: If deck went from M to N slides (N < M), delete stale `(N+1).png` through `M.png`.

**Validate**: Run `scripts/validate-protocol.sh /code/slides/{slug}/index.html`. MUST pass. Do NOT emit `<rebyte-slide>` if it fails.

**Create `.slide` marker** if not exists: `touch /code/slides/.slide`

### Step 9: Output

```
<rebyte-slide path="/code/slides/{slug}/index.html" pages="N" title="{title}" />
```

Update `/code/INDEX.md` with deck info and last-updated date.

Summary in user's language:
```
Deck complete: "{Title}" — {N} slides ({render mode})
Location: /code/slides/{slug}/
```

---

## Workflow — Edit Existing Deck

Skip the outline. Go straight to surgical edit.

```
├── [editing ...] anchor present     → User is viewing a deck, edit it
├── [selected ... bp=X page=N]       → Edit that specific element
├── "add a slide about X"            → Append a <section> to the open deck
├── "regenerate slide 3"             → Re-render that page
└── Ambiguous + multiple decks       → Ask with <rebyte-slide> cards
```

**Mode detection**: Check `index.html` for `slide--image` class → image mode. Otherwise → HTML. If `outline.md` has `Render:` field, use that. Fallback: HTML.

**HTML edits**: by `data-bp-id`, preserve all attributes. See `references/editing.md`.
**Image edits**: update prompt in `prompts/`, regenerate via nano-banana, replace `NN.png`. See `image/how-to.md` "Slide Modification" section.
**Image partial workflows**: `--regenerate N`, `--images-only`. See `image/how-to.md`.

After ANY edit: run `scripts/export-pages.sh` (HTML) or replace PNG (image) → run `scripts/validate-protocol.sh` → output `<rebyte-slide>` only if valid.

---

## Language Handling

ALL responses use user's preferred language (questions, confirmations, progress, errors, summaries). Technical terms (style names, file paths, code) remain in English.

Detection priority: user's conversation language > outline language field > source content language.

---

## All Files (complete reference)

Every file in this skill, with path from this SKILL.md:

### Shared (`references/`)

| Path | What |
|------|------|
| `references/protocol.md` | The contract: file layout, invariants, validation script, `<rebyte-slide>` tag |
| `references/css-patterns.md` | Slide engine CSS, transitions, controls, nav JS — every index.html |
| `references/slide-template.md` | Base HTML template for index.html |
| `references/nano-banana.md` | Image generation API: auth, models, parameters, saving |
| `references/editing.md` | Selection anchors, bp-id editing, visual magic layer |
| `references/gallery-engine.md` | Gallery view engine (spring physics) |
| `references/deploy.md` | How to deploy as standalone URL |

### Scripts (`scripts/`)

| Path | What |
|------|------|
| `scripts/validate-protocol.sh` | Protocol enforcement — run after every generation |
| `scripts/export-pages.sh` | HTML → PNG screenshots (Chrome CDP) |
| `scripts/build-viewer.sh` | Build standalone viewer |

### HTML path (`html/`)

| Path | What |
|------|------|
| `html/html-slides.md` | Aesthetics, fonts, CSS variables, slide types, typography, design rules, quality gates, DOM Lint Pass, blueprint attributes, images (CDN upload) |

### Image path (`image/`)

| Path | What |
|------|------|
| `image/how-to.md` | Image generation guide: style system, presets, auto-selection, design philosophy, prompt engineering, partial workflows, slide modification |
| `image/base-prompt.md` | Base prompt template for nano-banana slide generation |
| `image/outline-template.md` | Outline structure with STYLE_INSTRUCTIONS block |
| `image/layouts.md` | Layout options and selection tips for image slides |
| `image/design-guidelines.md` | Audience, typography, color, visual element guidelines |
| `image/content-rules.md` | Content and style guidelines |
| `image/analysis-framework.md` | Content analysis for presentations |
| `image/modification-guide.md` | Edit, add, delete slide workflows |
| `image/config/preferences-schema.md` | EXTEND.md structure (optional user preferences) |
| `image/dimensions/presets.md` | Preset → dimension mapping (17 presets) |
| `image/dimensions/density.md` | Density dimension spec |
| `image/dimensions/mood.md` | Mood dimension spec |
| `image/dimensions/texture.md` | Texture dimension spec |
| `image/dimensions/typography.md` | Typography dimension spec |
| `image/styles/blueprint.md` | Blueprint preset spec |
| `image/styles/bold-editorial.md` | Bold Editorial preset spec |
| `image/styles/chalkboard.md` | Chalkboard preset spec |
| `image/styles/corporate.md` | Corporate preset spec |
| `image/styles/dark-atmospheric.md` | Dark Atmospheric preset spec |
| `image/styles/editorial-infographic.md` | Editorial Infographic preset spec |
| `image/styles/fantasy-animation.md` | Fantasy Animation preset spec |
| `image/styles/hand-drawn-edu.md` | Hand-Drawn Edu preset spec |
| `image/styles/intuition-machine.md` | Intuition Machine preset spec |
| `image/styles/minimal.md` | Minimal preset spec |
| `image/styles/notion.md` | Notion preset spec |
| `image/styles/pixel-art.md` | Pixel Art preset spec |
| `image/styles/scientific.md` | Scientific preset spec |
| `image/styles/sketch-notes.md` | Sketch Notes preset spec |
| `image/styles/vector-illustration.md` | Vector Illustration preset spec |
| `image/styles/vintage.md` | Vintage preset spec |
| `image/styles/watercolor.md` | Watercolor preset spec |
| `image/merge-to-pptx.ts` | Merge slides into PowerPoint (bun script) |
| `image/merge-to-pdf.ts` | Merge slides into PDF (bun script) |

---

## Publish

When the user is satisfied:
- **Deploy:** `rebyte deploy` from `/code/slides/{slug}/` → shareable URL
- **Download:** user grabs the file directly
- **Fullscreen:** open in new browser tab

Record published URLs in `/code/output/`.
