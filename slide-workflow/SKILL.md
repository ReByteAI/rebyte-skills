---
name: slide-workflow
description: The slides app at /code/slides/. Create, iterate, and publish HTML decks. Each {slug}/ folder is a deck, the code agent is the app's runtime user. Visual magic over code editing.
---

# Slide Workflow

`/code/slides/` is an app, not a directory. Each `{slug}/` is a deck. The user interacts with it through the **Slides tab** in Agent Computer (visual magic). You interact through file operations (code editing). **You are the app's runtime; the user is its user.**

## Visual magic over code editing

The two interaction layers:

| Layer | User does | What lands in your prompt |
|---|---|---|
| Visual magic (frontend) | Clicks **Edit ▸ Mark and Edit**, picks an element on the slide, types instruction | `[selected /code/slides/{slug}/index.html bp=BPID page=N]` + `[editing ...]` anchors + the user's typed text |
| Code editing (you) | — | Read/edit/save HTML with normal code tools |

When choosing between behaviors, **prefer the visual layer**. The user's mental model is "I'm editing a deck", not "I'm coding HTML". Make file edits feel like visual edits — surgical, anchored to a single element by `data-bp-id`, never refactor for elegance.

## Sub-skills

- `rebyteai/second-brain` — workspace contract (`raw/`, content dirs, `output/`, `INDEX.md`)
- `rebyteai/slide` — HTML generation rules, aesthetics, data attributes, **Images**, **DOM Lint Pass**
- `rebyteai/image-workflow` — image generation via `nano-banana` (Gemini 3.1 Flash image gen)

## Pre-flight (required)

```bash
ls ~/.skills/rebyteai-slide/SKILL.md ~/.skills/rebyteai-second-brain/SKILL.md 2>/dev/null
```

Missing? Use `skill-installer` to install by slug. Don't proceed without `slide`.

## App data model

```
/code/
  raw/                       # User materials (READ-ONLY)
  slides/                    # The slides app
    .slide                   # Marker file (triggers gallery in frontend)
    {slug}/                  # One deck = one folder
      index.html             # The deck (sole data file)
      assets/                # Images, data, anything the deck references
  output/                    # Final exports/deploys
  INDEX.md                   # Workspace ledger (you maintain)
```

**Slug rules:** kebab-case, derived from title, **stable across edits**, max 40 chars, ASCII only. Once created, never rename — the slide editor anchors on the path.

## Anchor — which deck does the user mean?

The frontend injects a hint at the top of the user's message when they have a deck open. Read it.

1. **`[editing /code/slides/X/index.html]` line at the start of the message** → user is viewing X. **Default to X.**
   - "change the theme" → modify X
   - "add a page about cats" → **append** a `<section>` to X (the user is looking at X — appending matches their visual context)
   - To CREATE a brand-new deck the user must say so explicitly ("create a NEW deck about cats", "新建一个 deck")
2. **Explicit deck name in the message** ("edit Lexreview's title", "in the Q4 deck...") → overrides the anchor. Look up the slug in `INDEX.md`.
3. **Single existing deck** + no anchor + no name → use it.
4. **Multiple decks + ambiguous instruction** → ASK with `<rebyte-slide>` candidate cards. Don't guess. Example:
   ```
   Which deck do you want to edit?
   <rebyte-slide path="/code/slides/lexreview-ai-pitch/index.html" pages="8" title="Lexreview AI Pitch" />
   <rebyte-slide path="/code/slides/q4-business-review/index.html" pages="8" title="Q4 Business Review" />
   ```
5. **Empty `/code/slides/`** → CREATE a new deck.

The anchor is a **hint, not a command**. "Which deck has the most slides?" is a Q&A — answer it, don't edit anything. **Never echo the `[editing ...]` line back to the user** — it's a frontend-injected hint, not human content.

## Selection anchor — which element did the user select?

When the user clicks **Edit ▸ Mark and Edit** in the slide editor and selects a DOM element, the frontend prepends a structured anchor line ABOVE the `[editing ...]` line:

```
[selected /code/slides/{slug}/index.html bp={bpId} page={N}]
[editing /code/slides/{slug}/index.html]

…the user's instruction…
```

The selection anchor is the **canonical** source for *which element to edit*. Don't guess, don't ask the user.

