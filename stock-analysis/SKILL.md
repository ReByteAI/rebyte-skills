---
version: 3
name: stock-analysis
description: "The single financial skill for stock and company analysis plus strategy backtesting. Uses direct recent-price APIs for the current and previous exchange-local calendar dates, and the Rebyte financial data lake for historical prices, news, fundamentals, dividends/splits, screening, and backtests across US equities and China A-shares. Also covers SEC EDGAR insider/filing research and multi-stock comparison. Use for stock tickers, current/latest prices, price history, technical or company analysis, investment research, financial data, and strategy backtests. Triggers include AAPL, TSLA, 000001.SZ, 'stock price', 'today', 'latest price', 'analyze stock', 'compare stocks', 'company financials', 'insider trading', 'SEC filing', 'is X a good buy', 'backtest', and '回测'."
---

# Stock Analysis

Stock and company analysis plus strategy backtesting using direct recent-price
feeds and the Rebyte financial data lake.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the
agent's system prompt; use them as Bearer token and base URL.

## Skill layout — load the pillar you need

| Pillar | When |
|---|---|
| this file | Analysis playbooks: price checks, company overviews, comparisons, fundamentals, technicals |
| [`data/SKILL.md`](data/SKILL.md) | Data routing and mechanics: direct two-date prices, full 19-table lake catalog (US + CN), SQL patterns, news + research search, error rules. **Read before fetching data.** |
| [`backtesting/SKILL.md`](backtesting/SKILL.md) | Strategy simulation: 5-phase NautilusTrader workflow ending in a backtest result bundle |
| [`financial-templates/SKILL.md`](financial-templates/SKILL.md) | Analysis structures (DCF, comps, memo formats) with no data calls |
| [`report-style/README.md`](report-style/README.md) | Kami design system for every HTML report this skill delivers |
| `references/sec-edgar.md` | SEC filings, full 10-K/10-Q text, insider (Form 4) trades via edgartools |

Price/K-line charts: use the **`financial-charts`** skill (TradingView-style
Lightweight Charts).

## Data sources

| Source | What it provides | Access |
|--------|-----------------|--------|
| **Direct recent-price APIs** | Price-only OHLCV bars for the current and previous exchange-local calendar dates. US minute bars use `stocks/bars` with `interval: "1min"`; China minute bars use `cn-stocks/bars_1min`. | `POST $API_URL/api/data/stocks/bars`, `POST $API_URL/api/data/cn-stocks/bars`, or `POST $API_URL/api/data/cn-stocks/bars_1min` — see `data/SKILL.md` |
| **Rebyte financial data lake** | US: daily + 1-minute bars, news, SEC-filing fundamentals, splits, dividends, short data, ticker universe, IPOs. CN A-shares: daily + 1-minute bars, valuation snapshots, financial statements, money flow, unusual-move disclosures. | Read-only SQL via `POST $API_URL/api/data/financial/sql` — see `data/SKILL.md` |
| **News archive** | US equity news coverage back to 2016, searchable by meaning | `POST $API_URL/api/data/research/news` — see `data/SKILL.md` |
| **Research library** | ~4,300 long-form articles from 13 investment research publications (SemiAnalysis, SemiVision, MacroCharts, Capital Wars, Citrini, Doomberg, Michael J Burry and others), 2020 to today. Primary analysis by named practitioners — use it for theses, debates, and mechanisms. | `POST $API_URL/api/data/research/search`, then `/context` or `/article` — see `data/SKILL.md` |
| **SEC EDGAR** | Full filing text (10-K, 10-Q, 8-K), filing sections, insider (Form 4) trades | `edgartools` Python library — see `references/sec-edgar.md` |

**Route by freshness.** Use the direct APIs for "current", "today", "latest
price", and recent intraday questions. Their range is fixed server-side to the
current and previous calendar dates in `America/New_York` (US) or
`Asia/Shanghai` (CN); callers cannot widen it. Use the lake for every older or
non-price fact. The US response exposes Polygon's `upstreamStatus` (for example
`DELAYED`), so never imply tick-level realtime. State the source, returned date
range, latest bar timestamp, and feed status when present. During market hours,
use minute bars in both markets; treat the current date's daily bar as final
only after that market closes.

---

## Analysis Workflows

Use direct prices for the two-date edge and lake SQL for historical or
non-price steps. Exact routing and request shapes are in `data/SKILL.md`.

### 1. Quick Stock Check
```
User: "What's AAPL doing?" / "AAPL price"
→ Direct recent bars — quote the latest close, timestamp, date range, feed status
→ Lake daily bars (last 1 month) + ticker details for context
→ Present: latest direct price + recent trend + basic company info
```

### 2. Company Overview
```
User: "Tell me about NVDA" / "What does Tesla do?"
→ Ticker details + latest fundamentals period (revenue, net income)
→ Daily bars (last 3 months)
→ Direct recent bars when presenting a latest/current price
→ Recent news (5 headlines) — semantic search for themes if needed
→ Present: business summary, market position, recent performance, news themes
```

