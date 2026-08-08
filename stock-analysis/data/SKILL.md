---
name: data
description: Financial data access for stock-analysis. Use direct price APIs for the current and previous exchange-local calendar dates, and the Rebyte Financial Data Service for historical prices, fundamentals, screening, and backtesting through read-only SQL, plus meaning-based search over news and a library of paid investment research.
---

# Financial Data Access

Access financial data through the Relay Data API. Four modes:

- **Direct recent prices** — price-only OHLCV bars across the current and
  previous exchange-local calendar dates. Use `/stocks/bars` for US equities,
  `/cn-stocks/bars` for CN daily bars, and `/cn-stocks/bars_1min` for CN minute
  bars. The server owns the date range; callers cannot widen it.

- **SQL** (`financial/sql`) — read-only analytical SQL over every table (see the
  SQL patterns below for what works). Work in three steps:
  **catalog → schema → query.**
- **News search** (`research/news`) — search US equity news coverage by
  *meaning*, not keywords. This is data access, not a separate News subcommand.
- **Research search** (`research/search`) — search a library of paid,
  subscriber-only investment newsletters. Use it for theses and mechanisms;
  use news for events.

Use this sub-skill for both analysis and the **Backtesting** pillar: fetch recent
prices, discover lake tables, inspect schemas, pull historical bars, validate
coverage, or explore historical context. For analysis structures without API
calls, use `../financial-templates/SKILL.md`.

## Route by freshness

- For "current", "today", "latest price", and recent intraday requests, call
  the direct price API first. During market hours, use US `stocks/bars` with
  `interval: "1min"` and CN `cn-stocks/bars_1min`.
- For ranges older than two exchange-local calendar dates and for every
  non-price fact, use the data lake.
- For analysis needing both current price and historical context, use both
  sources. Keep their provenance separate; if combining bars, de-duplicate by
  ticker and timestamp.
- Direct APIs are not streaming quote or execution feeds. State the returned
  `marketDateRange`, latest bar timestamp, and Polygon `upstreamStatus` when
  present. Never call delayed OHLCV tick-level realtime.
- Weekends and holidays can leave one or both direct dates empty. Do not widen
  the direct window; use the lake for older context.

## Authentication

```bash
AUTH_TOKEN="$(rebyte-auth 2>/dev/null || jq -r '.sandbox.token' /home/user/.rebyte.ai/auth.json)"
API_URL="$(jq -r '.sandbox.relay_url // empty' /home/user/.rebyte.ai/auth.json 2>/dev/null || true)"
API_URL="${API_URL:-https://api.rebyte.ai}"
```

If `AUTH_TOKEN` is empty or `null`, report that authentication is unavailable and stop. Do not invent credentials.

## Direct recent-price APIs

These endpoints accept identifiers and intervals only. Do not send `from`,
`to`, `start_date`, `end_date`, or `trade_date`; the Relay derives the two-date
window in the exchange's time zone.

### US equities

```bash
curl -fsS -X POST "$API_URL/api/data/stocks/bars" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"ticker":"AAPL","interval":"5min"}' | jq '.'
```

Intervals: `1min`, `5min`, `15min`, `30min`, `1hour`, `4hour`, `1day`.
Response: `{ ticker, marketDateRange: { from, to }, upstreamStatus, count,
bars: [{ t, o, h, l, c, v, vw, n }] }`. Treat `upstreamStatus: "DELAYED"` as
delayed data and say so. For an intraday/current-price check before the US
close, use `interval: "1min"`; the current date's `1day` bar is not a completed
closing bar until the market closes.

### China A-shares

Daily bars for one stock (omit `ts_code` only when the whole market is truly
needed):

```bash
curl -fsS -X POST "$API_URL/api/data/cn-stocks/bars" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"ts_code":"000001.SZ"}' | jq '.'
```

One-minute bars for one stock:

```bash
curl -fsS -X POST "$API_URL/api/data/cn-stocks/bars_1min" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"ts_code":"000001.SZ"}' | jq '.'
```

Both return `{ success, marketDateRange: { from, to }, rows, rowCount,
elapsedMs }`. For an intraday/current-price check before the CN close, use
`bars_1min`; the current date's daily `bars` row is available only after market
close. This is the same minute-during-session rule as US. The direct providers
expose prices only: use the lake for news, fundamentals, company details,
valuation, dividends, splits, and screening.

## Historical data lake

Use the three-step flow below for historical and non-price data.

### 1. The catalog — what tables exist

`financial/catalog` returns every table and a one-line description of what it
is. Filter to a market with `market` = `us` (US equities) or `cn` (China
A-shares); omit it for both. Call this first, then pull columns for the tables
you actually need (step 2).

```bash
python3 scripts/financial_cli.py catalog            # both markets
python3 scripts/financial_cli.py catalog --market cn
```

```bash
curl -fsS -X POST "$API_URL/api/data/financial/catalog" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"market":"cn"}' | jq '.'
```

Returns `{ tables: [{ table, market, description }, …] }`. US descriptions are
English, CN descriptions are Chinese.

