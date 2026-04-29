---
version: 1
name: make-tweakable
description: Add in-design tweak controls — wrap an artifact's CSS values in a Tweaks block so the user can adjust spacing, color, font size, and other knobs from the Bench without re-prompting. Use when an HTML artifact already exists and user wants to fine-tune visuals interactively.
user-invocable: true
---

# make-tweakable

Convert hard-coded CSS values into named, user-tweakable knobs.

## How
Wrap declarations in a marked block at the top of the file:

```
/*EDITMODE-BEGIN*/
:root {
  --spacing: 16px;       /* tweak: spacing | range 4 64 */
  --accent: #ff6b00;     /* tweak: accent | color */
  --title-size: 32px;    /* tweak: title-size | range 16 96 */
}
/*EDITMODE-END*/
```

The Bench's Tweaks lane reads this block and renders sliders/pickers. Saves merge back into the same block.

## Rules
- Pick semantic names (`--spacing`, not `--var-1`)
- 6–12 knobs is the sweet spot; more = decision paralysis
- Only knob-ify values worth tweaking — don't expose every value
