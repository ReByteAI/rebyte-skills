---
name: cloud-schedule
description: "ReClaw/Zeroclaw-only: create, list, update, and delete scheduled tasks. Only works with the ReClaw (Zeroclaw) agent via messaging channels (Telegram, Slack, etc.). Does NOT work with Claude Code, Codex, Rebyte Code, or other coding agents — those should set schedules in the UI instead."
---

# Cloud Schedule (ReClaw / Zeroclaw Only)

**IMPORTANT: This skill only works with the ReClaw (Zeroclaw) agent.** If you are Claude Code, Codex, Rebyte Code, or any other coding agent, do NOT use this skill — it will not work. Tell the user to set schedules in the UI instead.

Schedule prompts to run automatically and deliver results to a messaging channel. Schedules are managed by the cloud infrastructure and survive VM hibernation — you don't need to keep running.

**Limits:** Maximum 3 active schedules per workspace.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

## When to Use

Only use this skill if you are the Zeroclaw agent running inside a channel (Telegram, Slack, Discord, etc.). Use when the user asks to:
- Set a reminder or recurring task
- Run something on a schedule (daily, hourly, etc.)
- Send periodic updates to a channel (Telegram, Slack, etc.)
- Create a one-time delayed task

## Required Context

You need the **channel** and **recipient** from the current conversation context. These are provided in your system prompt when the user is messaging you through a channel:
- `channel` — the platform name (e.g. `telegram`, `slack`, `discord`, `whatsapp`, `email`, `feishu`, `lark`)
- `reply_target` — the platform-specific recipient ID (chat_id, channel_id, etc.)

If you don't have channel context (e.g. the user is on the web UI), ask which channel and recipient to deliver to.

## API Reference

All endpoints: `POST $API_URL/api/data/schedule/{operation}`

### create — Create a Schedule

```bash
curl -X POST "$API_URL/api/data/schedule/create" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Check Bitcoin price and summarize the trend",
    "channel": "telegram",
    "recipient": "941269662",
    "cron_expression": "0 9 * * *",
    "timezone": "America/New_York",
    "title": "Daily BTC update"
  }'
```

Parameters:
- `prompt` (string, required) — The prompt to execute on each run
- `channel` (string, required) — Delivery channel: `telegram`, `slack`, `discord`, `whatsapp`, `email`, `feishu`, `lark`
- `recipient` (string, required) — Channel-specific recipient ID
- `cron_expression` (string, required) — Cron expression (e.g. `"0 9 * * *"` for daily at 9am) or `"once"` for one-time
- `timezone` (string, optional) — IANA timezone, default `UTC`
- `title` (string, optional) — Human-readable name
- `scheduled_at` (string, optional) — ISO8601 datetime, required when `cron_expression` is `"once"`
- `expires_at` (string, optional) — ISO8601 datetime after which the schedule stops
- `max_runs` (number, optional) — Maximum number of executions

**One-time schedule example:**
```bash
curl -X POST "$API_URL/api/data/schedule/create" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Remind me to check the deployment",
    "channel": "telegram",
    "recipient": "941269662",
    "cron_expression": "once",
    "scheduled_at": "2026-03-18T14:00:00Z",
    "title": "Deployment reminder"
  }'
```

### list — List All Schedules

```bash
curl -X POST "$API_URL/api/data/schedule/list" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### get — Get a Schedule by ID

```bash
curl -X POST "$API_URL/api/data/schedule/get" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "uuid-here"}'
```

### update — Update a Schedule

Only provided fields are changed.

```bash
curl -X POST "$API_URL/api/data/schedule/update" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-here",
    "prompt": "Updated prompt text",
    "cron_expression": "0 */2 * * *"
  }'
```

### delete — Delete a Schedule

```bash
curl -X POST "$API_URL/api/data/schedule/delete" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"id": "uuid-here"}'
```

## Common Cron Expressions

| Expression | Meaning |
|-----------|---------|
| `*/30 * * * *` | Every 30 minutes |
| `0 * * * *` | Every hour |
| `0 9 * * *` | Daily at 9:00 AM |
| `0 9 * * 1-5` | Weekdays at 9:00 AM |
| `0 9,18 * * *` | At 9:00 AM and 6:00 PM |
| `0 0 * * 0` | Weekly on Sunday midnight |
| `0 0 1 * *` | Monthly on the 1st |
| `once` | One-time (requires `scheduled_at`) |

## Example Flows

**User says "remind me in 30 minutes to check the build":**
1. Calculate `scheduled_at` = now + 30 minutes (ISO8601 UTC)
2. Use `channel` and `reply_target` from your system prompt context
3. Call `create` with `cron_expression: "once"` and the calculated `scheduled_at`

**User says "every morning at 9am, summarize HN top stories":**
1. Ask the user's timezone if not known
2. Call `create` with `cron_expression: "0 9 * * *"` and their timezone

**User says "stop my daily reminder":**
1. Call `list` to find matching schedules
2. Call `delete` with the schedule ID
