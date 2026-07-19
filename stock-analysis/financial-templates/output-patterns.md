# Finance-Specific Output Patterns

**Template status:** Use these instruction patterns to keep financial outputs
clear, source-grounded, and decision-useful.

## Fact vs Analysis

Use explicit labels:

- **Fact:** `<source-grounded statement with date and unit>`
- **Analysis:** `<interpretation of the fact>`
- **Assumption:** `<model input chosen by analyst/user>`
- **Unknown:** `<missing data or unresolved question>`

## Minimum Provenance

For every populated table, include:

- Source.
- As-of date.
- Currency.
- Units.
- Period basis: annual, quarterly, TTM, LTM, point-in-time.

## Finance Report Skeleton

```markdown
## Executive Read
- <Key conclusion with source/date>

## Evidence
| Claim | Evidence | Source | Date |
|---|---|---|---|

## Analysis
<Interpretation, sensitivities, and caveats>

## Risks / Limitations
- <Known data or model limitation>

## Follow-Up
- <Next verification or analysis step>
```

## Backtesting Output Rule

Never present return without:

- Date range.
- Universe.
- Strategy parameters.
- Costs/slippage.
- Trade count.
- Drawdown or risk metric.
- In-sample vs out-of-sample status.

## Valuation Output Rule

Never present implied value without:

- Valuation date.
- Method.
- Key assumptions.
- Sensitivity range.
- Share count / net debt source.

## HTML Artifact Output

When an analysis, report, dashboard, or backtest result is produced as HTML,
follow the umbrella convention (see the top-level `SKILL.md`): render the HTML,
**upload it to the Artifact Store**, and deliver it via a `<rebyte-artifacts>`
tag. An un-uploaded local file never reaches the user.

Concrete steps (full spec in the top-level `CLAUDE.md` → *Artifact Store*):

- Build the HTML in the working directory, **styled with the Kami design
  system** (mandatory — see `../report-style/README.md`): warm parchment
  `#f5f4ed` canvas (never pure white), single ink-blue `#1B365D` accent,
  serif-led hierarchy (one serif, weight 500, no bold/italic), warm grays, and
  editorial whitespace. A report is **two parts** — **link** the shared
  `../report-style/styles.css` then `../report-style/report.css` (as hosted
  public-artifact `publicUrl`s, or bundle `report-style/` alongside); the HTML
  carries no inline CSS. Set the root `lang` and use the Kami classes
  (`.section-title`, `.kami-table`, `.metric`, `.quote`). Use a file name that is
  kebab- or snake-case, unique per run, and includes the ticker or run-name and
  an ISO date. Example: `aapl_dcf_20260705.html`, `strategy_sma_2024_in_sample.html`.
- Ensure `AUTH_TOKEN` and `API_URL` are set, then request signed upload URLs
  and upload the file:

  ```bash
  UPLOAD_INFO=$(curl -s -X POST "$API_URL/api/artifacts/upload-url" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"files":[{"name":"aapl_dcf_20260705.html","contentType":"text/html"}]}')

  curl -X PUT "$(echo "$UPLOAD_INFO" | jq -r '.urls[0].uploadUrl')" \
    -H "Content-Type: text/html" --data-binary @aapl_dcf_20260705.html
  ```

- Follow the `instruction` returned by the API — reference each delivered file
  in the final chat with a `<rebyte-artifacts>` tag containing **only the file
  name**:

  ```
  <rebyte-artifacts>aapl_dcf_20260705.html</rebyte-artifacts>
  ```

- One tag per file. Multiple tags when a task produces multiple artifacts.
- If the HTML embeds images/fonts, upload those with `"public": true` and embed
  the returned `publicUrl` (no relative paths, no base64 data URIs).
- Do NOT paste `<html>…</html>` or long report HTML inline in the chat body.
  The chat body is for a short markdown summary only; the HTML is delivered
  through the uploaded artifact.
- Populated templates rendered as HTML must still preserve provenance
  fields (source, as-of date, currency, units, period basis) inside the
  HTML — neither the artifact convention nor the Kami styling relaxes the
  provenance rules above. Kami governs form only; content rules stand.
