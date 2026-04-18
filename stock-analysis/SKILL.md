---
version: 1
name: stock-analysis
description: "Comprehensive stock and company analysis with real market data. Covers price history, technical analysis, company research, news sentiment, SEC filings, insider trading, and multi-stock comparison. Use when user mentions stock tickers, asks about stock prices, company analysis, investment research, or financial data. Triggers: stock symbol (AAPL, TSLA), 'stock price', 'analyze stock', 'compare stocks', 'company financials', 'insider trading', 'SEC filing', 'is X a good buy', 'stock chart', 'price history'. Do NOT use for full-blown multi-source research reports (use financial-deep-research instead)."
---

# Stock Analysis

Comprehensive stock and company analysis using real-time market data and SEC filings.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

## Data Sources

| Source | What it provides | How to access |
|--------|-----------------|---------------|
| **Market Data API** | OHLCV bars, news w/ sentiment, company details, financials, dividends, splits | REST API via `$API_URL` (see below) |
| **SEC EDGAR** | 10-K, 10-Q, 8-K full text, insider trades, detailed financial statements | `edgartools` Python library (see [references/sec-edgar.md](references/sec-edgar.md)) |

**Market Data coverage:** All US tickers, 5 years history, 15-min delayed quotes, no rate limits.

**When to use which for financials:**
- **Market Data API `financials`** — fast, structured, no setup needed. Use for revenue, earnings, margins, balance sheet, cash flow. Covers annual, quarterly, and TTM.
- **SEC EDGAR** — use when you need full filing text, specific filing sections (risk factors, MD&A), or data the API doesn't cover.

---

## Analysis Workflows

### 1. Quick Stock Check
```
User: "What's AAPL doing?" / "AAPL price"
→ Get price bars (1day, last 1 month)
→ Get company details
→ Present: current price, recent trend, basic company info
```

### 2. Company Overview
```
User: "Tell me about NVDA" / "What does Tesla do?"
→ Get company details (name, sector, market cap, employees)
→ Get price bars (1day, last 3 months)
→ Get news (last 5 articles with sentiment)
→ Present: business summary, market position, recent performance, news sentiment
```

### 3. Technical Analysis
```
User: "Is TSLA a good buy?" / "AAPL technical analysis"
→ Get price bars (1day, last 6 months) — trend, support/resistance
→ Get price bars (1hour, last 5 days) — short-term momentum
→ Get news (last 10 articles) — sentiment context
→ Compute: moving averages, price range, volume trends
→ Present: trend direction, key levels, volume analysis, sentiment, outlook
```

### 4. Multi-Stock Comparison
```
User: "Compare AAPL vs MSFT vs GOOGL"
→ Get company details for each
→ Get price bars (1day, last 6 months) for each
→ Get news for each
→ Compare: market cap, price performance, sector, sentiment
→ Present: side-by-side table, relative performance chart data
```

### 5. Fundamental Deep Dive
```
User: "AAPL financials" / "NVDA revenue trend"
→ Get company details
→ Get financials (annual, 5 periods) — revenue, earnings, margins, cash flow
→ Get financials (quarterly, 4 periods) — recent quarterly trends
→ Get dividends (last 12) — dividend history and yield
→ Get price bars (1week, last 2 years) — long-term price context
→ Compute: revenue growth, margin trends, EPS trend, payout ratio
→ Present: revenue/earnings trends, margins, key ratios, dividend history
→ Optional: SEC EDGAR for full 10-K text if user needs filing details
```

### 6. Insider Activity
```
User: "Insider trading for TSLA" / "Are executives buying NVDA?"
→ SEC EDGAR: Form 4 filings (insider trades)
→ Get company details (executive context)
→ Get price bars (1day, last 3 months) — price context around trades
→ Present: recent transactions, insider sentiment, correlation with price
```

### 7. Due Diligence Package
```
User: "Full analysis of MSFT" / "Due diligence on AMD"
→ Get company details
→ Get price bars (1day, last 1 year)
→ Get financials (annual, 5 periods) — full financial history
→ Get financials (quarterly, 4 periods) — recent quarterly performance
→ Get dividends (last 12) — dividend track record
→ Get splits — historical splits
→ Get news (last 20 articles)
→ SEC EDGAR: latest 10-K and recent 8-K filings (for qualitative details)
→ SEC EDGAR: Form 4 insider trades
→ Present: comprehensive report with business overview, financials,
   valuation context, insider sentiment, risks, and news summary
```

### 8. Sector Research
```
User: "Compare cloud stocks" / "Best semiconductor stocks"
→ Identify relevant tickers
→ Get company details for each
→ Get price bars (1day, last 6 months) for each
→ Get news for sector keywords
→ Compare: market caps, performance, business focus
→ Present: sector overview, leaders, relative performance
```

