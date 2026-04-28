# Image Slide Generation

How to generate entire slides as images via nano-banana. Each slide is one 16:9 image — text, icons, diagrams, background, everything baked into a single PNG.

**This file is called from Step 7 of the main workflow in SKILL.md.** The workflow (outline, confirmation, review gates) lives there. This file covers only: style system, prompt engineering, image generation, and slide modification.

## Style System

### Presets (17)

| Preset | Dimensions | Best For |
|--------|------------|----------|
| `blueprint` (Default) | grid + cool + technical + balanced | Architecture, system design |
| `chalkboard` | organic + warm + handwritten + balanced | Education, tutorials |
| `corporate` | clean + professional + geometric + balanced | Investor decks, proposals |
| `minimal` | clean + neutral + geometric + minimal | Executive briefings |
| `sketch-notes` | organic + warm + handwritten + balanced | Educational, tutorials |
| `hand-drawn-edu` | organic + macaron + handwritten + balanced | Educational diagrams |
| `watercolor` | organic + warm + humanist + minimal | Lifestyle, wellness |
| `dark-atmospheric` | clean + dark + editorial + balanced | Entertainment, gaming |
| `notion` | clean + neutral + geometric + dense | Product demos, SaaS |
| `bold-editorial` | clean + vibrant + editorial + balanced | Product launches, keynotes |
| `editorial-infographic` | clean + cool + editorial + dense | Tech explainers |
| `fantasy-animation` | organic + vibrant + handwritten + minimal | Educational storytelling |
| `intuition-machine` | clean + cool + technical + dense | Technical docs, academic |
| `pixel-art` | pixel + vibrant + technical + balanced | Gaming, developer talks |
| `scientific` | clean + cool + technical + dense | Biology, chemistry, medical |
| `vector-illustration` | clean + vibrant + humanist + balanced | Creative, children's content |
| `vintage` | paper + warm + editorial + balanced | Historical, heritage |
| `watercolor-sketch` | clean + cool + handwritten + balanced | Product design, engineering workflows |

Full preset specs: `styles/*.md`

### Dimensions

| Dimension | Options | Description |
|-----------|---------|-------------|
| **Texture** | clean, grid, organic, pixel, paper | Visual texture and background treatment |
| **Mood** | professional, warm, cool, vibrant, dark, neutral, macaron | Color temperature and palette |
| **Typography** | geometric, humanist, handwritten, editorial, technical | Headline and body text styling |
| **Density** | minimal, balanced, dense | Information density per slide |

Full dimension specs: `dimensions/*.md`. Preset→dimension mapping: `dimensions/presets.md`.

### Auto Style Selection

| Content Signals | Preset |
|-----------------|--------|
| tutorial, learn, education, guide, beginner | `sketch-notes` |
| hand-drawn, infographic, diagram, process, onboarding | `hand-drawn-edu` |
| classroom, teaching, school, chalkboard | `chalkboard` |
| architecture, system, data, analysis, technical | `blueprint` |
| creative, children, kids, cute | `vector-illustration` |
| briefing, academic, research, bilingual | `intuition-machine` |
| executive, minimal, clean, simple | `minimal` |
| saas, product, dashboard, metrics | `notion` |
| investor, quarterly, business, corporate | `corporate` |
| launch, marketing, keynote, magazine | `bold-editorial` |
| entertainment, music, gaming, atmospheric | `dark-atmospheric` |
| explainer, journalism, science communication | `editorial-infographic` |
| story, fantasy, animation, magical | `fantasy-animation` |
| gaming, retro, pixel, developer | `pixel-art` |
| biology, chemistry, medical, scientific | `scientific` |
| history, heritage, vintage, expedition | `vintage` |
| lifestyle, wellness, travel, artistic | `watercolor` |
| product design, engineering, blueprint sketch, Apple, Tesla, industrial | `watercolor-sketch` |
| Default | `blueprint` |

### Custom Dimension Questions (Round 2)

When user selects "Custom dimensions" in Step 2:

**Texture:**
```
options: clean, grid, organic, pixel (paper via Other)
```

**Mood:**
```
options: professional, warm, cool, vibrant, macaron (dark, neutral via Other)
```

**Typography:**
```
options: geometric, humanist, handwritten, editorial (technical via Other)
```

**Density:**
```
options: balanced (Recommended), minimal, dense
```

## Building STYLE_INSTRUCTIONS

From the chosen preset or custom dimensions, build a block for the outline and prompts. See `outline-template.md` for the full template.

