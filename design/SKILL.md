---
name: design
description: Create and refine visual designs — logos, brand assets, UI mockups, illustrations, interactive artifacts — using AI image generation, design intelligence, and impeccable.style design skills for professional polish. Use when user wants to design a logo, create brand assets, build UI mockups, generate illustrations, or create and refine interactive visual artifacts.
---

# Design

Create visual design work, then refine it to professional quality using impeccable.style design skills.

## Sub-Skills

**Pre-installed (no setup needed):**
- `rebyteai/nano-banana` — AI image generation (text-to-image and image-to-image editing) via Google Gemini. Flash model for fast iteration, Pro model for 4K final output.
- `rebyteai/internet-search` — Research design trends, brand references, competitor visuals, and inspiration.
- `rebyteai/rebyte-app-builder` — Deploy finished designs as live web pages on rebyte.pro.

**Bundled impeccable.style commands (in `commands/` directory — no installation needed):**
All 20 design commands from impeccable.style are bundled in the `commands/` subdirectory. Read the SKILL.md in each command's directory to use it. Available commands: `/critique`, `/audit`, `/typeset`, `/arrange`, `/colorize`, `/bolder`, `/quieter`, `/distill`, `/animate`, `/polish`, `/adapt`, `/clarify`, `/overdrive`, `/delight`, `/harden`, `/normalize`, `/onboard`, `/extract`, `/optimize`, `/teach-impeccable`. The `commands/frontend-design/` directory contains the core design principles referenced by all commands.

**Requires installation (install before use):**
- `nextlevelbuilder/ui-ux-pro-max` — Design intelligence: 50+ styles, 97 color palettes, 57 font pairings, 99 UX guidelines.
- `anthropics/web-artifacts-builder` — Build interactive visual artifacts (React + Tailwind + shadcn/ui) bundled as single HTML files.

## Workflow

### Step 0: Install Required Skills

Before starting, install skills that are not pre-installed in the VM:

```bash
npx skills add -y nextlevelbuilder/ui-ux-pro-max-skill
npx skills add -y anthropics/skills
```

Run these commands first. They only need to be run once per session. The impeccable design commands are already bundled — no installation needed.

### Step 1: Understand the Design Brief

Parse what the user wants. Identify:
- **What** — Logo, icon set, illustration, UI mockup, landing page design, brand kit, social media graphics?
- **Style** — Minimalist, bold, playful, corporate, retro, futuristic? If unclear, suggest options using `ui-ux-pro-max` style database.
- **Colors** — Specific palette, or should you recommend one? `ui-ux-pro-max` has 97 palettes to choose from.
- **References** — Any brands, websites, or styles to draw inspiration from?
- **Output format** — Image files, interactive prototype, deployed web page?

If the request is clear, proceed. If not, ask about style and color preferences.

### Step 2: Research & Gather Inspiration (if needed)

Use `internet-search` when the user references a brand, competitor, or trend:
- Look up the brand's existing visual identity
- Find competitor designs for comparison
- Research current design trends in the relevant space

Skip this step if the user provides clear specifications or reference images.

### Step 3: Create

Choose your approach based on what's being created:

**Logo / Icon / Illustration / Brand Graphics:**
Use `nano-banana` for AI image generation.

1. Start with the **Flash model** for rapid iteration — generate 3-4 variations
2. Show variations to the user and get feedback
3. Refine the best option with adjusted prompts or image-to-image editing
4. Generate final version with **Pro model** at high resolution (2K or 4K)

Prompt tips for logos:
- Be specific about style: "flat vector logo", "3D metallic emblem", "hand-drawn wordmark"
- Include background preference: "on white background", "transparent-style", "dark background"
- Mention what to avoid: "no text", "simple shapes only", "no gradients"

**UI Mockup / Web Design:**
Use `ui-ux-pro-max` for design decisions, then build with `web-artifacts-builder`.

1. Consult `ui-ux-pro-max` for style, palette, and typography recommendations
2. Build the mockup as an interactive artifact (React + Tailwind + shadcn/ui)
3. This produces a real, clickable prototype — not a static image

**Brand Kit (logo + colors + typography + usage guidelines):**
Combine both approaches:
1. Generate the logo with `nano-banana`
2. Select color palette and font pairings from `ui-ux-pro-max`
3. Build a brand guidelines page with `web-artifacts-builder`
4. Deploy with `rebyte-app-builder`

