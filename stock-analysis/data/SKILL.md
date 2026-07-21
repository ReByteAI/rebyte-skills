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

## 1. The catalog — what tables exist

`financial/catalog` returns every table and a one-line description of what it
is. Filter to a market with `market` = `us` (US equities) or `cn` (China
A-shares); omit it for both. Call this first, then pull columns for the tables
you actually need (step 2).

```bash
python3 scripts/anyfinancial_cli.py catalog            # both markets
python3 scripts/anyfinancial_cli.py catalog --market cn
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

## 2. Get a table's columns — before querying it

`financial/schema` returns the live column list for one or more tables — each
column's `name`, `type`, and a human `doc` (US-English / CN-Chinese). This is
the source of truth for column names and meanings; it is always current, so
never guess column names and never hardcode them.

```bash
python3 scripts/anyfinancial_cli.py schema cn.daily_basic us.eod
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
- `financial/catalog` (step 1) and `financial/schema` (step 2) are the source of truth for table and column names — always current. Never guess or hardcode.

## On error — do not loop

If a query fails, do not resubmit the same or a near-identical statement. Instead:

1. Read the error message. `Invalid function` / `No field named …` means unsupported SQL syntax or wrong column → fix it using the pattern table above and the table schema from step 2.
2. Change exactly one thing and retry.
3. After 2–3 failed attempts, **stop** and report the exact failing SQL and the exact error. Do not keep retrying.
