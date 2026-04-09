---
name: slide
description: Create presentation slide decks as a single HTML file with the widget aesthetic system. All slides live in one document as sections, sharing one theme. Rendered as a widget in chat. Optionally deploy as a standalone URL. No build tools or frameworks required. Triggers include "create slides", "make a presentation", "build a deck", "HTML slides", "slide deck", "quick presentation".
---

# HTML Slides

Create presentations as pure HTML. No build tools, no frameworks — just HTML, CSS, and the widget aesthetic system.

**How it works:** The entire presentation is a single HTML file output as a `widget` code block. All slides are `<section>` elements inside one document, sharing the same theme (aesthetic, fonts, CSS). The frontend renders the widget inline in chat with built-in navigation. This is the default and primary output mode — no CLI tools needed.

**Deploy is optional.** Only deploy to rebyte.pro when the user explicitly asks for a shareable URL. See `references/deploy.md`.


**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

**Directory structure:**
- `SKILL_DIR`: The directory containing this SKILL.md
- Working directory: `/code/` (where presentation projects are created)

## Aesthetic Direction (MANDATORY)

Pick ONE aesthetic. Set `data-aesthetic="name"` on `<html>`. The frontend resolves to actual colors — **never hardcode hex colors**.

| Aesthetic | Feel | Best for | NEVER combine with |
|-----------|------|----------|--------------------|
| `editorial` | Serif, generous whitespace, earth tones + gold | Keynotes, narratives | Bright colors, card grids, tech iconography |
| `blueprint` | Technical drawing, slate/blue palette | Architecture, system talks | Warm tones, soft edges, decorative elements |
| `paper-ink` | Warm cream, terracotta/sage | Tutorials, creative pitches | Neon accents, dark backgrounds, gradients |
| `mono-terminal` | Green/amber on dark, CRT feel | Technical demos | Serif fonts, pastel colors, rounded cards |
| `data-dense` | Tight spacing, maximum information | Data presentations | Decorative elements, animations, vague labels |
| `warm` | Peach/cream, friendly | General purpose | Cold blues, harsh shadows, sterile grids |
| `dracula` | Purple-heavy, Dracula IDE scheme | Developer talks | Warm earth tones, serif body text |
| `nord` | Cool arctic blues, minimalist | Clean, minimal decks | Warm accents, ornamental fonts, dense layouts |

**Constrained aesthetics** (editorial, blueprint, paper-ink, mono-terminal) produce more distinctive results.

## Font Pairing (MANDATORY)

Pick ONE font pair. Set `data-font="name"` on `<html>`.

| Name | Body font | Code font | Voice |
|------|-----------|-----------|-------|
| `dm-sans` | DM Sans | Fira Code | Clean, modern |
| `instrument-serif` | Instrument Serif | JetBrains Mono | Literary, editorial |
| `ibm-plex` | IBM Plex Sans | IBM Plex Mono | Technical, precise |
| `bricolage` | Bricolage Grotesque | Fragment Mono | Bold, contemporary |
| `jakarta` | Plus Jakarta Sans | Azeret Mono | Friendly, rounded |
| `outfit` | Outfit | Space Mono | Geometric, clean |
| `sora` | Sora | IBM Plex Mono | Modern, geometric |
| `crimson-pro` | Crimson Pro | Noto Sans Mono | Classic serif |
| `fraunces` | Fraunces | Source Code Pro | Warm, ornamental |
| `red-hat` | Red Hat Display | Red Hat Mono | Distinctive |
| `libre-franklin` | Libre Franklin | Inconsolata | Neutral, versatile |
| `playfair` | Playfair Display | Roboto Mono | Elegant, high-contrast |

**Recommended pairings:**
- editorial → `instrument-serif`, `crimson-pro`, `playfair`, `fraunces`
- blueprint → `ibm-plex`, `dm-sans`, `sora`
- paper-ink → `crimson-pro`, `fraunces`, `libre-franklin`
- mono-terminal → `ibm-plex`
- data-dense → `ibm-plex`, `dm-sans`, `libre-franklin`

**NEVER use Inter, Roboto, or Arial.**

## CSS Variable Contract

Always use these. NEVER hardcode colors.

