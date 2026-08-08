---
version: 1
name: backtesting
description: Stock-analysis Backtesting pillar. Run realistic event-driven backtests with NautilusTrader, including historical data acquisition through data/SKILL.md and execution/reporting. Use for strategy simulation, signal evaluation, Sharpe/drawdown/returns, in-sample vs out-of-sample, walk-forward, or parameter comparison. Do NOT use for live trading; the data lake is historical (T+1) only.
---

# Backtesting

The Backtesting pillar combines historical data access and event-driven strategy
simulation. **NautilusTrader** is the engine (no look-ahead, real
order/fill/commission accounting); `../data/SKILL.md` is the historical data
layer (US OHLCV bars via read-only SQL). A small framework, run in phases — not a
one-off script.

This skill runs **local simulations on historical data only**. It never places
real orders and has no brokerage connectivity.

The lake is historical (T+1); there is no realtime feed.

## How an agent uses this skill

Work through the five phases **in order**. Each phase has a **Goal**, the
**Actions** to take, and a **Gate** — a condition that must hold before you move
on. Do not skip a gate; skipping is how look-ahead bias and frictionless-fantasy
results sneak in.

```
Phase 1  SETUP        install + verify the engine
Phase 2  PARAMETERS   ask the user the forms below, write <run>.config.json
Phase 3  DATA         fetch bars via the data sub-skill, validate coverage
Phase 4  EXECUTE      run in-sample, then out-of-sample, in NautilusTrader
Phase 5  REPORT       markdown summary + backtest bundle at /code/backtests/<slug>/
```

**Read `references/domain_knowledge.md` before Phase 2.** Steering the user away
from look-ahead bias, overfitting, and zero-cost fills is the *point* of this
skill — raise those trade-offs while collecting parameters, not after a run.

---

## Phase 1 — Setup / install

**Goal:** a working engine venv.

**Actions:**
```bash
bash scripts/setup.sh                 # creates .venv-backtest, installs nautilus_trader + requests, self-verifies
source .venv-backtest/bin/activate
python scripts/run_backtest.py --help # should print help after setup
```
Prebuilt wheels (cp311–cp313, ~175 MB, no compiler). Data needs Rebyte API auth
(`AUTH_TOKEN` / `rebyte-auth` / `auth.json`) — resolved automatically. Engine
internals and version notes: `references/nautilus_patterns.md`.

**Gate:** `setup.sh` printed a `nautilus_trader <version>` line and `OK`.

If `run_backtest.py` reports `ModuleNotFoundError: nautilus_trader`, setup has
not been run in the current environment. Run `bash scripts/setup.sh`, then
activate `.venv-backtest`.

---

## Phase 2 — Parameter collection (ask the user)

**Goal:** a complete `<run>.config.json`, with the user's informed choices.

**Actions:** Ask the two forms below with `AskUserQuestion` (skip any parameter
the user already gave; otherwise apply the **(Recommended)** option). Explain the
trade-off when it matters — especially costs and the OOS split. Then copy
`config.example.json` to `<run>.config.json` and fill it in from the answers
(mapping shown after the forms).

### Form A — Strategy & scope (one AskUserQuestion call, 4 questions)

- **Universe** — *header:* `Universe`
  - `Large-cap tech sample (Recommended)` — AAPL, MSFT, NVDA, AMZN, GOOGL
  - `Single ticker` — AAPL only (fastest to reason about)
  - `Diversified sample` — AAPL, JPM, XOM, JNJ, PG (cross-sector)
  - *(Other → user gives a custom ticker list)*
  - > Note in your ask: any hand-picked set is **not** survivorship-bias-free.
- **Date range** — *header:* `Date range`
  - `2022-01-01 → today (Recommended)` — spans a bear market + recovery
  - `Last 12 months` — recent regime only
  - `2021-06 → today` — maximum daily history available (`us.eod` starts 2021-06)
  - *(Other → custom start/end)*
- **Interval** — *header:* `Interval`
  - `Daily (Recommended)` — swing/position; cheap, long history (`us.eod`)
  - `1-minute intraday` — `us.bars_1m`; large and slow, bound the window
