# Report Style — Kami design system (MANDATORY for all HTML reports)

Every HTML report this skill delivers — backtest reports, valuation/DCF
write-ups, statement/industry/company research, real-time snapshots, any
dashboard or chart page — **MUST be styled with the Kami design system**.
Report *content* (numbers, provenance, structure) is decided by the pillar
skills; report *form* (color, type, spacing, layout) is **always Kami, with no
exceptions**.

This is the single source of truth for report styling. The pillar SKILLs point
here.

## Two-part architecture (shared style + content template)

Every report artifact is **two parts**:

1. **The shared Kami style** — `styles.css` + `report.css` in this directory.
   These are shared, versioned once, and reused by every report.
2. **A content template** — an HTML file (e.g.
   `../financial-templates/daily-market-review.html`,
   `../financial-charts/templates/price-chart.html`) that holds **only content
   and structure** (HTML + placeholders) and **links** the two stylesheets.

Templates carry **no inline CSS** and no duplicated Kami tokens. All colors,
type, spacing, tables, and components come from the two shared stylesheets. To
restyle every report, edit `report.css` (or `styles.css`) once — never a
template. Load order is fixed: **`styles.css` first, then `report.css`.**

## Files in this directory

| File | Role |
|---|---|
| `styles.css` | Canonical Kami stylesheet — design tokens, per-language serif stacks, and Kami components. Load first. |
| `report.css` | The skill's **report layer**, built entirely on Kami tokens: document flow, `.section-title`/subsections, `.kami-table` (+ `financial`/`striped`/`compact`/`total`), semantic `.pos`/`.neg`/`.flat` numbers, `.readnote` callouts, tier `.tag`s, and the `financial-charts` page chrome (incl. `--chart-*` tokens the chart JS reads). Load after `styles.css`. |
| `CHEATSHEET.md` | One-page quick reference — scan before building a report. |
| `design.md` | Full Kami spec. Consult for anything not covered by the cheatsheet. |

`styles.css`, `CHEATSHEET.md`, `design.md` come from
[tw93/Kami](https://github.com/tw93/Kami) (`styles.css`, `CHEATSHEET.md`,
`references/design.md`) — refresh with the same raw paths. `report.css` is
Owned by this skill; edit it here, not upstream.

## The five non-negotiables

1. **Warm parchment canvas** — page background is `#f5f4ed` (`--parchment`),
   **never pure white**. Cards/lifted surfaces use ivory `#faf9f5`.
2. **Ink-blue accent** — a single accent, `#1B365D` (`--brand`): section-title
   left bar, emphasized numbers, links, CTAs. Keep it to ≤5% of the surface.
3. **Serif-led hierarchy** — one serif family for the whole page (headings and
   body), weight locked at 500, **no bold, no italic**. Emphasize with
   `color: var(--brand)`, not weight.
4. **Warm grays only** — every gray carries a yellow-brown undertone
   (`--near-black #141413`, `--olive #504e49`, `--stone #6b6a64`,
   `--border #e8e6dc`). No cool blue-grays.
5. **Editorial whitespace** — generous margins and section spacing (4pt base
   scale; 40–60pt between major sections), signature 2.5pt brand left bar on
   section titles, quiet "whisper" shadows over hard drop shadows.

See `CHEATSHEET.md` for the full color/type/spacing tables and the ready-made
CSS snippets (`.section-title`, `.kami-table`, `.metric`, `.card`, `.quote`).

## Wiring Kami into a report

The content template **links** the two shared stylesheets — it never inlines or
copies them. Structure the document with the shared classes and set the language
on the root so the correct serif stack applies (`<html lang="zh-CN">` → CJK
serif; `<html lang="en">` → English serif — the fonts are keyed off `lang`).

```html
<link rel="stylesheet" href="<styles.css>">   <!-- Kami tokens + components — first -->
<link rel="stylesheet" href="<report.css>">   <!-- report layer — after styles.css -->
```

Resolving the two `href`s — pick per how the report is delivered:

- **Hosted (single-file HTML delivery).** Upload `styles.css` and `report.css`
  once to the Artifact Store with `"public": true` and set each `href` to the
  returned `publicUrl` (absolute URL — never a relative path, never a
  `raw.githubusercontent.com` URL). The report HTML stays a single delivered
  file that pulls its style from the two hosted stylesheets.
- **Bundled.** Ship the report HTML alongside a copy of `report-style/` and use
  relative hrefs (`../report-style/styles.css`). This is also what the in-repo
  templates use so they preview when served from the repo root.

Either way the artifact is **two parts**: the shared style (styles.css +
report.css) and the content HTML. Do not fold the CSS back into the HTML.

### Minimal skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>AAPL DCF — 2026-07-05</title>
  <link rel="stylesheet" href="<styles.css>">
  <link rel="stylesheet" href="<report.css>">
</head>
<body>
  <div class="page">
    <h1 class="report-title">Apple Inc. — Discounted Cash Flow</h1>
    <div class="section-title">Executive Read</div>
    <p>…</p>
    <div class="section-title">Valuation</div>
    <table class="kami-table financial">…</table>
    <!-- provenance: source, as-of date, currency, units, period basis -->
  </div>
</body>
</html>
```

## Rules

- No pure-white backgrounds, no bold serif, no italic, no cool grays, no second
  accent color. If a chart needs more series, use the Kami neutral ramp
  (`#1B365D` → `#504e49` → `#6b6a64` → `#b8b7b0` → `#d4d3cd` → `#EEF2F7`).
- **No inline CSS in templates.** A template links `styles.css` + `report.css`
  and contains only content + structure. Shared styling changes go in
  `report.css`, never copied into a template. New shared components belong in
  `report.css`; per-report one-offs are the rare exception, not the norm.
- Kami controls form only. It does **not** relax any content rule: provenance
  fields (source, as-of date, currency, units, period basis), backtest
  limitations, and valuation assumptions must still appear inside the report.
- When in doubt, follow `CHEATSHEET.md`; for anything it does not cover, follow
  `design.md`. First principles: *serif carries authority, warm gray carries
  rhythm, ink-blue carries focus.*

## Responsive / mobile

`report.css` makes every report render cleanly on phones — no left-right swipe /
horizontal page scroll. It is handled centrally in the shared layer, so
templates need nothing extra:

- The page never scrolls sideways (`html, body { overflow-x: hidden }`); prose,
  metadata, and long `<code>` tokens wrap.
- Container padding and the type scale step down at `≤768px` and again at
  `≤420px`; the chart canvas shortens.
- **Wide tables scroll inside their own box, not the page.** At `≤768px` a
  `.kami-table` becomes a horizontal scroll container (its columns stay aligned),
  so every column is reachable by swiping the table while the page stays put.
  You may also wrap any table in `<div class="table-scroll">` to force this at
  any width. Keep tables as `.kami-table`; don't set fixed pixel widths on cells.