### 3. Technical Analysis
```
User: "Is TSLA a good buy?" / "AAPL technical analysis"
→ Daily bars (last 6 months) — trend, support/resistance
→ Direct recent intraday bars — current short-term momentum
→ Lake 1-minute bars aggregated to hourly when more than two dates are needed
→ Recent news (10 articles) — read and judge the tone yourself
→ Compute: moving averages, price range, volume trends
→ Present: trend direction, key levels, volume analysis, sentiment, outlook
```

### 4. Multi-Stock Comparison
```
User: "Compare AAPL vs MSFT vs GOOGL"
→ One SQL per dataset covering all tickers (WHERE ticker IN (...))
→ Direct recent bars for each ticker when current prices are part of the comparison
→ Compare: price performance, fundamentals, news flow
→ Present: side-by-side table, relative performance
```

### 5. Fundamental Deep Dive
```
User: "AAPL financials" / "NVDA revenue trend"
→ Fundamentals: annual (5 periods) + quarterly (4 periods)
→ Dividends (last 12) — history and implied yield vs latest direct close
→ Weekly-aggregated bars (last 2 years) — long-term price context
→ Compute: revenue growth, margin trends, EPS trend, payout ratio
→ Optional: SEC EDGAR for full 10-K text
```

### 6. Insider Activity
```
User: "Insider trading for TSLA" / "Are executives buying NVDA?"
→ SEC EDGAR: Form 4 filings (the lake does not carry insider trades)
→ Daily bars (last 3 months) — price context around the trades
→ Present: recent transactions, insider sentiment, correlation with price
```

### 7. Due Diligence Package
```
User: "Full analysis of MSFT" / "Due diligence on AMD"
→ Ticker details, 1y daily bars, annual + quarterly fundamentals,
  dividends, splits, 20 recent news items
→ Direct recent bars for the current price snapshot
→ SEC EDGAR: latest 10-K, recent 8-Ks, Form 4 insider trades
→ Present: comprehensive report (Kami-styled HTML per report-style/)
```

### 8. Sector Research
```
User: "Compare cloud stocks" / "Best semiconductor stocks"
→ Identify tickers (us.tickers can filter by name/type/exchange)
→ Batch daily bars + fundamentals across the set
→ Semantic news search on the sector theme
→ Present: sector overview, leaders, relative performance
```

### 9. Strategy Backtest
```
User: "Backtest an SMA crossover on AAPL" / "验证我的策略"
→ Switch to backtesting/SKILL.md and run its 5 phases end-to-end
→ Deliverable is the backtest bundle at /code/backtests/<slug>/
```

---

## Trigger Patterns

**ALWAYS fetch data when the user mentions any of these. Do NOT answer from
memory — route to the direct price API and/or lake as specified.**

| User intent | Required actions |
|------------|-----------------|
| Stock symbol mentioned (AAPL, $TSLA, 000001.SZ) | Direct recent bars + lake ticker details |
| "current", "today", "latest price", "how is X doing" | Direct recent bars first; include `marketDateRange`, latest timestamp, and feed status |
| Historical "price" or "chart" | Lake bars for the requested range; add direct bars only when the latest edge matters |
| "news", "what's happening with" | News query (10+ items) or semantic search |
| "analyze", "research", "tell me about" | Details + bars + news |
| "compare", "vs", "versus" | All datasets for each stock, side-by-side |
| "buy", "sell", "good investment" | Bars + news + fundamentals (annual + quarterly) |
| "financials", "revenue", "earnings" | Fundamentals (annual + quarterly) |
| "dividend", "yield", "payout" | `us.dividends` |
| "split", "stock split" | `us.splits` |
| "short interest", "shorts" | `us.short_interest` / `us.short_volume` |
| "insider", "who's buying/selling" | SEC EDGAR Form 4 filings |
| "10-K", "10-Q", "SEC filing" | SEC EDGAR filings |
| "backtest", "回测", "strategy performance" | `backtesting/SKILL.md` |

---

## Lake SQL recipes

Auth + request format, DataFusion-style SQL patterns, the on-error rule, and
the full table catalog are in `data/SKILL.md`. The recipes below map the
common analysis needs; tickers are UPPERCASE for US, `NNNNNN.SZ`/`NNNNNN.SH`
for CN.