---

## Trigger Patterns

**ALWAYS fetch data when the user mentions any of these. Do NOT answer from memory — use the APIs.**

| User intent | Required actions |
|------------|-----------------|
| Stock symbol mentioned (AAPL, $TSLA) | Get price bars + company details |
| "price", "chart", "how is X doing" | Get price bars (adjust interval/range to question) |
| "news", "what's happening with" | Get news (10+ articles) |
| "analyze", "research", "tell me about" | Company details + price bars + news |
| "compare", "vs", "versus" | All data for each stock, side-by-side |
| "buy", "sell", "good investment" | Price bars + news + financials (annual + quarterly) |
| "financials", "revenue", "earnings" | Get financials (annual + quarterly) |
| "dividend", "yield", "payout" | Get dividends |
| "split", "stock split" | Get splits |
| "insider", "who's buying/selling" | SEC EDGAR Form 4 filings |
| "10-K", "10-Q", "SEC filing" | SEC EDGAR filings |
| "sector", "industry" | Multiple stocks in sector |

---

## Market Data API Reference

### Get Price Bars (OHLCV)

```bash
curl -X POST "$API_URL/api/data/stocks/bars" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "interval": "1day",
    "from": "2024-12-01",
    "to": "2024-12-31"
  }'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ticker` | string | Yes | Stock symbol, UPPERCASE (e.g., `AAPL`) |
| `interval` | string | Yes | `1min`, `5min`, `15min`, `30min`, `1hour`, `4hour`, `1day`, `1week` |
| `from` | date | Yes | Start date (`YYYY-MM-DD`) |
| `to` | date | Yes | End date (`YYYY-MM-DD`) |

**Response fields:** `t` (timestamp), `o` (open), `h` (high), `l` (low), `c` (close), `v` (volume), `vw` (VWAP), `n` (trade count)

### Get News

```bash
curl -X POST "$API_URL/api/data/stocks/news" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "TSLA", "limit": 10}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ticker` | string | Yes | Stock symbol |
| `limit` | number | No | Max articles (default: 10, max: 100) |

**Response fields:** `title`, `description`, `author`, `publisher`, `publishedAt`, `url`, `tickers`, `keywords`, `sentiment` (positive/negative/neutral), `sentimentReasoning`

### Get Company Details

```bash
curl -X POST "$API_URL/api/data/stocks/details" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL"}'
```

**Response fields:** `ticker`, `name`, `description`, `market`, `primaryExchange`, `type`, `currencyName`, `marketCap`, `listDate`, `sicDescription`, `homepage`, `totalEmployees`

### Get Financials (Income Statement, Balance Sheet, Cash Flow)

```bash
curl -X POST "$API_URL/api/data/stocks/financials" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL", "timeframe": "annual", "limit": 5}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ticker` | string | Yes | Stock symbol, UPPERCASE |
| `timeframe` | string | No | `annual` (default), `quarterly`, or `ttm` |
| `limit` | number | No | Number of periods (default 5, max 20) |

**Response:** Array of periods, each containing:
- `companyName`, `fiscalPeriod` (FY, Q1-Q4, TTM), `fiscalYear`, `startDate`, `endDate`, `filingDate`
- `incomeStatement`: `revenues`, `cost_of_revenue`, `gross_profit`, `operating_expenses`, `operating_income_loss`, `net_income_loss`, `basic_earnings_per_share`, `diluted_earnings_per_share`, etc.
- `balanceSheet`: `assets`, `current_assets`, `noncurrent_assets`, `liabilities`, `current_liabilities`, `long_term_debt`, `equity`, `inventory`, `accounts_payable`, etc.
- `cashFlowStatement`: `net_cash_flow_from_operating_activities`, `net_cash_flow_from_investing_activities`, `net_cash_flow_from_financing_activities`, `net_cash_flow`, etc.
- `comprehensiveIncome`: `comprehensive_income_loss`, `other_comprehensive_income_loss`, etc.

Each field is `{ value: number, unit: "USD", label: "Human Label" }`.

### Get Dividends

```bash
curl -X POST "$API_URL/api/data/stocks/dividends" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL", "limit": 12}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ticker` | string | Yes | Stock symbol, UPPERCASE |
| `limit` | number | No | Number of dividends (default 12, max 50) |

**Response fields:** `cashAmount`, `currency`, `dividendType`, `exDividendDate`, `payDate`, `recordDate`, `declarationDate`, `frequency` (4=quarterly, 12=monthly, 2=semi-annual)

### Get Stock Splits