> **IMPORTANT — do not use metadata SQL.** `SHOW TABLES`, `DESCRIBE`, and
> `information_schema` queries are not a reliable discovery path here. Use
> `catalog` for tables and `schema` (below) for columns — never guess.

### 2. Get a table's columns — before querying it

`financial/schema` returns the live column list for one or more tables — each
column's `name`, `type`, and a human `doc` (US-English / CN-Chinese). This is
the source of truth for column names and meanings; it is always current, so
never guess column names and never hardcode them.

```bash
python3 scripts/financial_cli.py schema cn.daily_basic us.eod
```

```bash
curl -fsS -X POST "$API_URL/api/data/financial/schema" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"tables":["cn.daily_basic","us.eod"]}' | jq '.'
```

Returns `{ schemas: { "cn.daily_basic": [{ name, type, doc }, …], … } }`. Pass
several tables at once when a query joins across them.

Notes that still hold: `us.eod` is raw (unadjusted) — join `us.splits`
to adjust; `cn.bars_day` carries an adjustment factor. Daily tables land the
prior trading day (T+1); intraday is delayed. The 1-minute bar tables
(`us.bars_1m`, `cn.bars_1m`) run through a heavier path — a query can take tens
of seconds, so keep the window narrow (one ticker, days not months) and allow a
generous client timeout.

### 3. Query

```bash
python3 scripts/financial_cli.py query "SELECT trade_time, o, h, l, c, v FROM cn.bars_1m WHERE ts_code = '000001.SZ' ORDER BY trade_time DESC LIMIT 10"
```

```bash
curl -fsS -X POST "$API_URL/api/data/financial/sql" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"sql":"SELECT trade_time, c FROM cn.bars_1m WHERE ts_code = '\''000001.SZ'\'' ORDER BY trade_time DESC LIMIT 10","parameters":[]}' | jq '.'
```

## Search — find writing by meaning (not keywords)

Never hunt text with `... WHERE content ILIKE '%...%'`. Send a natural-language
`text`; the service embeds it server-side and ranks by meaning *and* exact terms,
so tickers and paraphrases both work. No keys, no embedding on your side.

### News — what happened

US equity news coverage going back to 2016.

```bash
python3 scripts/financial_cli.py news "Fed rate cut expectations" --ticker NVDA --recent
```

```bash
curl -fsS -X POST "$API_URL/api/data/research/news" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"Fed rate cut expectations","ticker":"NVDA","limit":5}' | jq '.'
```

Body: `text` (required) · `ticker` · `since`/`until` (ISO dates) · `sort`
(`relevance` default, or `recent`) · `limit` (default 5, max 25).
Each result: `id`, `title`, `published_at`, `tickers`, `score`, `snippet`.

### Research — what it means

A library of paid, subscriber-only investment newsletters: ~4,300 long-form
articles from 13 publications, 2020 to today, including SemiAnalysis and
SemiVision (semiconductors, datacenter buildout), MacroCharts and Capital Wars
(global liquidity, cycles), Citrini (thematic trades), Doomberg (energy and
commodities), and Michael J Burry. This is primary analysis behind paywalls that
a web search cannot reach — reach for it on any thesis, debate, or mechanism
question, before falling back on general knowledge.

```bash
python3 scripts/financial_cli.py research "global liquidity and central bank balance sheets"
```

```bash
curl -fsS -X POST "$API_URL/api/data/research/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" -H "Content-Type: application/json" \
  -d '{"text":"global liquidity and central bank balance sheets","limit":5}' | jq '.'
```

Body: `text` (required) · `channel` · `since`/`until` · `limit` (default 5, max 25).
Each result: `channel`, `slug`, `chunk_index`, `title`, `published_at`, `score`,
`snippet`. Filter one publication with `channel`: `semianalysis`, `semivision`,
`macrocharts`, `capitalwars`, `citrini`, `doomberg`, `michaeljburry`, `fundaai`,
`photoncap`, `jamesbulltard`, `viksnewsletter`, `asymmetricalbets`, `damnang`.
Search unfiltered first — you usually want the best argument, not one author's.

A hit is one **section** of an article. Before quoting it as anyone's position,
read around it — a section often states a view the author goes on to demolish:

```bash
python3 scripts/financial_cli.py context capitalwars <slug> 2 --radius 1   # neighbouring sections
python3 scripts/financial_cli.py article capitalwars <slug>                # the whole piece
```

Cite publication and publication date whenever you use a result.

> Search covers news and research articles. Every other table is SQL-only — use
> the three-step SQL flow above for them.

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
- `financial/catalog` (step 1) and `financial/schema` (step 2) are the source of truth for table and column names — always current. Never guess or hardcode.

## On error — do not loop

If a query fails, do not resubmit the same or a near-identical statement. Instead:

1. Read the error message. `Invalid function` / `No field named …` means unsupported SQL syntax or wrong column → fix it using the pattern table above and the table schema from step 2.
2. Change exactly one thing and retry.
3. After 2–3 failed attempts, **stop** and report the exact failing SQL and the exact error. Do not keep retrying.
