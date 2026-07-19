# Financial Statement Analysis Template

**Template status:** This is a reusable structure. Populate it only with verified
company filings, provider fundamentals, or user-supplied data.

## Inputs

- Company: `<Company / ticker>`
- Periods: `<FY2023-FY2026, quarterly, TTM, etc.>`
- Currency and units: `<USD millions>`
- Source: `<filing URL, provider endpoint, spreadsheet, etc.>`

## Output Structure

### Executive Read

- Revenue trend: `<growth, mix, one-off drivers>`
- Profitability: `<gross margin, operating margin, net margin>`
- Balance sheet: `<cash, debt, working capital, leverage>`
- Cash conversion: `<CFO, capex, FCF, FCF margin>`
- Quality flags: `<restatements, one-time items, accounting changes>`

### Core Table

| Metric | Period 1 | Period 2 | Period 3 | Read |
|---|---:|---:|---:|---|
| Revenue | `<value>` | `<value>` | `<value>` | `<trend>` |
| Gross margin | `<value>` | `<value>` | `<value>` | `<trend>` |
| Operating margin | `<value>` | `<value>` | `<value>` | `<trend>` |
| Net income | `<value>` | `<value>` | `<value>` | `<trend>` |
| CFO | `<value>` | `<value>` | `<value>` | `<trend>` |
| Capex | `<value>` | `<value>` | `<value>` | `<trend>` |
| FCF | `<value>` | `<value>` | `<value>` | `<trend>` |

### Ratio Checks

- Growth: revenue CAGR, EPS CAGR, FCF CAGR.
- Margins: gross, operating, EBITDA if sourced, net, FCF.
- Leverage: net debt / EBITDA, debt / equity, interest coverage.
- Liquidity: current ratio, quick ratio, cash runway if relevant.
- Efficiency: asset turnover, inventory turns, DSO/DPO if data supports it.

## Required Caveats

- State whether numbers are annual, quarterly, TTM, reported, adjusted, or
  normalized.
- Identify currency and units.
- Separate reported facts from analyst interpretation.
- Flag missing data rather than filling gaps by assumption.
