# Valuation Analysis Template

**Template status:** This is a framework, not a valuation result. Populate it
with verified market data, fundamentals, and explicit assumptions.

## Inputs

- Company / asset: `<name>`
- Valuation date: `<YYYY-MM-DD>`
- Currency and units: `<USD millions>`
- Share count / net debt source: `<source>`
- Forecast source: `<management, consensus, user case, internal model>`

## Valuation Methods

### Trading Comparables

| Peer | Market cap | EV | Revenue growth | EBITDA margin | EV/Revenue | EV/EBITDA | P/E |
|---|---:|---:|---:|---:|---:|---:|---:|
| `<Peer>` | `<value>` | `<value>` | `<value>` | `<value>` | `<value>` | `<value>` | `<value>` |

Read:
- Peer selection rationale.
- Premium/discount drivers.
- Outliers removed and why.

### DCF

| Assumption | Base | Bear | Bull |
|---|---:|---:|---:|
| Revenue CAGR | `<%>` | `<%>` | `<%>` |
| Terminal margin | `<%>` | `<%>` | `<%>` |
| Tax rate | `<%>` | `<%>` | `<%>` |
| WACC | `<%>` | `<%>` | `<%>` |
| Terminal growth | `<%>` | `<%>` | `<%>` |

Required outputs:
- Enterprise value.
- Equity value.
- Implied price per share.
- Sensitivity to WACC and terminal growth.

### SOTP

Use when business segments have distinct economics or peer sets.

| Segment | Metric | Multiple | Enterprise value | Notes |
|---|---:|---:|---:|---|
| `<Segment>` | `<value>` | `<value>` | `<value>` | `<rationale>` |

## Required Caveats

- Label assumptions as assumptions.
- Do not present valuation as investment advice.
- Include valuation date because market prices and multiples change.
- Show sensitivity; do not provide a single-point estimate alone.
