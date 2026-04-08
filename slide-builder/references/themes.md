# Theme Selection Guide

When showing theme options, use the preview images from the table below with markdown image syntax `![name](url)`. The chat UI renders these as inline images. **ONLY use themes listed in this file — NEVER invent or suggest themes not listed here.**

## When to Choose Theme

Choose theme during **Step 2: Initialize**. Consider:
- Presentation topic and tone
- Target audience
- Formality level

## Available Themes

**Theme Package Naming Convention:**
- **Official themes**: `@slidev/theme-*` (e.g., `@slidev/theme-seriph`)
- **Community themes**: `slidev-theme-*` (e.g., `slidev-theme-dracula`)

The init script handles this automatically. When changing themes manually, use the correct package name format.

**Official Themes** (package: `@slidev/theme-<name>`):
| Theme | Style | Best For | Preview |
|-------|-------|----------|---------|
| `seriph` | Elegant serif | Conference talks, keynotes | ![seriph](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/seriph.png) |
| `default` | Clean minimal | Internal meetings, docs | ![default](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/default.png) |
| `apple-basic` | Apple-inspired | Product demos, launches | ![apple-basic](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/apple-basic.png) |
| `shibainu` | Warm friendly | Team updates, casual talks | ![shibainu](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/shibainu.png) |
| `bricks` | Bold colorful | Creative pitches, workshops | ![bricks](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/bricks.png) |

**Community Themes** (package: `slidev-theme-<name>`):
| Theme | Style | Best For | Preview |
|-------|-------|----------|---------|
| `dracula` | Dark purple | Developer talks, tech deep-dives | ![dracula](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/dracula.png) |
| `academic` | Paper-style | Thesis defense, research talks | ![academic](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/academic.png) |
| `frankfurt` | Beamer-inspired | Academic conferences | ![frankfurt](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/frankfurt.png) |
| `unicorn` | Rainbow/playful | Creative demos, fun topics | ![unicorn](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/unicorn.png) |
| `penguin` | Personal brand | Personal presentations | ![penguin](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/penguin.png) |
| `eloc` | Writing-focused | Documentation, tutorials | ![eloc](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/eloc.png) |
| `excali-slide` | Excalidraw/hand-drawn | Whiteboard-style talks, sketchy feel | ![excali-slide](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/excali-slide.png) |
| `mint` | Fresh minimal | Clean presentations | ![mint](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/mint.png) |
| `neversink` | Modern academic | Academic presentations | ![neversink](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/neversink.png) |
| `the-unnamed` | VS Code theme | Developer audiences | ![the-unnamed](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/the-unnamed.png) |
| `mokkapps` | Professional | Tech talks, conferences | ![mokkapps](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/mokkapps.png) |
| `hep` | Scientific | Physics, science presentations | ![hep](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/hep.png) |
| `geist` | Vercel design system | Tech/startup, clean modern | ![geist](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/geist.png) |
| `nord` | Arctic muted palette | Calm aesthetic, developer talks | ![nord](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/nord.png) |
| `purplin` | Vibrant purple | Creative, marketing pitches | ![purplin](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/purplin.png) |
| `takahashi` | Large bold text | Impact talks, lightning talks | ![takahashi](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/takahashi.png) |
| `scholarly` | LaTeX Beamer-style | Thesis defense, academic papers | ![scholarly](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/scholarly.png) |
| `neocarbon` | Dark cinematic, glass morphism | Corporate pitches, investor decks | ![neocarbon](https://s3.amazonaws.com/cdn.cc.tools/slidev-themes/neocarbon.png) |

## Auto-Selection Guide

Match topic to theme:

| Topic/Audience | Recommended Theme | Package Type |
|----------------|-------------------|--------------|
| Tech conference, keynote | `seriph` | Official |
| Developer/engineering | `dracula` or `the-unnamed` or `nord` | Community |
| Startup pitch, investor | `seriph` or `neocarbon` | Official/Community |
| Corporate pitch deck | `neocarbon` | Community |
| Product launch, demo | `apple-basic` | Official |
| Tech/startup company | `geist` | Community |
| Internal team meeting | `default` | Official |
| Workshop, training | `shibainu` | Official |
| Creative/marketing | `bricks` or `unicorn` or `purplin` | Official/Community |
| Meetup, community talk | `penguin` or `mokkapps` | Community |
| Lightning talk, impact | `takahashi` | Community |
| Thesis defense, research | `academic` or `scholarly` or `frankfurt` | Community |
| Scientific/physics | `hep` or `neversink` | Community |
| Whiteboard/sketch style | `excali-slide` | Community |
| Calm/aesthetic | `nord` or `mint` | Community |

## Selection Flow

1. **User specifies theme** → Use that theme
2. **User doesn't specify** → Show 3-5 recommended theme preview images inline using markdown `![name](url)` syntax from the tables above, each with a one-line description of why it fits. Then ask the user to pick one.
3. **User says "auto" or "你选"** → Agent picks based on content topic

## Changing Theme Later

To change theme after init:
1. Edit `theme:` in slides.md frontmatter (e.g., `theme: dracula`)
2. Update package.json dependency with correct package name:
   - **Official themes**: `"@slidev/theme-<name>": "latest"` (default, seriph, apple-basic, shibainu, bricks)
   - **Community themes**: `"slidev-theme-<name>": "latest"` (all others)
3. Run `pnpm install` (or `npm install`)
4. Rebuild with `pnpm build` and redeploy using the `rebyte-app-builder` skill

Example for switching to `dracula` (community theme):
```json
"dependencies": {
  "@slidev/cli": "^51.0.0",
  "slidev-theme-dracula": "latest"
}
```

Example for switching to `bricks` (official theme):
```json
"dependencies": {
  "@slidev/cli": "^51.0.0",
  "@slidev/theme-bricks": "latest"
}
```
