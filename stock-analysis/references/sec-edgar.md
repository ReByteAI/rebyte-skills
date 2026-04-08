# SEC EDGAR Reference (EdgarTools)

## Setup

```bash
pip install edgartools
```

```python
from edgar import Company, set_identity
set_identity("Rebyte Agent agent@rebyte.ai")  # SEC legal requirement
```

---

## Company Financial Statements

```python
company = Company("AAPL")

# Income statement — revenue, earnings, margins
income = company.income_statement(periods=5)
print(income)

# Balance sheet — assets, liabilities, equity
balance = company.balance_sheet(periods=3)

# Cash flow — operating, investing, financing
cashflow = company.cash_flow_statement(periods=3)
```

**Token efficiency:** Always call `.to_context()` first for summaries (56-89% fewer tokens), then drill down.

---

## Accessing Filings

```python
company = Company("AAPL")

# Annual reports
filings_10k = company.get_filings(form="10-K")
latest_10k = filings_10k.latest()
print(latest_10k.to_context())  # Summary (~50 tokens)

# Quarterly reports
filings_10q = company.get_filings(form="10-Q")

# Current events
filings_8k = company.get_filings(form="8-K")

# Insider trades
insider_filings = company.get_filings(form="4")
for f in insider_filings[:10]:
    print(f.to_context())
```

### XBRL Financial Data (detailed single-period)

```python
filing = company.get_filings(form="10-K").latest()
xbrl = filing.xbrl()
statements = xbrl.statements
income_stmt = statements.income_statement
balance_sheet = statements.balance_sheet
```

---

## Common Workflows

### Revenue Comparison Across Companies
```python
for ticker in ["AAPL", "MSFT", "GOOGL"]:
    company = Company(ticker)
    income = company.income_statement(periods=3)
    print(f"\n{ticker}:")
    print(income)
```

### Track Insider Trading
```python
company = Company("TSLA")
insider = company.get_filings(form="4")
for f in insider[:10]:
    print(f.to_context())
```

### Multi-Year Trend
```python
company = Company("AMZN")
income = company.income_statement(periods=20)  # 20 quarters = 5 years
balance = company.balance_sheet(periods=20)
```

### Search Within Filings
```python
filing = company.get_filings(form="10-K").latest()
results = filing.search("climate risk")  # Search WITHIN the filing document
```

---

## Form Types

| Form | Description | Use Case |
|------|-------------|----------|
| **10-K** | Annual report | Full-year financials, business description |
| **10-Q** | Quarterly report | Quarterly financials |
| **8-K** | Current report | Material events (M&A, exec changes) |
| **DEF 14A** | Proxy statement | Executive comp, board info |
| **4** | Insider trading | Stock transactions by insiders |
| **13F** | Institutional holdings | What hedge funds own |
| **S-1** | IPO registration | Pre-IPO filings |

---

## Key Objects

| Object | Key methods |
|--------|------------|
| `Company(ticker)` | `.income_statement()`, `.balance_sheet()`, `.cash_flow_statement()`, `.get_filings()`, `.to_context()` |
| `Filing` | `.to_context()`, `.xbrl()`, `.text()`, `.search()`, `.filing_date`, `.form` |
| `XBRL` | `.statements`, `.facts`, `.to_context()` |
| `Statement` | `print(stmt)`, `.to_dataframe()` |

---

## Anti-Patterns

- **DON'T** parse financials from raw filing text — use `.income_statement()` or `.xbrl()`
- **DON'T** load full filing text (50K+ tokens) when you only need metadata — use `.to_context()`
- **DON'T** forget `set_identity()` — SEC will reject requests without it