| Variable | Purpose |
|----------|---------|
| `--widget-bg-primary` | Slide background |
| `--widget-bg-secondary` | Card background |
| `--widget-bg-tertiary` | Code blocks, inputs |
| `--widget-text-primary` | Headings, body |
| `--widget-text-secondary` | Descriptions |
| `--widget-text-muted` | Captions, labels |
| `--widget-accent` | Highlights, decorations |
| `--widget-accent-fg` | Accent text color |
| `--widget-accent-text` | Text on accent bg |
| `--widget-border` | Borders |
| `--widget-border-radius` | Border radius (12px) |
| `--widget-shadow-sm` / `--widget-shadow-md` | Shadows |
| `--widget-font-sans` | Body font |
| `--widget-font-mono` | Code, data values |
| `--widget-chart-1` … `--widget-chart-8` | Chart colors |

---

## Creating Slides

The entire presentation is one HTML file containing all slides as `<section>` elements.

### Output Format

Save the HTML to `/code/slides/{slug}/index.html` (the workflow skill handles the path).

```html
<html data-aesthetic="editorial" data-font="instrument-serif" data-slides="true">
  <head>...</head>
  <body>
    <div class="deck" id="deck">
      <section class="slide slide--title" data-page="1">...</section>
      <section class="slide slide--content" data-page="2">...</section>
      <section class="slide slide--closing" data-page="3">...</section>
    </div>
    <script>/* navigation engine */</script>
  </body>
</html>
```

**Save as a file**, not as a widget code block in chat. The frontend reads the file from the VM.

### HTML Architecture

One HTML document, one theme, all slides as sections. See `references/css-patterns.md` for the complete CSS, navigation JS, and layout classes. See `references/slide-template.md` for the base template.

```html
<!DOCTYPE html>
<html lang="en" data-aesthetic="editorial" data-font="instrument-serif" data-slides="true">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=...&display=swap" rel="stylesheet">
  <style>
    :root { /* Fallback CSS vars matching chosen aesthetic */ }
    /* Slide engine + layout classes from css-patterns.md */
  </style>
</head>
<body tabindex="0">
  <div class="slide-progress" id="progress"></div>
  <div class="deck" id="deck">
    <section class="slide slide--title" data-page="1">
      <p class="label" data-bp-id="label-1">KEYNOTE</p>
      <h1 data-bp-id="title-1">Presentation <em>Title</em></h1>
      <p class="subtitle" data-bp-id="subtitle-1">Subtitle text</p>
    </section>
    <section class="slide slide--content" data-page="2">
      <h2 data-bp-id="heading-2">Slide Heading</h2>
      <ul data-bp-id="list-2">
        <li data-bp-id="item-2-1">First point</li>
        <li data-bp-id="item-2-2">Second point</li>
      </ul>
    </section>
    <section class="slide slide--closing" data-page="3">
      <h2 data-bp-id="heading-3">Thank You</h2>
      <p class="footer-text" data-bp-id="footer-3">Contact info</p>
    </section>
  </div>
  <div class="slide-controls">
    <button class="ctrl-btn" id="prev-btn">&#9664;</button>
    <span class="slide-counter" id="counter">1 / N</span>
    <button class="ctrl-btn" id="next-btn">&#9654;</button>
  </div>
  <script>/* Navigation engine from css-patterns.md */</script>
</body>
</html>
```

**CRITICAL rules:**
1. Include `<link>` for Google Fonts (needed for standalone rendering)
2. Set fallback CSS vars in `:root` matching your chosen aesthetic
3. Design for **1920x1080** internal canvas (16:9)
4. Include `tabindex="0"` on `<body>` for keyboard focus in iframe
5. Copy the navigation engine JS verbatim from `references/css-patterns.md`
6. Every `<section>` MUST have `data-page="N"` (1-indexed sequential)
7. Every editable element MUST have `data-bp-id` (unique within the deck)

### Navigation (built into JS engine)

- **Space / Right arrow / Enter**: next slide
- **Left arrow / Backspace**: previous slide
- **Home / End**: first / last slide
- **F**: toggle fullscreen
- **Touch swipe**: left/right (50px threshold)
- **On-screen buttons**: prev/next + counter (hover to reveal)

### Transitions

Set `data-transition` on `.deck`: `slide` (default), `fade`, `none`

---

## Deploying as a Standalone URL (only when user asks)

See `references/deploy.md`. Save the widget HTML as `index.html` and run `rebyte deploy`. Do NOT attempt deployment unless the user explicitly requests a shareable URL.

---

## Slide Types

Use these layout classes on `<section class="slide slide--TYPE">`:

