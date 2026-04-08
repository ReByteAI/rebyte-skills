---
name: memory
description: Persistent memory system. Save facts, search saved memories, and recall past task conversations with full prompt and result. Use at the start of every task to recall context, and at the end to save learnings.
---

# Memory

You have two kinds of memory:

1. **Memories** — Facts you explicitly save (preferences, patterns, decisions). You control these via `save`, `search`, `get`, `list`, `delete`.
2. **Conversation history** — All past task conversations are automatically saved. You can recall them via `recall`. The system manages these — you just search.

Both are scoped to the current user.

**Requires Rebyte API auth** — `$AUTH_TOKEN` and `$API_URL` are set up per the agent's system prompt; use them as Bearer token and base URL.

## How to Use Memory

### At the start of every task

1. Search saved memories for relevant context:
```bash
curl -X POST "$API_URL/api/data/memory/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "project conventions and preferences"}'
```

2. Recall past conversations if the task relates to previous work:
```bash
curl -X POST "$API_URL/api/data/memory/recall" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "deploy script changes", "limit": 5}'
```

### During a task

Save discoveries immediately:
```bash
curl -X POST "$API_URL/api/data/memory/save" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "test-framework",
    "content": "Project uses Vitest for unit tests, Playwright for e2e."
  }'
```

### At the end of every task

Reflect and save what you learned — user preferences, project patterns, corrections.

## Best Practices

1. **Search before saving** — check if a similar memory exists first
2. **Update over create** — use the same key to update rather than making duplicates
3. **Keep memories concise** — one fact per entry, under 500 characters
4. **Use descriptive keys** — kebab-case like `preferred-language`, `project-tech-stack`
5. **Save proactively** — if you learn something, save it

## API Reference

### save — Save a Memory

Upserts by key — creates if new, updates if exists.

```bash
curl -X POST "$API_URL/api/data/memory/save" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "preferred-language", "content": "User prefers TypeScript."}'
```

### search — Search Memories

BM25 + semantic search across saved memories.

```bash
curl -X POST "$API_URL/api/data/memory/search" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "what language does the user prefer", "limit": 10}'
```

### recall — Recall Past Conversations

Search or browse past task conversations. Returns the full user prompt and AI result for each match — not snippets.

**Semantic search** (find conversations by meaning):
```bash
curl -X POST "$API_URL/api/data/memory/recall" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "how did we fix the auth bug", "limit": 5}'
```

**Recent conversations** (no query, sorted by time):
```bash
curl -X POST "$API_URL/api/data/memory/recall" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

**With date range:**
```bash
curl -X POST "$API_URL/api/data/memory/recall" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "2026-03-01",
    "to": "2026-03-05",
    "limit": 10
  }'
```

Parameters:
- `query` (string, optional) — semantic search. If omitted, returns recent conversations.
- `sort` — `"time"` (default) or `"relevance"` (only meaningful with query)
- `from` / `to` (ISO date, optional) — date range filter
- `limit` (number, default 10, max 20)

Response:
```json
{
  "success": true,
  "results": [
    {
      "task_id": "abc-123",
      "prompt_id": "def-456",
      "task_title": "Fix auth bug in login flow",
      "executor": "claude",
      "user_prompt": "Fix the login redirect loop when session expires",
      "result": "I fixed the redirect loop by...",
      "completed_at": "2026-03-04T15:30:00Z"
    }
  ],
  "count": 1
}
```

### list — List All Memories

```bash
curl -X POST "$API_URL/api/data/memory/list" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"limit": 50, "offset": 0}'
```

### get — Get a Memory by Key

```bash
curl -X POST "$API_URL/api/data/memory/get" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "preferred-language"}'
```

### delete — Delete a Memory

```bash
curl -X POST "$API_URL/api/data/memory/delete" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "preferred-language"}'
```
