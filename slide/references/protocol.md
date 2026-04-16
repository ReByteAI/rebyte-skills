# Protocol

The contract between the slide skill and the frontend. If this breaks, the deck is broken — regardless of how good the HTML or images look.

## File Layout

```
/code/slides/
  .slide                           # Marker file — triggers gallery UI in frontend
  {slug}/
    index.html                     # The deck: <section> elements + nav engine + CSS
    outline.md                     # Deck outline (kept for re-generation reference)
    source.{ext}                   # Original input content (md, pdf, txt — whatever user provided)
    prompts/                       # Per-slide generation prompts (the "source code" of each slide)
      01-slide-{slug}.md           #   Prompt that produced 01.png
      02-slide-{slug}.md           #   Prompt that produced 02.png
    01.png, 02.png, ...            # One PNG per section (zero-padded, sequential)
    assets/                        # Optional: images, data referenced by HTML slides
/code/INDEX.md                     # Workspace ledger — update after every change
```

## Invariants

1. **index.html** exists with N `<section class="slide" data-page="1..N">` elements
2. **Sequential numbering** — `data-page` values are 1, 2, 3, ..., N with no gaps
3. **NN.png** exists for every section (01.png, 02.png, ...) — no missing, no extra
4. **No relative paths** — all `src` and `href` in index.html must be absolute CDN URLs (`https://`). Relative paths break in the frontend's srcdoc iframe. Upload to CDN first, then rewrite.
5. **`.slide` marker** exists in `/code/slides/`
6. **Every editable element** has a unique `data-bp-id` attribute (for HTML slides)
7. **Nav engine** JS is included in index.html (from `css-patterns.md`)

## How PNGs Are Produced

| Deck type | PNG source | Extra step |
|-----------|-----------|------------|
| HTML-first | Chrome screenshots of each `<section>` | Run `export-pages.sh` |
| Image-first | nano-banana generates each slide as PNG | Wrap PNGs in `<section>` elements |

Either way, the same two artifacts exist: `index.html` + `NN.png` per slide.

## Validation Script

Run after EVERY generation or edit. Fix any `"ok": false` before telling the user the deck is done.

```bash
SKILL_DIR="$(dirname "$(readlink -f ~/.skills/rebyteai-slide/SKILL.md)")"
bash "$SKILL_DIR/scripts/validate-protocol.sh" /code/slides/{slug}/index.html
```

**Output:** JSON report.
```json
{"deck":"my-deck","sections":8,"pngs":8,"ok":true,"errors":[],"warnings":[]}
```

`"ok": true` → proceed. `"ok": false` → fix and re-run.

**What it checks:**
1. `index.html` exists with sequential `<section data-page>` elements
2. `NN.png` exists for every section (01.png, 02.png, ...) — no missing, no extra
3. PNG timestamps are consistent (not stale from a prior run)
4. `.slide` marker file exists

## Export Page Images (HTML decks)

For HTML-first decks, generate PNGs by screenshotting each section:

```bash
SKILL_DIR="$(dirname "$(readlink -f ~/.skills/rebyteai-slide/SKILL.md)")"
bash "$SKILL_DIR/scripts/export-pages.sh" /code/slides/{slug}/index.html
```

Opens the deck in Chrome, toggles each `<section>` to `.slide--active`, screenshots at 1920x1080. Output: `01.png`, `02.png`, etc.

**If Chrome is unavailable:** warn and skip. PNGs are a deliverable, not a gate.

## INDEX.md

Update `/code/INDEX.md` after every create/update/delete with the deck's last-updated date.

## Slug Rules

- kebab-case, derived from title
- **Stable across edits** — once created, never rename
- Max 40 chars, ASCII only