| Class | When | Key elements |
|-------|------|--------------|
| `slide--title` | First slide | `.label`, `h1` (with `<em>` for accent), `.subtitle`, `.divider` |
| `slide--section` | Section divider | `.section-number`, `h2` |
| `slide--content` | Main slides | `h2`, `ul > li` |
| `slide--two-col` | Comparisons | `h2`, `.col-grid > .col-card` (`.accent-bar`, `h3`, `p`) |
| `slide--stat` | Key metrics | `.label`, `.stat-grid > .stat-item` (`.big-number`, `.stat-label`) |
| `slide--quote` | Citations | `.quote-mark`, `blockquote`, `.attribution` |
| `slide--code` | Technical | `h2`, `pre` (`.keyword`, `.string`, `.comment`) |
| `slide--closing` | Last slide | `h2`, `.cta`, `.footer-text` |

## Typography Scale (at 1920x1080)

```
Title h1:        80px  weight 400  line-height 1.1
Section h2:      64px  weight 400  line-height 1.2
Content h2:      52px  weight 400  line-height 1.2
Card h3:         28px  weight 400
Body/bullets:    26px  weight 400  line-height 1.7
Subtitle:        28px  secondary color
Big number:      96px  monospace   accent color
Label:           14px  monospace   uppercase  letter-spacing 0.15em
Caption:         16px  muted color
```

## CDN Libraries (for charts/diagrams)

| Library | CDN URL | Use for |
|---------|---------|---------|
| Chart.js 4 | `https://cdn.jsdelivr.net/npm/chart.js@4.4.1` | Charts |
| D3 v7 | `https://cdn.jsdelivr.net/npm/d3@7` | Custom visualizations |
| Mermaid | `https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js` | Diagrams |
| anime.js | `https://cdn.jsdelivr.net/npm/animejs@3.2.2/lib/anime.min.js` | Animations |

## Design Rules

1. **One idea per slide** — no walls of text
2. **8-12 slides** default
3. **Use `<em>` in headings** for italic accent words
4. **Generous padding** — 100px top/bottom, 140px sides
5. **Accent bar decorations** — small colored bars above card content
6. **Monospace for data** — numbers, stats, code use `var(--widget-font-mono)`
7. **Compositional variety** — alternate centered, left-aligned, and grid layouts

## Design DON'Ts (CRITICAL — read before every deck)

These rules eliminate the most common AI-generated slide problems. Violating any of these produces generic, forgettable output.

### Typography
- **DON'T** use Inter, Roboto, Open Sans, Arial, or system fonts as display/heading fonts — they are invisible on stage
- **DON'T** mix more than 2 font families — one body + one accent is enough
- **DON'T** use ALL CAPS headings — use weight and size contrast instead
- **DON'T** use monospace for body text — reserve it for data, stats, and code only
- **DON'T** use font sizes too close together — hierarchy needs big jumps (80px title vs 26px body), not small steps (28px vs 24px)

### Color
- **DON'T** use pure black (#000) or pure white (#fff) — always tint. Use `var(--widget-bg-primary)` and `var(--widget-text-primary)` instead
- **DON'T** use cyan-on-dark, purple-to-blue gradients, or neon accents on dark backgrounds — this is the #1 "AI slop" aesthetic
- **DON'T** use gradient text on headings or metrics — it's decorative noise, not design
- **DON'T** use gray text on colored backgrounds — use a tinted shade of the background color
- **DON'T** overuse the accent color — 10% max. When everything is highlighted, nothing is

### Layout
- **DON'T** wrap every element in a card — slides are already contained. Cards inside slides add visual noise
- **DON'T** use the same card grid on every slide — 3 identical cards repeated = monotonous template
- **DON'T** center everything — left-aligned text with asymmetric layouts feels more designed
- **DON'T** use the same spacing everywhere — rhythm needs variety (tight groups + generous gaps)
- **DON'T** use the "hero metric" template on every data slide (big number, small label, gradient accent) — vary data presentation
- **DON'T** nest cards inside cards — ever

### Visual
- **DON'T** use glassmorphism (blur effects) as decoration
- **DON'T** use rounded rectangles with thick colored borders as "accent" — it's lazy
- **DON'T** use glowing box-shadows or drop-shadows as decoration
- **DON'T** use sparklines or mini-charts that look sophisticated but convey nothing
- **DON'T** add decorative elements (dots, lines, shapes) without clear purpose
- **DON'T** use bounce or elastic animations — they feel dated. Use ease-out only

## Blueprint Attributes (MANDATORY)