| Signal | Source | Tells you |
|---|---|---|
| `[editing /code/slides/{slug}/index.html]` | Anchor line | Which deck file is open |
| `[selected ... bp={bpId} page={N}]` | Anchor line (above editing) | Which exact element + which page |
| `data-bp-id="..."` in the section you `Read` | HTML content | The exact node to grep + edit surgically |

**Workflow when you see a `[selected ...]` line:**

1. Parse the bpId: regex `bp=([^\s\]]+)` against the anchor line.
2. `grep -n 'data-bp-id="BPID"' /code/slides/{slug}/index.html` to find the exact line.
3. `Read` the surrounding context if needed (the file is structured, so a tight `Read` window works).
4. `Edit` that one element in place. **Preserve the bp-id verbatim** — never rename or drop it.
5. Save. The frontend re-fetches and re-highlights the same element on the new HTML.

**Multiple `[selected ...]` lines in one message** = user is editing several elements at once (sequential selections without close). Group by `bp`, edit each surgically. Never regenerate the deck.

**The selection anchor is load-bearing.** The frontend producer is `formatSelectionAnchor` in `frontend/src/store/slide-editor-store.ts` — if either side changes the format, both must stay in sync. The screenshot the user sees in their chat input is purely UX confirmation; **you never receive the screenshot, and you don't need it** — the bp-id anchor + the source file are sufficient.

The old `slide-page-{N}-{uuid}.png` chip filename convention is removed (no more screenshot uploads to GCS for slide edits).

## Images

Two sources, no exceptions:

- **Generate** with `image-workflow` (uses `nano-banana` / Gemini 3.1 Flash image gen). Aspect ratio matches the slide layout (`16:9` for full-bleed, `4:3` or `1:1` for two-col cards). `imageSize: "1K"` for normal slides, `2K` for hero/title.
- **Reuse** something already in `/code/raw/` (user-provided).

**Path:** `/code/slides/{slug}/assets/{descriptive-name}.png`
**Reference:** `<img src="assets/{descriptive-name}.png" alt="..." />`

The full Images rules + container-dimensions template + DOM lint check live in the slide skill SKILL.md "Images" section. The short version: **never hotlink external URLs, always wrap `<img>` in a div with `aspect-ratio` so broken images don't collapse the layout**.

## After every change

1. Run the **DOM Lint Pass** (the slide skill defines the single bash command — `agent-browser open ... && eval ...`). It returns a JSON report per page. Fix overflowing or external-URL issues by `data-bp-id`. **Hard cap: 1 retry per page.** Never loop.
2. Update `/code/INDEX.md` (last-updated date)
3. Output the reference tag — frontend uses it to refresh the editor:

   ```
   <rebyte-slide path="/code/slides/{slug}/index.html" pages="N" title="Deck title" />
   ```

If the lint can't run (Chrome unavailable, fresh VM), warn and continue. Lint is polish, not a delivery gate.

## DO

- **Surgical edits** — touch only the pages the user mentioned
- **Preserve `data-page` and `data-bp-id`** — they are load-bearing for per-page iteration
- **Update `INDEX.md`** after every create/update/delete
- **Use the slide skill's CSS variables and aesthetic system** — never hardcode hex colors
- **Output `<rebyte-slide>` after every change** so the frontend refreshes the editor

## DON'T

- Regenerate the entire deck unless explicitly asked. Iteration is surgical.
- Reorder, insert, or delete pages during single-page edits — `data-page` numbering is fragile to reorder
- Move or modify files in `/code/raw/` — ever
- Echo the `[editing ...]` anchor line back to the user
- Hotlink external image URLs (see Images above)
- Skip the DOM Lint Pass — it catches what the design rules can't see

## Publish

When the user is satisfied:

- **Deploy:** `rebyte deploy` from `/code/slides/{slug}/` → shareable URL
- **Download:** user grabs the file directly
- **Fullscreen:** open in new browser tab

Record published URLs in `/code/output/`.

## Reference

- `rebyteai/slide` SKILL.md — HTML generation, aesthetics, design DON'Ts, Images, DOM Lint Pass
- `rebyteai/second-brain` SKILL.md — workspace contract details (raw/, INDEX.md, INGEST/QUERY patterns)
- `rebyteai/image-workflow` SKILL.md — image generation specifics
