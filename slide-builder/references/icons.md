# Icons vs Emoji Guide

This project includes `@iconify-json/mdi` (Material Design Icons) and `@iconify-json/logos` (brand logos).

## When to Use What

**Use MDI icons `<mdi-* />` for:**
- Functional indicators: checkmarks, X marks, arrows, status icons
- UI elements: settings, search, menu, navigation
- List markers that indicate state (done/pending/error)
- Professional/technical presentations

**Use Logos icons `<logos-* />` for:**
- Technology brands: `<logos-vue />`, `<logos-react />`, `<logos-docker-icon />`
- Company logos in tech context

**Emoji is OK for:**
- Emotional/decorative use in casual presentations
- Section titles for visual interest (e.g., "🎉 Celebration")
- When the tone is informal/playful

## Examples

**Status List (use icons, not emoji):**
```markdown
<!-- ❌ Avoid for functional indicators -->
- ✅ Task completed
- ❌ Task failed
- ⏳ In progress

<!-- ✅ Preferred - cleaner, consistent rendering -->
- <mdi-check class="text-green-500" /> Task completed
- <mdi-close class="text-red-500" /> Task failed
- <mdi-clock class="text-yellow-500" /> In progress
```

**Tech Stack (use logos, not emoji):**
```markdown
<!-- ❌ Avoid -->
🟢 Node.js | 🔵 TypeScript | 🐳 Docker

<!-- ✅ Preferred - actual brand logos -->
<logos-nodejs-icon /> Node.js | <logos-typescript-icon /> TypeScript | <logos-docker-icon /> Docker
```

## Quick Reference Table

| Need | ❌ Don't use | ✅ Use instead |
|------|-------------|----------------|
| Checkmark | ✓ ✔️ | `<mdi-check />` |
| Arrow | → ➡️ | `<mdi-arrow-right />` |
| Star | ⭐ ★ | `<mdi-star />` |
| Warning | ⚠️ | `<mdi-alert />` |
| Info | ℹ️ | `<mdi-information />` |
| GitHub | 🐙 | `<mdi-github />` |
| Email | 📧 ✉️ | `<mdi-email />` |
| Settings | ⚙️ | `<mdi-cog />` |
| Search | 🔍 | `<mdi-magnify />` |
| User | 👤 | `<mdi-account />` |

## Common MDI Icons

```markdown
<mdi-check />           <!-- checkmark -->
<mdi-close />           <!-- X / close -->
<mdi-plus />            <!-- plus -->
<mdi-minus />           <!-- minus -->
<mdi-arrow-right />     <!-- arrow -->
<mdi-star />            <!-- star -->
<mdi-heart />           <!-- heart -->
<mdi-github />          <!-- GitHub -->
<mdi-rocket-launch />   <!-- rocket -->
<mdi-lightbulb />       <!-- idea -->
<mdi-chart-line />      <!-- chart -->
<mdi-clock />           <!-- time -->
<mdi-calendar />        <!-- date -->
<mdi-folder />          <!-- folder -->
<mdi-file-document />   <!-- document -->
```

## Brand Logos

Use `logos-*` for tech brands:

```markdown
<logos-vue />
<logos-react />
<logos-typescript-icon />
<logos-nodejs-icon />
<logos-python />
<logos-docker-icon />
<logos-kubernetes />
<logos-aws />
<logos-google-cloud />
```

## Styling Icons

```markdown
<mdi-check class="text-green-500" />
<mdi-star class="text-yellow-500 text-2xl" />
<mdi-github class="text-3xl" />
```