Every slide deck MUST include these data attributes for per-page iteration support.

### Page-level: `data-page`

Every `<section>` MUST have `data-page="N"` (1-indexed, sequential):

```html
<section class="slide slide--title" data-page="1">...</section>
<section class="slide slide--content" data-page="2">...</section>
<section class="slide slide--stat" data-page="3">...</section>
```

### Element-level: `data-bp-id`

Every editable element (headings, paragraphs, lists, stats, images, quotes, code blocks, cards) MUST have a unique `data-bp-id` attribute.

**Naming convention:** `{type}-{page}-{index}` where type is a short descriptor. For the single main element on a page (like the title on page 1), `{type}-{page}` alone is fine.

| Type prefix | Used on |
|-------------|---------|
| `title` | h1 main title |
| `heading` | h2, h3 section headings |
| `subtitle` | Subtitle paragraphs |
| `label` | Monospace label text |
| `desc` | Body/description paragraphs |
| `list` | ul/ol containers |
| `item` | li elements |
| `stat` | Stat grid containers |
| `stat-num` | Big number values |
| `stat-label` | Stat label text |
| `quote` | Blockquote elements |
| `attr` | Attribution text |
| `code` | Pre/code blocks |
| `img` | Images |
| `card` | Column cards |
| `cta` | Call-to-action elements |
| `footer` | Footer text |
| `chart` | Chart/diagram containers |

**Examples:**
```html
<h1 data-bp-id="title-1">Company Name</h1>
<h2 data-bp-id="heading-2">Market Overview</h2>
<p data-bp-id="desc-2-1">Revenue grew 40% YoY</p>
<div class="stat-grid" data-bp-id="stat-3">
  <div class="stat-item" data-bp-id="stat-3-1">
    <p class="big-number" data-bp-id="stat-num-3-1">87%</p>
    <p class="stat-label" data-bp-id="stat-label-3-1">Adoption rate</p>
  </div>
</div>
<ul data-bp-id="list-4">
  <li data-bp-id="item-4-1">First point</li>
  <li data-bp-id="item-4-2">Second point</li>
</ul>
<blockquote data-bp-id="quote-5">The future is now.</blockquote>
<img data-bp-id="img-6-1" src="..." alt="...">
```

These attributes are **data-only** -- they do NOT affect styling or layout. Never write CSS selectors that target `data-page` or `data-bp-id`.

## Images

Every image is embedded via the **public CDN**. No local files, no relative paths.

**Two sources, no exceptions:**

- **Generate** with the `image-workflow` skill (uses `nano-banana`). Aspect ratio matches the slide layout (`16:9` for full-bleed, `4:3` or `1:1` for two-col cards). `imageSize: "512"` for normal slides, `"1K"` for hero/full-bleed only. Then upload:
  ```bash
  PUBLIC_URL=$(bash ~/.skills/rebyteai-image-workflow/scripts/upload-public.sh /tmp/img.png "{slug}" "{name}")
  ```
- **Reuse** something from `/code/raw/`. Upload the same way via the script above.

**Embed template** (the `<img crossorigin="anonymous">` attribute is mandatory — the chip preview canvas pipeline depends on it):

```html
<div data-bp-id="img-6-wrap" style="aspect-ratio:16/10; background:var(--widget-bg-secondary); border-radius:var(--widget-border-radius); overflow:hidden;">
  <img data-bp-id="img-6" crossorigin="anonymous"
       src="https://api.rebyte.ai/api/public/artifacts/{workspaceId}/{filename}.png"
       alt="..." style="width:100%; height:100%; object-fit:cover;" />
</div>
```

**DON'T:**
- Hotlink external URLs in `<img src>` — Unsplash, Pexels, Imgur, picsum, placeholder.com, any `https://` host that isn't our public CDN. They hallucinate (you cannot remember real photo IDs from memory), they 404, they get blocked by referer checks. Only `${API_URL}/api/public/artifacts/...` URLs are allowed. The DOM Lint Pass enforces this.
- Save under `/code/slides/{slug}/assets/`. That directory is gone. The CDN URL is the only reference.
- Use a relative `<img src="assets/foo.png">`. Relative URLs resolve against `about:srcdoc` in the slide editor preview iframe and 404 on every image.
- Embed base64 inline — bloats the HTML, slows the editor
- Use a placeholder `src` and "fill in later" — the next agent won't know to fill it in
- Skip explicit container dimensions — broken images collapse the layout into a one-pixel sliver
- Omit `crossorigin="anonymous"` on `<img>` tags — the chip preview canvas will throw SecurityError and produce a blank chip

