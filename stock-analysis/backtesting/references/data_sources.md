# Data sources (anyfinancial)

Price data comes from the Rebyte Financial Data Service — the read-only SQL
service the **anyfinancial** skill exposes (`/api/data/financial/sql`).
`fetch_data.py` uses the anyfinancial CLI when present, else an inline client
with identical auth.

## Tables used

| Interval | Table | Columns |
|---|---|---|
| `1day` | `us.eod` | `ticker, t, o, h, l, c, v, n` |
| `1min` | `us.bars_1m` | `ticker, t, o, h, l, c, v, n` |

- `t` is a UTC `Timestamp(µs)`; `o/h/l/c` are Float64; `v` (volume) and `n`
  (trade count) are Int64.
- `us.eod` holds ~14M rows spanning **2021-06 → present** across US tickers.
- These are OHLCV bars only — **no bid/ask, no tick/quote data**.

## Discovering what's available

The full table catalog (US + CN: bars, fundamentals, news, splits,
dividends, short data, money flow, …) lives in `../../data/SKILL.md` — read it
before assuming a dataset doesn't exist.

> **IMPORTANT:** discover tables with `financial/catalog` and columns with `financial/schema` (both live). `SHOW TABLES`, `DESCRIBE`, and `information_schema` queries
> are not supported by the service and fail. Use the static catalog in
> `../../data/SKILL.md` for table names and `SELECT * FROM <table> LIMIT 1`
> for columns. Coverage checks are plain SQL:

```bash
python3 ../data/scripts/anyfinancial_cli.py query \
  "SELECT count(*) n, min(t) oldest, max(t) newest FROM us.eod WHERE ticker='AAPL'"
```

## SQL dialect notes

- Time: `now()`, `to_timestamp('2024-01-01T00:00:00')`, `date_trunc`,
  `INTERVAL '7 days'`. **Not** `DATEADD`/`GETDATE()`/`TOP`.
- One read-only statement per request; page with `LIMIT` (the fetcher keyset-
  paginates on `t`).

## Coverage & quality caveats

- **Survivorship**: the table reflects tickers as identified today; it is not a
  point-in-time index membership set. Delisted names may be absent.
- **Corporate actions**: `us.eod` is raw OHLCV — NOT split/dividend adjusted.
  The lake serves `us.splits` (1978→) and `us.dividends` (2000→); join on
  ticker and apply your own adjustment when the window spans a corporate
  action. For CN, `cn.bars_day` carries `adj_factor` directly.
- **Freshness**: `us.eod` typically lands the prior trading day; intraday
  `us.bars_1m` is delayed. Do not assume same-day bars exist.
- **Volume/precision**: equity prices use 2-decimal precision in the runner
  (`venue.price_precision`); adjust for sub-penny or high-priced instruments.

## Cache layout

`fetch_data.py` writes CSV (dependency-free, inspectable):

```
<cache_dir>/<table>/<TICKER>__<interval>.csv     # header: t,o,h,l,c,v
```

Re-running is incremental at the file level: existing files are skipped unless
`--force`. Delete a file (or use `--force`) to re-pull a ticker.