- **Strategy** — *header:* `Strategy`
  - `SMA crossover — built-in (Recommended)` — `strategies/sma_cross.py`
  - `EMA crossover — built-in` — bundled `nautilus_trader` example
  - *(Other → user wants a custom strategy; you'll write one, see Phase 4)*

### Form B — Capital & realism (one AskUserQuestion call, 3 questions)

- **Capital & account** — *header:* `Capital`
  - `$100k, MARGIN (Recommended)`
  - `$100k, CASH` — no shorting/leverage
  - `$1M, MARGIN`
  - *(Other → custom balance/account)*
- **Costs** — *header:* `Costs`
  - `$1/order + slippage 0.1 (Recommended)` — a reasonable retail baseline
  - `Higher: $5/order + slippage 0.3` — conservative / small-account
  - `Zero costs — frictionless` — ⚠️ not realistic; only for a sanity check
  - *(Other → custom commission/slippage)*
- **In-sample / out-of-sample split** — *header:* `OOS split`
  - `Hold out 30% (Recommended)` — tune on in-sample, judge on out-of-sample
  - `50 / 50` — stricter honesty, less tuning data
  - `No split — full series` — exploratory only; do not report as validated

### Answer → config mapping

| Answer | Config field |
|---|---|
| Universe | `data.tickers` |
| Date range | `data.start`, `data.end` (`"today"` allowed) |
| Interval | `data.interval` (`1day`→`us.eod`, `1min`→`us.bars_1m`) |
| Strategy | `strategy.path` + `strategy.config_path` + `strategy.params` |
| Capital & account | `venue.starting_balance`, `venue.account_type` |
| Costs | `venue.commission_per_order_usd`, `venue.slippage_prob` |
| OOS split | `evaluation.oos_split` |

Config schema (copy `config.example.json`):

```jsonc
{
  "run_name": "aapl_msft_sma_2024",
  "data":  { "source_table": "us.eod", "interval": "1day",
             "tickers": ["AAPL","MSFT"], "start": "2024-01-01",
             "end": "today", "cache_dir": "data_cache" },
  "venue": { "name": "XNAS", "account_type": "MARGIN", "base_currency": "USD",
             "starting_balance": 100000, "price_precision": 2,
             "commission_per_order_usd": 1.0, "slippage_prob": 0.1 },
  "strategy": { "path": "strategies.sma_cross:SMACross",
                "config_path": "strategies.sma_cross:SMACrossConfig",
                "params": { "fast_period": 10, "slow_period": 30, "trade_size": 100 } },
  "evaluation": { "oos_split": 0.3, "warmup_bars": 30, "random_seed": 42 }
}
```

**Gate:** `<run>.config.json` exists and every field is filled from a user
answer or a stated default. `strategy.params.slow_period` (or the slowest
indicator) ≤ `evaluation.warmup_bars`.

For a quick local smoke run, copy `config.example.json` and narrow it before
fetching:

```bash
cp config.example.json smoke.config.json
# edit smoke.config.json: one ticker, a short completed date range, e.g.
# "tickers":["AAPL"], "start":"2026-07-02", "end":"2026-07-02"
```

---

## Phase 3 — Data selection via the data sub-skill

**Goal:** validated local bars for every ticker.

**Actions:**
```bash
python scripts/fetch_data.py --config <run>.config.json      # --force to re-pull
```
Pulls the config's tickers/range into `data_cache/` as CSV, from the
financial data lake SQL service (`1day → us.eod`, `1min → us.bars_1m`). To explore
what's available first, use the data sub-skill workflow directly:
```bash
python3 ../data/scripts/financial_cli.py catalog
python3 ../data/scripts/financial_cli.py schema us.eod
```
Tables, SQL dialect, and data caveats: `references/data_sources.md`.

**Validate** the printed summary before running: each ticker returned enough
bars (≥ warmup + a meaningful test), the date range matches the request, and no
ticker came back near-empty (typo / delisted). If the window spans a known
split, confirm adjustment (see data_sources.md — `us.eod` is raw OHLCV).

**Gate:** every ticker has a non-trivial bar count and the coverage matches the
config.

---

## Phase 4 — Backtest execution (NautilusTrader)

**Goal:** in-sample and out-of-sample results.

**Actions:**
```bash
python scripts/run_backtest.py --config <run>.config.json --split in                 # tune here
python scripts/run_backtest.py --config <run>.config.json --split out --report out.json  # judge here
python scripts/run_backtest.py --config <run>.config.json --split full               # full-series view
```

Or run the wired setup -> fetch -> execute path:

```bash
bash scripts/run_workflow.sh --config <run>.config.json --splits in,out,full
```
One runner, any strategy, any universe. It builds the engine with commission +
slippage from the config, plugs in the configured strategy, runs event-driven,
and prints metrics (plus optional `--report` JSON).

**Swapping strategies is config-only** — point `strategy.path` /
`strategy.config_path` at any `Strategy`/`StrategyConfig` pair (a file in
`strategies/`, or a bundled one such as
`nautilus_trader.examples.strategies.ema_cross:EMACross`). To write a **custom
strategy**, copy `strategies/sma_cross.py` — it documents the plug-in contract
(first two config fields are `instrument_id` and `bar_type`, injected by the
runner). Engine assembly and the pandas-3.0 wrangler trap: `references/nautilus_patterns.md`.

**Gate:** in-sample and out-of-sample runs both completed and emitted metrics.

---

## Phase 5 — Results reporting

**Goal:** an honest report the user can act on.

**Actions:** Compare in-sample vs out-of-sample, and against buy-and-hold the
same universe. ALWAYS use this template:

```markdown
## Backtest: <run_name>
**Setup:** <universe> · <interval> · <start>→<end> · <strategy+params> · <capital/account> · costs <commission>/order, slippage <p>

| Metric | In-sample | Out-of-sample |
|---|---|---|
| Total return / PnL% | | |
| Sharpe (252d) | | |
| Max drawdown | | |
| Trades (orders/positions) | | |
| Final balance | | |

**Read:** <1–3 sentences: did OOS hold up vs in-sample? vs buy-and-hold?>
**Limitations:** bar-only fills (no order book); self-selected universe (survivorship);
costs modelled not exact; OOS is one pass, not a guarantee. <plus any data caveat hit>
```

A strong in-sample number that collapses out-of-sample is **overfitting** — say
so plainly. Never present a return without its drawdown and trade count.

### Backtest bundle delivery (`rebyte.backtest.v1`) — the deliverable

Every completed backtest is delivered as a **bundle**: a directory at the
**absolute path** `/code/backtests/<slug>/` (kebab-case slug, e.g.
`sma-cross-aapl-2024`). The Rebyte relay scans `/code/backtests/` at
end-of-prompt, validates `manifest.json`, and renders the bundle as a
first-class artifact in the product (headline-metrics card in chat, Report /
Code / Files viewer). Do **NOT** upload the report to the Artifact Store and
do **NOT** emit a `<rebyte-artifacts>` tag for the bundle — detection is
automatic; an invalid manifest means the bundle is silently absent from the
product, so treat the checklist below as a hard gate.

**Bundle contents (all files flat in the bundle dir):**

| File | Role | Source |
|---|---|---|
| `manifest.json` | — | you write it (spec below) |
| `index.html` | `report` | you build it (self-contained, see below) |
| `strategy.py` | `strategy` | copy of the strategy source used (e.g. `strategies/sma_cross.py`) |
| `config.json` | `config` | copy of `<run>.config.json` |
| `metrics.json` | `metrics` | emitted by the runner |
| `trades.csv` | `trades` | emitted by the runner |
| `equity_curve.csv` | `equity_curve` | emitted by the runner |
| `data_prep.md` | `data_prep` | you write it |
| `factors.json` | `factors` (optional) | only if the run produced factors/signals worth keeping |

Runner-native files come from re-running the judging split with
`--output-dir` (also computes `max_drawdown_pct` into `metrics.json`):

```bash
python scripts/run_backtest.py --config <run>.config.json --split out \
  --output-dir /code/backtests/<slug>/
# no OOS split (exploratory full-series run): use --split full
```

Use the **out-of-sample** run for the bundle when a split exists — the bundle's
headline is the honest number, not the tuned in-sample one.

**`manifest.json` spec** — the relay rejects the bundle unless all of this
holds: `schema` is exactly `rebyte.backtest.v1`; `slug` equals the directory
name; `metrics.total_return_pct` / `metrics.sharpe` / `metrics.max_drawdown_pct`
are numbers; `files[]` lists every file above with its role (roles `report` and
`strategy` are mandatory); file names are flat (no subdirectories). Take the
metric values from `metrics.json` `_headline` (`pnl_pct` → `total_return_pct`).

```json
{
  "schema": "rebyte.backtest.v1",
  "name": "SMA Crossover — AAPL 2024",
  "slug": "sma-cross-aapl-2024",
  "strategy": { "name": "SMA Crossover", "file": "strategy.py",
                "params": { "fast_period": 10, "slow_period": 30 } },
  "tickers": ["AAPL"],
  "interval": "1day",
  "period": { "start": "2024-01-01", "end": "2024-12-31" },
  "split": "holdout-30pct, metrics are out-of-sample",
  "metrics": { "total_return_pct": 12.4, "sharpe": 1.13, "max_drawdown_pct": -8.2,
               "sortino": 1.51, "win_rate": 0.54, "profit_factor": 1.32,
               "final_balance": 112400, "trades": 42 },
  "files": [
    { "name": "index.html", "role": "report" },
    { "name": "strategy.py", "role": "strategy" },
    { "name": "config.json", "role": "config" },
    { "name": "metrics.json", "role": "metrics" },
    { "name": "trades.csv", "role": "trades" },
    { "name": "equity_curve.csv", "role": "equity_curve" },
    { "name": "data_prep.md", "role": "data_prep" }
  ]
}
```

**`index.html` — SELF-CONTAINED, no exceptions.** The product serves this one
file from an isolation domain where sibling files are unreachable, so:

- **Inline the Kami CSS**: paste the contents of `../report-style/styles.css`
  then `../report-style/report.css` into a `<style>` block. (This overrides the
  usual "link, don't inline" Kami rule — bundles are the exception.) Keep the
  full Kami look: parchment `#f5f4ed` canvas, ink-blue `#1B365D` accent,
  serif-led hierarchy, `.kami-table financial` metrics table, `.metric`
  headline numbers.
- **Inline the data**: embed the equity curve and trade markers as JS `const`
  arrays — never `fetch()` a sibling CSV/JSON.
- **Charts**: TradingView Lightweight Charts, same pattern as
  the `financial-charts` skill's `templates/price-chart.html` (CDN `<script>` is fine —
  the isolation domain allows external scripts): an equity-curve chart with
  trade markers (the "replay" view), plus price+signal charts if they help.