**Container dimensions are mandatory.** Wrap every `<img>` in a div with `aspect-ratio` or `min-height` so the slot is reserved if the image fails to render — use the embed template above.

The DOM Lint Pass below catches non-CDN external URLs (`reason:external-url`), relative paths (`reason:relative-src`), missing crossorigin (`reason:missing-crossorigin`), and overflow as a deterministic safety net.

## Quality Gates

Before outputting, verify EVERY gate:

1. **Color**: All colors use `var(--widget-*)`. No hardcoded hex. No pure #000/#fff. Accent used ≤10%
2. **Typography**: Clear hierarchy with big jumps (not small steps). Max 2 font families. No Inter/Roboto/Arial
3. **Layout**: No card-wrapped-everything. At least 3 different layout types across the deck. No identical card grids repeated
4. **Spacing**: Varied rhythm — tight content groups separated by generous whitespace. Not uniform spacing
5. **Anti-slop**: Zero gradient text. Zero glassmorphism. Zero neon-on-dark. Zero nested cards. Zero decorative sparklines
6. **Variety**: No two consecutive slides share the same layout class
7. **Structure**: All slides in one HTML document — one widget. Navigation JS included
8. **Data attributes**: Every `<section>` has `data-page="N"` (1-indexed). Every editable element has unique `data-bp-id`
9. **Squint test**: Blur your eyes — can you still identify the hierarchy on each slide? If not, increase contrast
10. No horizontal overflow. Fallback CSS vars match chosen aesthetic

## DOM Lint Pass (deterministic post-render check)

After saving the slide HTML, run a deterministic DOM lint to catch the bugs the design rules can't prevent at write time: text overflow from real font metrics, layout bugs from CSS interactions, oversized stat numbers, image-text overlap. **No screenshot reading, no visual judgment** — just bounding-box math and structural checks. Single bash invocation, single Chrome page load. Fast (~5s for a 10-page deck) and deterministic.

This is **polish, not a delivery gate**. If the lint can't run (Chrome unavailable, fresh VM with no chromium), log a warning and ship the deck anyway. The 10 Quality Gates above are the primary line of defense; this is the safety net for what they can't see.

### When to run

- **Always** at the end of the slide skill, after the final save
- **New deck** → lint every page
- **Iteration** (single-page draw annotation, follow-up edit) → lint only the pages that changed

### How it works

The VM has Chrome on `localhost:9222` with `agent-browser` CLI preinstalled. The lint loads the deck once via `file://`, walks every slide by toggling `.slide--active`, and reports overflowing children with their `data-bp-id`. You (Claude) read **JSON only** — never screenshots. Aesthetic checks belong in the Quality Gates (write time), not here.

### Step 1 — Run the lint

```bash
export AGENT_BROWSER_AUTO_CONNECT=1

agent-browser open "file:///code/slides/{slug}/index.html" \
  && agent-browser wait --load load \
  && agent-browser eval "
    document.fonts.ready.then(() => {
      const slides = document.querySelectorAll('.slide');
      const report = [];
      for (let i = 0; i < slides.length; i++) {
        slides.forEach((s, j) => {
          s.classList.remove('slide--active', 'slide--prev', 'slide--next');
          if (j === i) s.classList.add('slide--active');
          else if (j < i) s.classList.add('slide--prev');
          else s.classList.add('slide--next');
        });
        void slides[i].offsetHeight; // force reflow
        const slide = slides[i];
        const r = slide.getBoundingClientRect();
        const issues = [];
        for (const el of slide.querySelectorAll('*')) {
          const c = el.getBoundingClientRect();
          if (c.width === 0 && c.height === 0) continue;
          const overflow = Math.max(r.top - c.top, c.bottom - r.bottom, r.left - c.left, c.right - r.right);
          if (overflow > 1) issues.push({ tag: el.tagName, bp: el.dataset.bpId || null, overflowPx: Math.round(overflow) });
        }
        // Image URL check — only our public CDN is allowed.
        // Anchored to known relay hosts so https://evil.com/api/public/artifacts/... is NOT accepted.
        const CDN_PATTERN = /^https?:\/\/(api\.rebyte\.ai|api\.eng0\.ai|localhost:\d+)\/api\/public\/artifacts\//;
        for (const img of slide.querySelectorAll('img')) {
          const src = img.getAttribute('src') || '';
          if (/^https?:/.test(src) && !CDN_PATTERN.test(src)) {
            issues.push({ tag: 'IMG', bp: img.dataset.bpId || null, badSrc: src.slice(0, 60), reason: 'external-url' });
          }
          // Relative paths are also forbidden — they resolve against about:srcdoc in the editor preview iframe and 404
          if (src && !/^https?:/.test(src) && !src.startsWith('data:')) {
            issues.push({ tag: 'IMG', bp: img.dataset.bpId || null, badSrc: src.slice(0, 60), reason: 'relative-src' });
          }
          // CDN URLs need crossorigin="anonymous" — chip preview canvas depends on it
          if (CDN_PATTERN.test(src) && img.getAttribute('crossorigin') !== 'anonymous') {
            issues.push({ tag: 'IMG', bp: img.dataset.bpId || null, badSrc: src.slice(0, 60), reason: 'missing-crossorigin' });
          }
        }
        report.push({ page: parseInt(slide.dataset.page, 10) || (i + 1), ok: issues.length === 0, issues: issues.slice(0, 5) });
      }
      return JSON.stringify(report);
    })
  "
```

