---
name: data
description: Historical data access for the stock-analysis Backtesting pillar. Query the Rebyte Financial Data Service through the Relay Data API with read-only SQL, plus semantic search over historical news when needed for data exploration.
---

# Backtesting Historical Data Access

Access to Rebyte Financial Data Service through the Relay Data API
(`/api/data/financial`). Two modes:

- **SQL** (`/sql`) — read-only analytical SQL over every table (see the
  SQL patterns below for what works). Work in three steps:
  **catalog → schema → query.**
- **Semantic search** (`/search`) — vector search over historical datasets that
  carry content embeddings (currently news). Query by *meaning*, not keywords.
  This is data access, not a separate News subcommand.

This sub-skill belongs to the **Backtesting** pillar. Use it to discover tables,
inspect schemas, pull bars, validate coverage, or explore historical context
needed before a simulation. For analysis structures without API calls, use
`../financial-templates/SKILL.md`.

The lake is the ONLY data source: daily tables land the prior trading day and
intraday is delayed. There is no realtime feed — answer "current" questions
with the latest available bar and state its date; never invent fresher data.

## Authentication

```bash
AUTH_TOKEN="$(rebyte-auth 2>/dev/null || jq -r '.sandbox.token' /home/user/.rebyte.ai/auth.json)"
API_URL="$(jq -r '.sandbox.relay_url // empty' /home/user/.rebyte.ai/auth.json 2>/dev/null || true)"
API_URL="${API_URL:-https://api.rebyte.ai}"
```

If `AUTH_TOKEN` is empty or `null`, report that authentication is unavailable and stop. Do not invent credentials.

## 1. The catalog — every served table

> **IMPORTANT — metadata SQL is unavailable.** `SHOW TABLES`, `DESCRIBE`, and
> any `information_schema` query are **not supported by the service and fail**.
> Do NOT use them, do NOT retry them. The table below is the catalog; discover
> columns with `SELECT * FROM <table> LIMIT 1` (step 2).

**US equities** (identifier `ticker`; time column `t` unless noted):

| Table | Range | What it is |
|---|---|---|
| `us.eod` | 2021-06 → present | Daily price and volume history for US stocks (open/high/low/close/volume). Prices are as-traded — NOT adjusted for splits or dividends. |
| `us.bars_1m` | 2021-06 → present | Minute-by-minute price and volume for US stocks. Very large — always filter by ticker and a time window. |
| `us.fundamentals` | filings → present | Company financial statements as filed with the SEC — income statement, balance sheet, cash flow — one row per company per reporting period (annual, quarterly, or trailing-12-months). 200+ metric columns. |
| `us.news` | 2016-06 → present | Financial news articles: timestamp, headline, related tickers, full text. The only table you can search by meaning — use `/search`. |
| `us.splits` | 1978 → future-dated | Every stock split: which ticker, the effective date, and the ratio (e.g. 2-for-1). Needed to adjust raw prices across a split. |
| `us.dividends` | 2000 → future-dated | Every cash dividend: ex-dividend date, payment date, amount per share, payout frequency. |
| `us.short_volume` | 2024-02 → present | For each stock and day, how much of that day's trading volume came from short selling, broken down by trading venue. |
| `us.short_interest` | 2017-12 → present | Total shares currently sold short per stock, reported twice a month, with average daily volume and how many days of trading it would take to cover. |
| `us.tickers` | snapshot | Master list of every US ticker, listed or delisted, with exchange, security type, and identifiers. Use it to build universes and join other tables. |
| `us.ipos` | 2008 → present | Companies going public: announcement and listing dates, offer price and size, and current status of each offering. |

**China A-shares** (identifier `ts_code` e.g. `000001.SZ`; time column `trade_date`/`trade_time` unless noted):

| Table | Range | What it is |
|---|---|---|
| `cn.bars_day` | 1990-12 → present | Daily price and volume history for China A-shares, including the cumulative adjustment factor needed to compute split/dividend-adjusted prices. Time column `t`. |
| `cn.bars_1m` | 2021-06 → present | Minute-by-minute price and volume for China A-shares. Very large — filter by stock and time window. |
| `cn.daily_basic` | 2021-06 → present | Per-stock daily valuation and trading snapshot: price-to-earnings, price-to-book, turnover rate, market cap, share counts. |
| `cn.income` | 2013 → present | Quarterly/annual income statements of listed Chinese companies: revenue, costs, profit, earnings per share. |
| `cn.balancesheet` | 2013 → present | Balance sheets of listed Chinese companies: assets, liabilities, shareholder equity. |
| `cn.cashflow` | 2013 → present | Cash-flow statements of listed Chinese companies: operating, investing, and financing cash flows. |
| `cn.fina_indicator` | 2013 → present | Precomputed financial ratios per company per period: profitability (ROE, margins), leverage, liquidity, growth rates. |
| `cn.moneyflow` | 2010 → present | For each stock and day, the net value of buying versus selling — was money flowing into or out of the stock. |
| `cn.top_list` | 2010 → present | The exchanges' daily disclosure of stocks with unusual price moves or turnover: which stocks triggered it, why, and the net amount the most active trading desks bought or sold. |

