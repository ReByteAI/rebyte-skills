---
version: 1
name: financial-charts
description: Render TradingView-style interactive price charts (candlesticks, indicator overlays, trade markers, volume/RSI/MACD panes) from OHLCV data using TradingView's open-source Lightweight Charts. Use for any price/market chart - "K线图", "candlestick chart", "price chart", "backtest chart", "plot the strategy", "chart AAPL", "TradingView-style chart", "show entries and exits on the chart". Do NOT use for non-price visualizations (heatmaps, pie, treemaps) - use the echarts skill for those.
---

# Financial Charts

Declarative TradingView-style charts. You never write chart code: you fill a
JSON **spec** (what panes/series to show) and a JSON **data file** (the
series values), inside a fixed HTML template that renders them with
TradingView's Lightweight Charts v5 (CDN). The platform serves the files and
displays the chart in the Workbench.

## Workflow

1. **Get the data.** Pull OHLCV via the stock-analysis `data` sub-skill (or
   whatever source the task provides). Compute indicator series yourself in
   Python (recipes below).
2. **Write the data file** to `/code/outputs/<slug>.json` (create the
   directory if missing). Format below.
3. **Copy the template** from this skill directory to
   `/code/outputs/<slug>.html` and edit ONLY the
   `<script id="chart-spec" type="application/json">` block: title,
   subtitle, `dataUrl` (must be `./<slug>.json`), panes, notes, asOf.
   Do not touch anything else in the file.

```bash
mkdir -p /code/outputs
cp ~/.skills/financial-charts/template.html /code/outputs/aapl-backtest.html
# then edit the chart-spec block in it, and write aapl-backtest.json
```

4. **Announce it** in your final response exactly as the workbench contract
   requires:

```
<rebyte-output>
aapl-backtest.html
</rebyte-output>
```

Only list the `.html` (the JSON is fetched by it, same directory).

## Spec reference

```json
{
  "title": "AAPL — Momentum Strategy Backtest",
  "subtitle": "Daily bars, SMA(20) overlay, trade markers; volume and RSI(14) panes.",
  "dataUrl": "./aapl-backtest.json",
  "panes": [
    { "stretch": 3, "series": [
        { "type": "candlestick", "data": "ohlc", "title": "AAPL" },
        { "type": "line", "data": "sma20", "title": "SMA 20" },
        { "type": "markers", "data": "trades", "attachTo": "ohlc" } ] },
    { "stretch": 1, "series": [ { "type": "histogram", "data": "volume", "title": "Volume" } ] },
    { "stretch": 1, "series": [ { "type": "line", "data": "rsi", "title": "RSI 14", "color": "#7a5d94" } ] }
  ],
  "notes": ["Assumption lines shown under the chart."],
  "asOf": "2026-07-03"
}
```

- `panes[0]` is the main chart; `stretch` sets relative pane heights.
- `series.type`: `candlestick` | `line` | `area` | `histogram` | `markers`.
- `series.data`: key into the data JSON.
- `markers` need `attachTo`: the data key of a series in the SAME pane.
- `color` optional — the template has a coherent default palette; only set
  it when you need a specific meaning (e.g. benchmark grey).
- Typical layouts: price+SMA+markers / volume / RSI; strategy-vs-benchmark
  as two `line` series in one pane; equity curve as `area` with a drawdown
  `histogram` pane.

## Data file format

One JSON object; each key is a series array **sorted ascending by time, no
duplicate times**. `time` is `"YYYY-MM-DD"` for daily bars or a UNIX
timestamp in seconds for intraday.

```json
{
  "ohlc":   [ { "time": "2025-07-02", "open": 180.1, "high": 183.2, "low": 179.5, "close": 182.4 } ],
  "sma20":  [ { "time": "2025-07-30", "value": 184.2 } ],
  "volume": [ { "time": "2025-07-02", "value": 52000000, "color": "#cdd9e3" } ],
  "rsi":    [ { "time": "2025-07-22", "value": 61.3 } ],
  "trades": [ { "time": "2025-08-26", "position": "belowBar", "shape": "arrowUp",
                "color": "#1f7a5c", "text": "Buy @ 203.4" } ]
}
```

- Volume convention: `#cdd9e3` on up days, `#e3cfcd` on down days.
- Markers: `position` `belowBar`/`aboveBar`, `shape` `arrowUp`/`arrowDown`/
  `circle`/`square`; green `#1f7a5c` buys, red `#b4443c` sells.
- Indicator series start later than price (warm-up window) — that is fine,
  just omit the missing leading rows.

## Indicator recipes (pandas)

```python
import pandas as pd
df = pd.DataFrame(bars)  # columns: time, open, high, low, close, volume

df["sma20"] = df["close"].rolling(20).mean()
df["ema12"] = df["close"].ewm(span=12, adjust=False).mean()

# RSI(14), Wilder's smoothing
delta = df["close"].diff()
gain = delta.clip(lower=0).ewm(alpha=1/14, adjust=False).mean()
loss = (-delta.clip(upper=0)).ewm(alpha=1/14, adjust=False).mean()
df["rsi14"] = 100 - 100 / (1 + gain / loss)

# MACD(12,26,9): plot macd+signal as two lines, hist as histogram pane
ema26 = df["close"].ewm(span=26, adjust=False).mean()
df["macd"] = df["ema12"] - ema26
df["signal"] = df["macd"].ewm(span=9, adjust=False).mean()
df["hist"] = df["macd"] - df["signal"]

# Bollinger(20, 2): three line series in the main pane
mid = df["close"].rolling(20).mean(); sd = df["close"].rolling(20).std()
df["bb_up"], df["bb_lo"] = mid + 2 * sd, mid - 2 * sd

def series(df, col):  # -> [{time, value}] dropping NaN warm-up
    s = df[["time", col]].dropna()
    return [{"time": t, "value": round(v, 4)} for t, v in s.values]
```

## Updating a chart

Re-running the analysis = rewrite the `.json` (and re-announce the same
filename). The HTML template stays untouched; a fresh open shows the new
data. Never inline data into the HTML.