What this does:
- Loads the deck once via `file://`
- Waits for `window.load` (DOM + assets settled)
- The eval awaits `document.fonts.ready` so font fallback layout shifts have happened
- Loops through every slide programmatically by swapping `.slide--active` (same mechanism as the nav engine)
- Forces a reflow per page (`void slides[i].offsetHeight`)
- Walks every descendant of the active slide
- Computes how far each child sticks out past the slide's box on any side
- Returns up to 5 worst offenders per page

**Do not use `--load networkidle`** — slides with CDN libraries (Chart.js, Mermaid) or animations never settle. `--load load` + `document.fonts.ready` is the right combination.

The bounding-box math (rather than `scrollHeight > clientHeight`) is required because the slide container is dimensionally locked by `position: absolute; inset: 0` — `scrollHeight` equals `clientHeight` even when content overflows.

### Step 2 — Read the JSON report

The eval returns a JSON array like:

```json
[
  {"page": 1, "ok": true, "issues": []},
  {"page": 2, "ok": false, "issues": [{"tag": "H1", "bp": "title-2", "overflowPx": 55}]},
  {"page": 3, "ok": true, "issues": []},
  {"page": 4, "ok": true, "issues": []}
]
```

Each `ok: false` page tells you exactly which element by `bp` (the `data-bp-id`) and how many pixels it overshoots.

### Step 3 — Fix and retry (max 1 per page)

For each page where `ok: false`:
- Edit the HTML — target the offending element by `data-bp-id` (e.g., `title-2`)
- Common fixes: shrink font-size, shorten text, split into multiple slides, reduce padding
- Re-run the lint command from step 1
- **Hard cap: 1 retry per page.** If the second pass still fails, log the remaining issues as known limitations and move on. **Never loop.**

### Step 4 — Emit final reference tag

After all pages pass (or retry budget exhausted), emit the final reference tag. This is the existing `<rebyte-slide>` pattern that surfaces the deck card in chat:

    <rebyte-slide path="/code/slides/{slug}/index.html" pages="N" title="Deck title" />

### If Chrome is unreachable

Fresh VMs don't always have Chrome running on `localhost:9222` — the cctools relay starts the headful Chrome lazily when the user opens the Browser tab in Agent Computer. If `agent-browser` fails with `No running Chrome instance`, fall back in this order:

1. Start chromium yourself: `pgrep chromium > /dev/null || /usr/bin/chromium --remote-debugging-port=9222 --headless --no-sandbox --disable-gpu &` then wait a second and retry agent-browser
2. If chromium isn't installed at `/usr/bin/chromium`, find it: `which google-chrome google-chrome-stable chromium chromium-browser`
3. As a final fallback, use `mcp__chrome-devtools__*` tools — they manage their own Chrome lifecycle and can run the same eval logic

If everything fails, print `⚠️ DOM lint skipped: Chrome not reachable`, still emit the final `<rebyte-slide>` tag, and exit cleanly. Lint is polish, not a delivery gate.

## Reference Files

| File | Description |
|------|-------------|
| `references/slide-template.md` | Base HTML template for slides |
| `references/css-patterns.md` | CSS layout classes and navigation JS |
| `references/deploy.md` | How to deploy slides as a standalone URL |