Ranges are indicative (checked 2026-07); daily tables land the prior trading
day, intraday is delayed.

## 2. Get a table's columns — before querying it

`DESCRIBE` does not work (see above). Read the real columns from a single row:

```bash
python3 scripts/anyfinancial_cli.py query "SELECT * FROM cn.bars_1m LIMIT 1"
```

```bash
curl -fsS -X POST "$API_URL/api/data/financial/sql" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"sql":"SELECT * FROM cn.bars_1m LIMIT 1","parameters":[]}' | jq '.'
```

The keys of the returned row are the column names. Do not guess column names.

## 3. Query

```bash
python3 scripts/anyfinancial_cli.py query "SELECT trade_time, o, h, l, c, v FROM cn.bars_1m WHERE ts_code = '000001.SZ' ORDER BY trade_time DESC LIMIT 10"
```

```bash
curl -fsS -X POST "$API_URL/api/data/financial/sql" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"sql":"SELECT trade_time, c FROM cn.bars_1m WHERE ts_code = '\''000001.SZ'\'' ORDER BY trade_time DESC LIMIT 10","parameters":[]}' | jq '.'
```

## Semantic search — find news by meaning (not keywords)

For news, prefer semantic search over `... WHERE content ILIKE '%...%'`. You send a
natural-language `text`; the service embeds it server-side and returns the most
similar rows ranked by `_score` (higher = more relevant). No keys, no embedding on
your side.

```bash
python3 scripts/anyfinancial_cli.py search "Fed rate cut expectations" --columns title,published_utc,tickers
```

```bash
curl -fsS -X POST "$API_URL/api/data/financial/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"Fed rate cut expectations","datasets":["us.news"],"limit":5,"additional_columns":["title","published_utc","tickers"]}' | jq '.'
```

Body fields: `text` (required, natural language) · `datasets` (default `["us.news"]`
— the only dataset with embeddings today) · `limit` (default 5) · `additional_columns`
(optional extra columns returned in each result's `data`).

Each result: `_score` (similarity), `matches.content` (hit snippets), `data` (the
columns you named in `additional_columns`), `dataset`.

> Only `us.news` is searchable today. Other tables are SQL-only — use the three-step
> SQL flow above for them.

## SQL patterns

Write SQL using these verified patterns:

| Need | Use |
|---|---|
| Current time | `now()` |
| Truncate to period | `date_trunc('day', trade_time)` |
| Bucket into N-minute bars | `date_bin(INTERVAL '5 minutes', trade_time, TIMESTAMP '1970-01-01')` |
| Relative time filter | `trade_time > now() - INTERVAL '7 days'` |
| Parse a timestamp | `to_timestamp('2024-01-01T00:00:00')` |
| Part of a date | `extract(year FROM trade_time)` |
| Cast | `CAST(x AS BIGINT)` or `arrow_cast(x, 'Int64')` |
| String concat / match | `a || b`, `col ILIKE 'a%'` |
| Paging | `LIMIT 100 OFFSET 0` |

Do **not** use (they error — switch syntax, do not retry as-is):
`DATEADD` / `DATEDIFF` / `GETDATE()` (use `now()`, `date_trunc`, `INTERVAL` math),
`TOP n` (use `LIMIT n`), `SELECT INTO`, stored procedures, or vendor-specific functions.

## Rules

- Read-only, one statement per request. Start with `SELECT` or `WITH` (`SHOW`/`DESCRIBE`/`EXPLAIN` are not supported by the service — don't use them).
- No mutating statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `CREATE`, `TRUNCATE`, …).
- Project only needed columns and add `LIMIT` while exploring.
- The catalog table (step 1) and a `SELECT * … LIMIT 1` probe (step 2) are the source of truth for table and column names.

## On error — do not loop

If a query fails, do not resubmit the same or a near-identical statement. Instead:

1. Read the error message. `Invalid function` / `No field named …` means unsupported SQL syntax or wrong column → fix it using the pattern table above and the table schema from step 2.
2. Change exactly one thing and retry.
3. After 2–3 failed attempts, **stop** and report the exact failing SQL and the exact error. Do not keep retrying.