```
<STYLE_INSTRUCTIONS>
Design Aesthetic: [2-3 sentences combining dimension characteristics]
Background:
  Texture: [from texture dimension]
  Base Color: [from mood palette]
Typography:
  Headlines: [visual description, NOT font names]
  Body: [visual description]
Color Palette:
  Primary Text: [hex] - [usage]
  Background: [hex] - [usage]
  Accent: [hex] - [usage]
Visual Elements:
  - [element descriptions from texture + mood combination]
Density Guidelines:
  - [content per slide from density dimension]
Style Rules:
  Do: [guidelines]
  Don't: [anti-patterns]
</STYLE_INSTRUCTIONS>
```

**Important**: Describe visual appearance ("bold geometric sans-serif") NOT font names ("Inter"). Image generators can't load fonts.

## Generating Prompts (Step 5)

For each slide in the outline:
1. Read `base-prompt.md` for the template
2. Copy `<STYLE_INSTRUCTIONS>` from the outline (don't re-read style files)
3. Add slide-specific content (headline, points, visual description)
4. If `Layout:` specified, include guidance from `layouts.md`
5. Save as `prompts/NN-slide-{slug}.md`

## Generating Images (Step 7)

For each slide:
1. Call nano-banana API (see `../references/nano-banana.md`):
   - `aspectRatio`: `"16:9"` (always)
   - `model`: `"flash"` for iteration/previews, `"pro"` for final output
   - `imageSize`: `"1K"` default, `"2K"` for high-res final exports
2. Save as `/code/slides/{slug}/NN.png`
3. Auto-retry once on failure. If second attempt fails, continue remaining slides.
4. Report progress: "Generated X/N"

## Assembling index.html (Step 8)

Use shared template (`../references/slide-template.md`) and nav engine (`../references/css-patterns.md`). Wrap each image:

```html
<section class="slide slide--image" data-page="N">
  <img data-bp-id="img-N" crossorigin="anonymous"
       src="data:image/png;base64,{base64}"
       alt="Slide N: {headline}"
       style="width:100%;height:100%;object-fit:contain;display:block;" />
</section>
```

CSS for image slides (add to deck's `<style>`):
```css
.slide--image { padding: 0; display: flex; align-items: center; justify-content: center; background: #000; }
.slide--image img { max-width: 100%; max-height: 100%; }
```

`crossorigin="anonymous"` mandatory (chip preview canvas). `background: #000` for safe letterbox.

## Design Philosophy

Decks designed for **reading and sharing**, not live presentation:
- Each slide self-explanatory without verbal commentary
- Logical flow when scrolling
- All necessary context within each slide
- Optimized for social media sharing

See `design-guidelines.md` for audience-specific principles, visual hierarchy, color/typography selection.

## Partial Workflows

| Option | What |
|--------|------|
| `--images-only` | Skip to Step 7 — requires existing `prompts/` and `outline.md` |
| `--regenerate N` | Regenerate specific slide(s) only |

### --regenerate N

```
1. Read existing prompt for slide N from prompts/
2. Regenerate image via nano-banana
3. Replace NN.png
4. Update <img> src in index.html
5. Re-validate protocol
```

## Slide Modification

| Action | Steps |
|--------|-------|
| **Edit** | Update `prompts/NN-slide-{slug}.md` FIRST → regenerate image → re-validate |
| **Add** | Create prompt → generate image → renumber subsequent → update outline → re-validate |
| **Delete** | Remove PNG + prompt → renumber subsequent → update outline → re-validate |

**IMPORTANT**: Always update the prompt file FIRST before regenerating. Prompts are the source of truth for image slides.

**Renumbering rule**: Only NN changes, slugs remain unchanged. See `modification-guide.md` for details.

## References (within `image/`)

| Path | What |
|------|------|
| `base-prompt.md` | Base prompt template for nano-banana |
| `outline-template.md` | Outline structure with STYLE_INSTRUCTIONS |
| `layouts.md` | Layout options and selection tips |
| `design-guidelines.md` | Audience, typography, color, visual elements |
| `content-rules.md` | Content and style guidelines |
| `analysis-framework.md` | Content analysis for presentations |
| `modification-guide.md` | Edit, add, delete slide workflows |
| `config/preferences-schema.md` | EXTEND.md structure |
| `dimensions/presets.md` | Preset → dimension mapping |
| `dimensions/density.md` | Density dimension spec |
| `dimensions/mood.md` | Mood dimension spec |
| `dimensions/texture.md` | Texture dimension spec |
| `dimensions/typography.md` | Typography dimension spec |
| `styles/*.md` | 17 style preset specs |
| `merge-to-pptx.ts` | Merge slides into PowerPoint |
| `merge-to-pdf.ts` | Merge slides into PDF |