- **Content**: the same fields as the markdown template above — Setup line,
  in-sample vs out-of-sample metrics table, Read paragraph, Limitations block —
  plus a short "How the data was prepared" section summarizing `data_prep.md`.

**`data_prep.md`** — how the data was prepared, NOT the data itself: source
table (`us.eod` / `us.bars_1m`), tickers, date range, bar counts per ticker,
in/out split, and any caveats hit (raw OHLCV adjustment, gaps, delistings).
**Never put raw OHLCV bars in the bundle** — derived outputs only (the relay
enforces 25 MB/file, 100 MB/bundle caps).

In the chat body, keep the short markdown summary (template above); the product
attaches the bundle card to the same message automatically.

**Gate:** `/code/backtests/<slug>/` exists with every manifest-listed file;
`manifest.json` follows the spec exactly (slug == dir name, required roles,
numeric headline metrics); `index.html` is self-contained (inline CSS + data,
no relative references) and Kami-styled; no raw bar dumps in the bundle; chat
body uses the markdown template and states the limitations.

---

## Files

```
SKILL.md                      — this phase playbook
config.example.json           — copy per run → <run>.config.json
evals/evals.json              — sample tasks for skill testing (Skill Creator style)
scripts/setup.sh              — Phase 1: install + verify
scripts/fetch_data.py         — Phase 3: data lake → local CSV cache
scripts/run_backtest.py       — Phase 4: config-driven runner (engine + report)
scripts/run_workflow.sh       — setup → fetch → run wrapper for executable path
strategies/sma_cross.py       — example strategy + the plug-in contract
references/domain_knowledge.md — pitfalls, metrics, workflow (READ BEFORE Phase 2)
references/data_sources.md     — data lake tables, SQL, data caveats
references/nautilus_patterns.md— engine assembly, wrangler trap, frictions
```