```sql
-- Price bars, daily (raw, unadjusted; check us.splits before spanning a split)
SELECT t, o, h, l, c, v FROM us.eod
WHERE ticker = 'AAPL' AND t >= to_timestamp('2026-01-01')
ORDER BY t

-- Intraday / custom intervals: aggregate 1-minute bars
SELECT date_bin(INTERVAL '1 hour', t, TIMESTAMP '1970-01-01') AS bucket,
       min(t) AS t_open, max(h) AS h, min(l) AS l, sum(v) AS v
FROM us.bars_1m
WHERE ticker = 'AAPL' AND t >= now() - INTERVAL '5 days'
GROUP BY bucket ORDER BY bucket

-- News for a ticker (tickers is an array column)
SELECT published_utc, title, tickers FROM us.news
WHERE array_has(tickers, 'AAPL')
ORDER BY published_utc DESC LIMIT 10
-- Thematic retrieval ("news about AI chip demand"): use research/news instead
-- of ILIKE; for theses and mechanisms use research/search — see data/SKILL.md.

-- Fundamentals (SEC-filing derived; is_* income, bs_* balance, cf_* cashflow)
SELECT fiscal_year, fiscal_period, is_revenues, is_gross_profit,
       is_operating_income_loss, is_net_income_loss,
       is_diluted_earnings_per_share, bs_assets, bs_liabilities, bs_equity,
       cf_net_cash_flow_from_operating_activities
FROM us.fundamentals
WHERE array_has(tickers, 'AAPL') AND timeframe = 'annual'
ORDER BY fiscal_year DESC LIMIT 5

-- Dividends / splits
SELECT ex_dividend_date, cash_amount, frequency FROM us.dividends
WHERE ticker = 'AAPL' ORDER BY ex_dividend_date DESC LIMIT 12;
SELECT execution_date, split_from, split_to FROM us.splits
WHERE ticker = 'AAPL' ORDER BY execution_date DESC

-- Ticker details / universe screen
SELECT ticker, name, primary_exchange, type, active, cik FROM us.tickers
WHERE ticker = 'AAPL'

-- CN A-share daily bars (adj_factor included for adjusted series)
SELECT t, o, h, l, c, v, pct_chg, adj_factor FROM cn.bars_day
WHERE ts_code = '000001.SZ' AND t >= to_timestamp('2026-01-01')
ORDER BY t

-- CN valuation snapshot / financial indicators
SELECT trade_date, pe_ttm, pb, turnover_rate, total_mv FROM cn.daily_basic
WHERE ts_code = '000001.SZ' ORDER BY trade_date DESC LIMIT 20
```

The `data/scripts/financial_cli.py` helper wraps auth + the SQL endpoint:

```bash
python3 data/scripts/financial_cli.py catalog
python3 data/scripts/financial_cli.py schema us.eod
python3 data/scripts/financial_cli.py query "SELECT ... LIMIT 10"
python3 data/scripts/financial_cli.py news "Fed rate cut expectations" --ticker NVDA
python3 data/scripts/financial_cli.py research "global liquidity and central bank balance sheets"
```

---

## SEC EDGAR Reference

For full filing text, filing sections, and insider trading data, see
[references/sec-edgar.md](references/sec-edgar.md).

**Quick start:**
```python
pip install edgartools
```
```python
from edgar import Company, set_identity
set_identity("Rebyte Agent agent@rebyte.ai")

company = Company("AAPL")
filings = company.get_filings(form="10-K")      # Annual reports
insider = company.get_filings(form="4")         # Insider trades
```

---

## Analysis Guidelines

### Computing Technical Indicators from Price Bars

The lake returns raw OHLCV. Compute indicators yourself (or in SQL):

- **Simple Moving Average (SMA)**: average of last N closes (20-day and 50-day)
- **Price trend**: current close vs 20-day and 50-day SMA
- **Support/Resistance**: recent lows/highs from daily bars
- **Volume trend**: recent volume vs 20-day average volume
- **52-week range**: min low / max high over 1 year of daily bars
- **Corporate actions**: `us.eod` is unadjusted — when the window spans a
  split, adjust with `us.splits`; CN daily bars carry `adj_factor` directly

### Reading News

Lake news carries no precomputed sentiment — read the headlines/content and
judge the tone yourself, noting publisher weight and recency. For thematic
questions, prefer the semantic search endpoint over keyword `ILIKE`.

### Financial Statement Analysis

- **Revenue growth**: YoY change across periods
- **Margin trends**: gross/operating/net margin over time
- **Cash position**: cash & equivalents vs total debt
- **Earnings quality**: operating cash flow vs net income (should be close)

### Presenting Results

- Lead with the answer (bullish/bearish/neutral, latest sourced close + timestamp, key metric)
- Use tables for multi-stock comparisons
- Include specific numbers with dates — never vague statements
- Distinguish facts (from data) from analysis (your interpretation)
- State each source and date range explicitly; report direct-feed status and
  label lake data T+1
- Long-form deliverables: Kami-styled HTML per `report-style/`

---

## Important Notes

- **US tickers UPPERCASE** (`AAPL`); **CN codes suffixed** (`000001.SZ`, `600519.SH`)
- **All timestamps UTC**
- **Direct prices cover two exchange-local calendar dates only** — weekends and
  holidays can yield empty dates; do not widen the direct request
- **Lake data is T+1** — daily tables land the prior trading day
- **Direct means recent, not guaranteed tick realtime** — during market hours,
  use US `stocks/bars` with `interval: "1min"` and CN `cn-stocks/bars_1min`;
  report Polygon's `upstreamStatus`, and use completed daily bars after close
- **Coverage**: US from 2021-06 (bars) with reference data much deeper (splits 1978→, dividends 2000→); CN daily from 1990-12 — full catalog in `data/SKILL.md`
- **SEC EDGAR is free** — no API key, but requires an identity string

---

## When NOT to Use This Skill

- **Simple web lookup** ("What's Apple's website?") → use web search
- **Live trading, tick execution, bid/ask, or streaming quotes** → not supported;
  direct prices are OHLCV bars and may be delayed
- **Personal financial advice** → not qualified
