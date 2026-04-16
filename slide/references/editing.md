# Editing Protocol

How to edit existing decks. Applies to both HTML and image decks.

## Visual Magic Layer

The user's mental model is "I'm editing a deck", not "I'm coding HTML". Make file edits feel like visual edits — surgical, anchored to a single element by `data-bp-id`.

| Layer | User does | What lands in your prompt |
|---|---|---|
| Visual magic (frontend) | Clicks **Edit > Mark and Edit**, picks an element, types instruction | `[selected ... bp=BPID page=N]` + `[editing ...]` anchors + text |
| Code editing (you) | — | Read/edit/save with normal code tools |

## Anchor — Which Deck?

The frontend injects a hint at the top of the user's message when they have a deck open.

1. **`[editing /code/slides/X/index.html]`** → user is viewing X. Default to X.
2. **Explicit deck name** in the message → overrides anchor. Look up slug in INDEX.md.
3. **Single existing deck** + no anchor → use it.
4. **Multiple decks + ambiguous** → ASK with a numbered list:
   ```
   Which deck do you want to edit?
   1. **Lexreview AI Pitch** — 8 slides (`lexreview-ai-pitch`)
   2. **Q4 Business Review** — 8 slides (`q4-business-review`)
   ```
5. **Empty `/code/slides/`** → create a new deck (use outline workflow).

The anchor is a **hint, not a command**. Never echo `[editing ...]` back to the user.

## Selection Anchor — Which Element?

When the user clicks **Edit > Mark and Edit** and selects a DOM element:

```
[selected /code/slides/{slug}/index.html bp={bpId} page={N}]
[editing /code/slides/{slug}/index.html]

...the user's instruction...
```

**Workflow:**
1. Parse bpId: regex `bp=([^\s\]]+)` from anchor line
2. `grep -n 'data-bp-id="BPID"' /code/slides/{slug}/index.html`
3. Read surrounding context
4. Edit that one element in place. **Preserve bp-id verbatim.**
5. Save. Frontend re-fetches.

**Multiple `[selected ...]` lines** = editing several elements at once. Group by bp, edit each surgically.

## Editing HTML Decks

- **Surgical edits only** — touch only the pages the user mentioned
- **Preserve `data-page` and `data-bp-id`** — they are load-bearing
- Don't reorder, insert, or delete pages during single-page edits
- Don't regenerate the entire deck unless explicitly asked
- After edit: run DOM Lint (see `html-slides.md`), export PNGs, validate protocol

## Editing Image Decks

When a user selects an element on an image slide (via `[selected ... bp=img-N]`):
1. Read the user's instruction
2. Update the image prompt in `outline.md`
3. Regenerate the image via nano-banana with updated prompt
4. Replace `NN.png` with new image
5. Update the `<img src>` in the `<section>` if CDN URL changed
6. Run validate-protocol.sh

## DO

- Surgical edits — touch only what the user mentioned
- Preserve `data-page` and `data-bp-id`
- Update `INDEX.md` after every change

## DON'T

- Regenerate the entire deck unless explicitly asked
- Reorder pages during single-page edits
- Move or modify files in `/code/raw/`
- Echo the `[editing ...]` anchor line back to the user
- Skip validation
