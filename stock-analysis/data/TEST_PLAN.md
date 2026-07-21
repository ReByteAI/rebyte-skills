# Test Plan

Validate that the skill exposes exactly the market-agnostic workflow
**catalog → schema → query** through the Relay Data API.

## Static Checks

1. `SKILL.md` frontmatter contains only `name` and `description`.
2. No hardcoded API key is present.
3. The CLI resolves auth from `AUTH_TOKEN`, `rebyte-auth`, or `/home/user/.rebyte.ai/auth.json`.
4. SQL validation rejects mutating statements and multiple statements.
5. The CLI has no required third-party Python dependency; `requests` is optional and the stdlib fallback is available.
6. API responses with `success: false` fail the command even when the HTTP status is 200.
7. The CLI exposes only `catalog`, `schema`, and `query` — no market-specific commands.

## Commands

| # | Command | Expected |
|---|---------|----------|
| 1 | `python3 scripts/anyfinancial_cli.py catalog --report` | Calls financial/catalog; lists every table + one-line description (add `--market us\|cn` to filter) |
| 2 | `python3 scripts/anyfinancial_cli.py schema cn.bars_1m --report` | Calls financial/schema; returns live per-column `name`, `type`, `doc` (pass several tables to batch) |
| 3 | `python3 scripts/anyfinancial_cli.py query "SELECT * FROM cn.bars_1m LIMIT 10" --report` | Calls SQL endpoint and reports HTTP result, `rowCount`, first 3 rows, and error |
| 4 | `python3 scripts/anyfinancial_cli.py schema "cn.bars_1m; DROP TABLE x"` | Fails before network request (invalid table identifier) |
| 5 | `python3 scripts/anyfinancial_cli.py query "DELETE FROM cn.bars_1m WHERE 1=1"` | Fails before network request |
| 6 | `python3 scripts/anyfinancial_cli.py query "SELECT 1; SELECT 2"` | Fails before network request |
| 7 | `python3 -S scripts/anyfinancial_cli.py catalog --report` | Uses the stdlib fallback path; calls catalog or reports the underlying TLS/connection reason clearly |

## Manual Connectivity

In a Rebyte VM/workspace:

```bash
AUTH_TOKEN="$(rebyte-auth 2>/dev/null || jq -r '.sandbox.token' /home/user/.rebyte.ai/auth.json)"
API_URL="$(jq -r '.sandbox.relay_url // empty' /home/user/.rebyte.ai/auth.json 2>/dev/null || true)"
API_URL="${API_URL:-https://api.rebyte.ai}"

curl -fsS -X POST "$API_URL/api/data/financial/catalog" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"market":"cn"}' | jq '.'
```