**Social Media Graphics / Marketing Assets:**
Use `nano-banana` with specific aspect ratios:
- Instagram post: 1:1
- Instagram story: 9:16
- Twitter/LinkedIn header: 16:9
- Facebook cover: 21:9

### Step 4: Refine with Impeccable Skills

After creating the initial design, apply impeccable skills to elevate quality. Choose the skill that matches what needs improvement:

**Review & Evaluate:**
- `/audit` — Score accessibility, performance, and visual hierarchy with a P0-P3 report
- `/critique` — UX evaluation with persona-based testing and actionable feedback
- `/normalize` — Realign drifted UI to match design system standards

**Visual Refinement:**
- `/typeset` — Fix font choices, type hierarchy, sizing, and readability
- `/colorize` — Add strategic color to monochromatic or dull designs
- `/bolder` — Amplify bland designs with more visual impact and personality
- `/quieter` — Tone down aggressive or overstimulating designs to feel refined

**Layout & UX:**
- `/arrange` — Fix layout, spacing, visual rhythm, and hierarchy
- `/distill` — Strip unnecessary complexity, simplify
- `/clarify` — Improve UX copy, error messages, labels, and instructions
- `/onboard` — Design or improve onboarding flows, empty states, first-run experiences

**Motion & Delight:**
- `/animate` — Add purposeful micro-interactions, transitions, and hover effects
- `/delight` — Add moments of joy, personality, and memorable touches
- `/overdrive` — Push with technically ambitious effects: shaders, spring physics, scroll-driven reveals

**Production Quality:**
- `/polish` — Final quality pass fixing alignment, spacing, consistency details
- `/harden` — Error handling, i18n support, text overflow, edge case resilience
- `/adapt` — Make responsive across mobile, tablet, desktop with proper breakpoints
- `/optimize` — Fix performance: loading speed, rendering, animations, bundle size
- `/extract` — Consolidate reusable components, design tokens, and patterns

**Typical refinement flow:**
1. Create the initial design (Step 3)
2. Run `/audit` or `/critique` to identify issues
3. Apply targeted skills to fix what the audit found (e.g., `/typeset` for typography, `/arrange` for layout)
4. Run `/polish` as a final pass before delivery

You can apply multiple skills in sequence. Each one builds on the previous improvements.

### Step 5: Iterate

Design is iterative. After showing a version:
- "Make it more minimal" → Use `/distill` to strip complexity, or `/quieter` to reduce intensity
- "Try different colors" → Use `/colorize` or consult `ui-ux-pro-max` palettes
- "Make it bolder" → Use `/bolder` to amplify impact
- "Fix the typography" → Use `/typeset` to establish proper type hierarchy
- "Add some life to it" → Use `/animate` for micro-interactions or `/delight` for personality
- "Is it accessible?" → Use `/audit` for a scored accessibility report
- "Make it responsive" → Use `/adapt` for cross-device layouts

### Step 6: Deliver

Based on what was created:

**Image assets (logos, illustrations, graphics):**
- Upload final images to the Artifact Store
- Provide multiple formats if useful (e.g., logo on light + dark background)

**Interactive mockups / prototypes:**
- Deploy to rebyte.pro with `rebyte-app-builder`
- Share the live URL

**Brand kits:**
- Deploy the brand guidelines page
- Also upload individual assets to Artifact Store

## Decision Points

- **"nano-banana or web-artifacts-builder?"** — If the output is a static visual (logo, illustration, graphic), use `nano-banana`. If it's interactive or layout-heavy (UI mockup, prototype, dashboard design), use `web-artifacts-builder`. Brand kits use both.

- **"Flash or Pro model?"** — Use Flash for iterations and exploration (fast). Switch to Pro for the final version (higher quality, 4K).

- **"Which impeccable skill?"** — Match the skill to the problem: typography issues → `/typeset`, layout issues → `/arrange`, too bland → `/bolder`, too loud → `/quieter`, pre-launch → `/polish`. When unsure, start with `/audit` or `/critique` to get a scored report that tells you what to fix.

- **"The user wants something nano-banana can't do well"** — AI image generation struggles with precise text in images and exact geometric layouts. For those, build with `web-artifacts-builder` (HTML/CSS gives pixel-perfect control), then refine with impeccable skills.