```bash
curl -X POST "$API_URL/api/data/stocks/splits" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ticker": "AAPL"}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `ticker` | string | Yes | Stock symbol, UPPERCASE |

**Response fields:** `executionDate`, `splitFrom`, `splitTo` (e.g., splitFrom=1, splitTo=4 means 1:4 split)

---

## Using with Python

```python
import subprocess, requests, json

# Auth setup
AUTH_TOKEN = subprocess.check_output(["/home/user/.local/bin/rebyte-auth"]).decode().strip()
with open('/home/user/.rebyte.ai/auth.json') as f:
    API_URL = json.load(f)['sandbox']['relay_url']
HEADERS = {"Authorization": f"Bearer {AUTH_TOKEN}", "Content-Type": "application/json"}

def get_bars(ticker, interval, from_date, to_date):
    r = requests.post(f"{API_URL}/api/data/stocks/bars", headers=HEADERS,
        json={"ticker": ticker, "interval": interval, "from": from_date, "to": to_date})
    return r.json()

def get_news(ticker, limit=10):
    r = requests.post(f"{API_URL}/api/data/stocks/news", headers=HEADERS,
        json={"ticker": ticker, "limit": limit})
    return r.json()

def get_details(ticker):
    r = requests.post(f"{API_URL}/api/data/stocks/details", headers=HEADERS,
        json={"ticker": ticker})
    return r.json()

def get_financials(ticker, timeframe='annual', limit=5):
    r = requests.post(f"{API_URL}/api/data/stocks/financials", headers=HEADERS,
        json={"ticker": ticker, "timeframe": timeframe, "limit": limit})
    return r.json()

def get_dividends(ticker, limit=12):
    r = requests.post(f"{API_URL}/api/data/stocks/dividends", headers=HEADERS,
        json={"ticker": ticker, "limit": limit})
    return r.json()

def get_splits(ticker):
    r = requests.post(f"{API_URL}/api/data/stocks/splits", headers=HEADERS,
        json={"ticker": ticker})
    return r.json()
```

---

## SEC EDGAR Reference

For SEC filings, financial statements, and insider trading data, see [references/sec-edgar.md](references/sec-edgar.md).

**Quick start:**
```python
pip install edgartools
```
```python
from edgar import Company, set_identity
set_identity("Rebyte Agent agent@rebyte.ai")

company = Company("AAPL")
income = company.income_statement(periods=5)   # 5 periods of income data
balance = company.balance_sheet(periods=3)      # 3 periods of balance sheet
filings = company.get_filings(form="10-K")      # Annual reports
insider = company.get_filings(form="4")         # Insider trades
```

---

## Analysis Guidelines

### Computing Technical Indicators from Price Bars

The API returns raw OHLCV data. Compute indicators yourself:

- **Simple Moving Average (SMA)**: Average of last N closing prices (use 20-day and 50-day)
- **Price trend**: Compare current close to 20-day and 50-day SMA
- **Support/Resistance**: Recent lows and highs from daily bars
- **Volume trend**: Compare recent volume to 20-day average volume
- **52-week range**: Min low and max high from 1-year daily bars
- **Price change**: Percentage change over period

### Sentiment Analysis from News

The news API includes sentiment for each article. Aggregate:
- Count positive vs negative vs neutral articles
- Weight recent articles more heavily
- Note any sentiment shifts (was negative, now positive)
- Flag high-impact publishers (Reuters, Bloomberg > blogs)

### Financial Statement Analysis (from SEC EDGAR)

When analyzing financials:
- **Revenue growth**: YoY percentage change across periods
- **Margin trends**: Gross margin, operating margin, net margin over time
- **Cash position**: Cash & equivalents vs total debt
- **Earnings quality**: Operating cash flow vs net income (should be close)

### Presenting Results

- Lead with the answer (bullish/bearish/neutral, current price, key metric)
- Use tables for multi-stock comparisons
- Include specific numbers with dates — never vague statements
- Distinguish between facts (from data) and analysis (your interpretation)
- Note data limitations (15-min delay, US stocks only)

---

## Important Notes

- **Tickers must be UPPERCASE** (e.g., `AAPL`, not `aapl`)
- **All timestamps are UTC** (ISO 8601 format)
- **Price data is 15-minute delayed** — not real-time
- **US stocks only** for market data API
- **SEC EDGAR is free** — no API key needed, but requires identity string
- **Historical data**: 5 years for market data, full history for SEC filings
- **No rate limits** on market data API (use responsibly)

---

## When NOT to Use This Skill

- **Full research reports** with 10+ sources, citations, methodology → use `financial-deep-research`
- **Simple web lookup** ("What's Apple's website?") → use web search
- **Non-US stocks** → market data API only covers US markets
- **Real-time trading** → data is 15-min delayed
- **Personal financial advice** → not qualified
