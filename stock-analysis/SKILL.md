---
version: 2
name: stock-analysis
description: "The single financial skill: stock and company analysis plus strategy backtesting, on the Rebyte financial data lake (US equities + China A-shares). Covers price history, technical analysis, company research, news, fundamentals, dividends/splits, insider trading via SEC EDGAR, multi-stock comparison, and NautilusTrader backtesting with a first-class result bundle. Use when the user mentions stock tickers, stock prices, company analysis, investment research, financial data, or wants to backtest a strategy. Triggers: stock symbol (AAPL, TSLA, 000001.SZ), 'stock price', 'analyze stock', 'compare stocks', 'company financials', 'insider trading', 'SEC filing', 'is X a good buy', 'price history', 'backtest', '回测'. Do NOT use for full-blown multi-source research reports (use financial-deep-research instead)."
---

# Stock Analysis

Stock and company analysis plus strategy backtesting on the Rebyte financial
data lake.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the
agent's system prompt; use them as Bearer token and base URL.

## Skill layout — load the pillar you need

| Pillar | When |
|---|---|
| this file | Analysis playbooks: price checks, company overviews, comparisons, fundamentals, technicals |
| [`data/SKILL.md`](data/SKILL.md) | Data access mechanics: full 19-table catalog (US + CN), SQL patterns, semantic news search, error rules. **Read before writing SQL.** |
| [`backtesting/SKILL.md`](backtesting/SKILL.md) | Strategy simulation: 5-phase NautilusTrader workflow ending in a backtest result bundle |
| [`financial-templates/SKILL.md`](financial-templates/SKILL.md) | Analysis structures (DCF, comps, memo formats) with no data calls |
| [`report-style/README.md`](report-style/README.md) | Kami design system for every HTML report this skill delivers |
| `references/sec-edgar.md` | SEC filings, full 10-K/10-Q text, insider (Form 4) trades via edgartools |

Price/K-line charts: use the **`financial-charts`** skill (TradingView-style
Lightweight Charts).

## Data sources

| Source | What it provides | Access |
|--------|-----------------|--------|
| **Rebyte financial data lake** | US: daily + 1-minute bars, news (semantic-searchable), SEC-filing fundamentals, splits, dividends, short data, ticker universe, IPOs. CN A-shares: daily + 1-minute bars, valuation snapshots, financial statements, money flow, unusual-move disclosures. | Read-only SQL via `POST $API_URL/api/data/financial/sql` — see `data/SKILL.md` |
| **SEC EDGAR** | Full filing text (10-K, 10-Q, 8-K), filing sections, insider (Form 4) trades | `edgartools` Python library — see `references/sec-edgar.md` |

**Freshness — the lake is historical (T+1).** Daily tables land the prior
trading day; intraday is delayed. There is no realtime feed: answer "current
price" questions with the latest available bar and **state its date**. Never
invent fresher data.

---

## Analysis Workflows

All data steps below are lake SQL (recipes in the next section).

### 1. Quick Stock Check
```
User: "What's AAPL doing?" / "AAPL price"
→ Latest daily bars (last 1 month) — quote the last close and its date
→ Ticker details
→ Present: last close + date, recent trend, basic company info
```

### 2. Company Overview
```
User: "Tell me about NVDA" / "What does Tesla do?"
→ Ticker details + latest fundamentals period (revenue, net income)
→ Daily bars (last 3 months)
→ Recent news (5 headlines) — semantic search for themes if needed
→ Present: business summary, market position, recent performance, news themes
```

### 3. Technical Analysis
```
User: "Is TSLA a good buy?" / "AAPL technical analysis"
→ Daily bars (last 6 months) — trend, support/resistance
→ 1-minute bars aggregated to hourly (last 5 trading days) — short-term momentum
→ Recent news (10 articles) — read and judge the tone yourself
→ Compute: moving averages, price range, volume trends
→ Present: trend direction, key levels, volume analysis, sentiment, outlook
```

### 4. Multi-Stock Comparison
```
User: "Compare AAPL vs MSFT vs GOOGL"
→ One SQL per dataset covering all tickers (WHERE ticker IN (...))
→ Compare: price performance, fundamentals, news flow
→ Present: side-by-side table, relative performance
```

### 5. Fundamental Deep Dive
```
User: "AAPL financials" / "NVDA revenue trend"
→ Fundamentals: annual (5 periods) + quarterly (4 periods)
→ Dividends (last 12) — history and implied yield vs latest close
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
memory — query the lake.**

| User intent | Required actions |
|------------|-----------------|
| Stock symbol mentioned (AAPL, $TSLA, 000001.SZ) | Daily bars + ticker details |
| "price", "chart", "how is X doing" | Daily bars (aggregate 1-minute bars for intraday granularity) |
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
-- Thematic retrieval ("news about AI chip demand"): use the semantic /search
-- endpoint instead of ILIKE — see data/SKILL.md.

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

The `data/scripts/anyfinancial_cli.py` helper wraps auth + the SQL endpoint:

```bash
python3 data/scripts/anyfinancial_cli.py catalog
python3 data/scripts/anyfinancial_cli.py schema us.eod
python3 data/scripts/anyfinancial_cli.py query "SELECT ... LIMIT 10"
python3 data/scripts/anyfinancial_cli.py search "Fed rate cut expectations" --columns title,published_utc
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

- Lead with the answer (bullish/bearish/neutral, last close + its date, key metric)
- Use tables for multi-stock comparisons
- Include specific numbers with dates — never vague statements
- Distinguish facts (from data) from analysis (your interpretation)
- State the data date explicitly — the lake is T+1, not realtime
- Long-form deliverables: Kami-styled HTML per `report-style/`

---

## Important Notes

- **US tickers UPPERCASE** (`AAPL`); **CN codes suffixed** (`000001.SZ`, `600519.SH`)
- **All timestamps UTC**
- **Data is T+1** — daily tables land the prior trading day; never present it as realtime
- **Coverage**: US from 2021-06 (bars) with reference data much deeper (splits 1978→, dividends 2000→); CN daily from 1990-12 — full catalog in `data/SKILL.md`
- **SEC EDGAR is free** — no API key, but requires an identity string

---

## When NOT to Use This Skill

- **Full research reports** with 10+ sources, citations, methodology → use `financial-deep-research`
- **Simple web lookup** ("What's Apple's website?") → use web search
- **Realtime quotes / live trading** → not available; the lake is historical (T+1)
- **Personal financial advice** → not qualified
