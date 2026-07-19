---
version: 1
name: anyfinancial-financial-templates
description: Template-only financial analysis workflows for statement analysis, valuation analysis, company research, industry research, and finance-specific output patterns. Use when the user asks for a financial analysis structure, report outline, model rubric, or reusable instructions rather than live data retrieval.
---

# Financial Templates

Financial Templates is the non-API pillar of the stock-analysis skill. These files are
template and instruction patterns only. They do not fetch data, do not make live
claims, and do not replace source-grounded research.

## Route by Task

| User intent | Template |
|---|---|
| Analyze income statement, balance sheet, cash flow, or financial ratios | `statement-analysis.md` |
| Build valuation framing, DCF/comps/SOTP outline, sensitivity table | `valuation-analysis.md` |
| Research a company, business model, risks, catalysts, competitive position | `company-research.md` |
| Analyze an industry, market structure, demand drivers, competitors | `industry-research.md` |
| Format finance-specific outputs, caveats, data provenance, citations | `output-patterns.md` |
| Daily market review / "复盘 + 交易指南" — whole-market capital state, ETF flows, sector migration, tech mainline, strong-pool tiers, holdings, next-day trading guide | `daily-market-review.html` (ready-to-fill Kami HTML) |

## Usage Rules

- Clearly label outputs from this pillar as **templates** or **analysis
  frameworks** unless populated with verified data.
- If the user asks for prices, filings, news, or fundamentals, pull them from
  the data lake first (`../data/SKILL.md`) and state the data date.
- If the user asks for strategy performance, route to `../backtesting/SKILL.md`.
- Do not invent financial figures. Use placeholders like `<Revenue>` or cite the
  data source used to fill them.
- Include date ranges, currency, units, and source provenance fields in any
  populated template.
- When a populated template is rendered as HTML for the user, style it with the
  **Kami design system** (mandatory — parchment `#f5f4ed` canvas, ink-blue
  `#1B365D` accent, serif-led, editorial whitespace; embed
  `../report-style/styles.css`), **upload it to the Artifact Store**, and
  reference it with a `<rebyte-artifacts>` tag containing only the file name. Do
  not paste the HTML inline. See `../report-style/README.md`,
  `output-patterns.md#html-artifact-output`, and the top-level `SKILL.md`.

## Files

```
SKILL.md                 — router for template workflows
statement-analysis.md    — statement and ratio analysis structure
valuation-analysis.md    — DCF, comps, SOTP, sensitivity template
company-research.md      — company research memo template
industry-research.md     — industry and market structure template
output-patterns.md       — finance-specific output and instruction patterns
daily-market-review.html — daily market review + next-day trading guide (Kami HTML template)
```

## Daily Market Review template (`daily-market-review.html`)

A ready-to-fill, Kami-styled HTML template for a daily market-close review plus
next-session trading guide (modeled on the A-share "复盘 + 交易指南" report).
Sections, in order:

- Header (title, 生成时间 / 数据口径 / 注意 provenance).
- §0 一句话 (headline read + trading-priority list) · §1 全市场资金状态 ·
  §2 ETF 观察 · §3 行业迁移 (资金流入 / 流出) · §4 科技主线拆解 ·
  §5 板块资金周期 (5.1 板块层 · 5.2 建仓周期 · 5.3 资金行为拆解 · 5.4 外圈扩散/回避) ·
  §6 低点返单验证 · §7 新强势池 (A/B/C 档) · §8 持仓/重点票 ·
  §9 交易指南 (开盘前预案 · 确认条件 · 具体打法) · §10 指标解释 · §11 数据文件.

How to fill:

- Replace every `{{TOKEN}}` with real data; duplicate rows/blocks flagged by a
  `repeat` comment, and delete sample rows and any section that doesn't apply
  (keep the numbered skeleton stable so days stay comparable).
- Wrap numbers in `<span class="pos">` (up/inflow), `<span class="neg">`
  (down/outflow), or `<span class="flat">`; keep units (`e` = 亿元). Put
  tickers/price levels in `<code>`.
- Styling is the shared Kami layer — the template `<link>`s
  `../report-style/styles.css` then `../report-style/report.css` and carries no
  inline CSS. Leave those links; at delivery point them at the hosted
  public-artifact URLs or bundle `report-style/` alongside (see
  `../report-style/README.md`). The doc is `lang="zh-CN"` for the CJK serif.
- Deliver as an uploaded HTML artifact (see `output-patterns.md`), never inline.
- Fill only with verified L2/quote/EOD data (route Phase 1 skills first); do not
  invent flows, tickers, or price levels.
