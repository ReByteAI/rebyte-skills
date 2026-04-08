---
name: internet-search
description: Search the internet for information. Use when you need to find current information, research topics, look up documentation, or verify facts. Triggers include "search the web", "search internet", "look up", "find information", "google", "web search", "search for".
---

# Internet Search

Search the web and get structured results (titles, URLs, snippets).

{{include:auth.md}}

## Step 1: Get Current Time

**IMPORTANT:** Before performing any search, always get the current date and time. Language models have a knowledge cutoff, so you must know the current date to:
- Include the correct year in time-sensitive queries (e.g., "TypeScript best practices 2025" not "2024")
- Understand what "recent", "latest", or "new" means in context
- Evaluate the freshness of search results

```bash
# Get current date and time
date "+%Y-%m-%d %H:%M:%S %Z"
# Example output: 2025-01-15 14:30:00 UTC
```

Use this information to adjust your search queries accordingly. For example, if the current year is 2025, search for "React 19 features 2025" rather than an outdated year.

## When to Use

Use this skill when you need to:
- Find current information not in your training data
- Research a topic or technology
- Look up documentation or tutorials
- Verify facts or find sources
- Find examples or implementations

## Search the Web

```bash
curl -X POST "$API_URL/api/data/search/web" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "TypeScript best practices 2024",
    "maxResults": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "query": "TypeScript best practices 2024",
  "resultCount": 5,
  "results": [
    {
      "rank": 1,
      "title": "TypeScript Best Practices - Official Documentation",
      "url": "https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html",
      "snippet": "Best practices for writing TypeScript code including type annotations, interfaces, and common patterns...",
      "siteName": "typescriptlang.org"
    },
    {
      "rank": 2,
      "title": "10 TypeScript Best Practices for 2024",
      "url": "https://example.com/typescript-best-practices",
      "snippet": "Learn the latest TypeScript best practices including strict mode, utility types, and modern patterns...",
      "siteName": "example.com"
    }
  ]
}
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | - | Search query. Be specific for better results. |
| `maxResults` | number | No | 10 | Maximum results to return (1-20) |

## Search Tips

**Be specific** - More specific queries get better results:
- Bad: "react"
- Good: "React useEffect cleanup function examples"

**Include context** - Add relevant keywords:
- Bad: "how to deploy"
- Good: "deploy Next.js app to Vercel production"

**Use quotes for exact phrases**:
- `"error: ENOENT"` - Find exact error message
- `"async/await" TypeScript` - Find specific concept

## Example: Research a Topic

```bash
# Get auth
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")

# Search for information
curl -s -X POST "$API_URL/api/data/search/web" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Rust async runtime tokio vs async-std comparison",
    "maxResults": 5
  }' | jq '.results[] | {title, url, snippet}'
```

## Example: Find Documentation

```bash
curl -s -X POST "$API_URL/api/data/search/web" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "site:docs.rs tokio spawn_blocking",
    "maxResults": 3
  }' | jq '.results'
```

## Example: Debug an Error

```bash
curl -s -X POST "$API_URL/api/data/search/web" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "\"ECONNREFUSED 127.0.0.1:5432\" postgres docker",
    "maxResults": 5
  }' | jq '.results'
```

## Error Handling

| Error | Meaning | Fix |
|-------|---------|-----|
| `configuration_error` | API key not set | Contact administrator |
| `invalid_input` | Empty query | Provide a search query |
| `rate_limit` | Too many requests | Wait and retry |
| `timeout` | Search took too long | Try simpler query |

## API Reference

### Search Web

```
POST /api/data/search/web
```

Search the internet and return structured results.

**Request Body:**
```json
{
  "query": "your search query",
  "maxResults": 10
}
```

**Response:**
```json
{
  "success": true,
  "query": "your search query",
  "resultCount": 10,
  "results": [
    {
      "rank": 1,
      "title": "Page Title",
      "url": "https://example.com/page",
      "snippet": "Description or excerpt from the page...",
      "siteName": "example.com"
    }
  ]
}
```
