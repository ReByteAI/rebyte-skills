# Creating PDFs

**Every new PDF is generated as HTML + CSS, then rendered by WeasyPrint.** The visual language is the Kami design system — warm parchment canvas, serif-led hierarchy, ink-blue accent, tight editorial rhythm. One constraint language for both pre-built templates and custom documents.

> Design system adapted from [tw93/kami](https://github.com/tw93/kami) (MIT). See `KAMI_LICENSE.txt`.

## Pick a Path

Decide the user's language first (CN `*.html` / EN `*-en.html` / JA → CJK path). Then:

### Path A — Pre-built Template (80% of cases)

Match the user's ask to one of the templates in `assets/templates/`:

| User says | Template | Page cap |
|---|---|---|
| "one-pager / exec summary / briefing / single-page summary" | `one-pager.html` / `one-pager-en.html` | 1 |
| "white paper / long doc / annual report / technical report" | `long-doc.html` / `long-doc-en.html` | — |
| "formal letter / cover letter / recommendation letter / memo" | `letter.html` / `letter-en.html` | 1 |
| "portfolio / case studies / project showcase" | `portfolio.html` / `portfolio-en.html` | — |
| "resume / CV" | `resume.html` / `resume-en.html` | 2 |
| "equity report / valuation / investment memo / stock analysis" | `equity-report.html` / `equity-report-en.html` | 3 |
| "changelog / release notes / version history" | `changelog.html` / `changelog-en.html` | 2 |

If two templates are close, ask the user in one line rather than guess.

### Path B — Custom Document

When nothing in the template table fits (e.g. "design spec", "lab notebook", "menu", "invoice variant"), build fresh HTML using the same design system:

1. Read `references/design.md` for tokens (canvas, ink, accent, margins, type scale)
2. Read `references/cheatsheet.md` for the non-negotiable rules
3. Start from the closest template as a scaffold (copy its `<style>` block — identical tokens, identical `@page`)
4. Replace the body with the user's content
5. Render the same way (see Rendering below)

Custom documents should feel indistinguishable from templated ones. Same canvas, same fonts, same vertical rhythm.

## Workflow

### 1. Confirm language and document type

Match the user's language. If ambiguous ("help me make a resume"), ask one line to confirm CN vs EN.

### 2. Copy the template to a working file

Templates use `../fonts/` relative paths, so the simplest flow is to render from the templates directory itself. Copy rather than modify in place:

```bash
TEMPLATE=resume-en
SKILL=/home/user/.skills/pdf
WORK=/tmp/kami-work-$$
mkdir -p "$WORK"
cp "$SKILL/assets/templates/$TEMPLATE.html" "$WORK/doc.html"
ln -s "$SKILL/assets/fonts" "$WORK/fonts"
# Rewrite font paths from ../fonts/ to fonts/
sed -i 's|\.\./fonts/|fonts/|g' "$WORK/doc.html"
```

### 3. Fill the placeholders

Templates use `{{UPPERCASE}}` placeholders. Read the full template first to see every placeholder, then rewrite the HTML body with the user's content. Do **not** leave any `{{...}}` unfilled — WeasyPrint will render them literally.

Before writing the final file, scan for `{{` and `}}` — any hits need to be filled or removed.

### 4. Fill PDF metadata

Templates expose `<meta>` tags for title, author, description, keywords. WeasyPrint reads these into the PDF. Fill them — they're what shows up in Preview / Acrobat's "Get Info".

### 5. Render

```bash
cd "$WORK"
python3 -c "from weasyprint import HTML; HTML('doc.html').write_pdf('out.pdf')"
```

**CWD matters.** `@font-face` uses relative paths. Run WeasyPrint from the directory that can resolve the fonts.

### 6. Verify

- **Page count**: check it matches the cap (1 / 2 / 3). If it overflows, tighten copy first, then `font-size`, then margins — in that order.
- **Font rendering**: open the PDF and confirm no missing-glyph boxes (`□`) on CJK pages. If any, see troubleshooting in `references/production.md`.
- **Placeholders**: `grep "{{" out.pdf` should find nothing (well, PDFs aren't text — use `pdftotext out.pdf - | grep '{{'` or open and eyeball).

Full build-and-check tooling: `python3 scripts/build.py --verify <name>` (runs page-count + font checks).

## Quick Render Cheat

The minimum viable command once the HTML is staged and fonts resolvable:

```python
from weasyprint import HTML
HTML('doc.html').write_pdf('out.pdf')
```

## Dependencies

```bash
pip install weasyprint pypdf --break-system-packages

# Linux first-time setup
apt install -y libpango-1.0-0 libpangoft2-1.0-0 fonts-noto-cjk
```

## Deeper References

- **`references/design.md`** — design tokens, type scale, layout rules, color palette
- **`references/production.md`** — WeasyPrint pipeline, known pitfalls (16 documented), font setup
- **`references/writing.md`** — tone, rhythm, bilingual conventions, headline patterns
- **`references/diagrams.md`** — 14 diagram primitives (architecture, flowchart, timeline, charts, etc.) for embedding
- **`references/cheatsheet.md`** — one-page rules summary; read first on every creation task
- **`references/tokens.json`** — machine-readable design tokens
- **`references/stabilizer_profiles.json`** — per-document-type QA profiles

## Fonts

Bundled in `assets/fonts/`:
- **TsangerJinKai02** (W04, W05) — Chinese serif, the default CN body font
- **JetBrainsMono** — mono/code

Fallback chains (embedded in every template):

```css
/* English */ font-family: Charter, Georgia, Palatino, "Times New Roman", serif;
/* Chinese */ font-family: "TsangerJinKai02", "Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", Georgia, serif;
/* Japanese */ font-family: "YuMincho", "Yu Mincho", "Hiragino Mincho ProN", "Noto Serif CJK JP", "Source Han Serif JP", "TsangerJinKai02", Georgia, serif;
```

**Licensing note**: TsangerJinKai02 is free for personal use; commercial use requires a license from tsanger.cn. The license responsibility rests with the end user. If the user explicitly requires a commercially unrestricted setup, swap the Chinese font family in the template's `<style>` block to `"Source Han Serif SC"` / `"Noto Serif CJK SC"` (SIL OFL, commercial-free) and re-render — the fallback chain already covers this.

## Diagrams Inside Documents

When a long-doc / portfolio / slide needs a diagram (architecture, flowchart, quadrant, timeline, bar/line/donut chart, state machine, swimlane…), see `references/diagrams.md`. The diagram HTMLs in `assets/diagrams/` are self-contained and can be inlined as iframes or `<object>` — or the SVG can be extracted and embedded directly.

## What NOT to do

- ❌ Don't try to render raw Markdown. This skill does not ship a Markdown → PDF path anymore. If the user only has a `.md`, read it, map its structure to the nearest template, and write HTML.
- ❌ Don't use Unicode subscript/superscript (₀₁₂ / ⁰¹²) — Charter / Palatino don't carry those glyphs. Use `<sub>` / `<sup>` tags.
- ❌ Don't use `rgba()` for tag backgrounds — WeasyPrint has a double-rectangle bug. Use solid hex (see `references/cheatsheet.md`).
- ❌ Don't mix stylistic languages (e.g. Tufte sidenotes inside a consulting report). Stay consistent with the chosen template or a clean custom derivation.
- ❌ Don't ship without reading every placeholder. Unfilled `{{...}}` in production output is the most common failure mode.
