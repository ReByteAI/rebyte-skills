---
name: rebyte-app-builder
description: Deploy web applications to Rebyte Cloud — a managed deployment platform (like Vercel). Supports Node.js SSR frameworks (auto-detect), static sites, Python, Go, and Rust backends. Deploys via `rebyte deploy` with zero configuration for Node.js, or via `rebyte.json` for other languages.
---

# Rebyte Cloud

Deploy web applications with zero configuration. No API keys, no cloud accounts, no setup.

{{include:non-technical-user.md}}

## What Are You Deploying?

| Language / Framework | Mode | Guide |
|---------------------|------|-------|
| **Next.js, Nuxt, Remix, SvelteKit, Astro SSR** | Auto-detect — `rebyte build && rebyte deploy` | `guides/nodejs-frameworks.md` |
| **Vite, Gatsby, CRA, plain HTML** | Auto-detect or manual | `guides/static-sites.md` |
| **Python** (FastAPI, Flask, Django) | Manual — create `.rebyte/` + `rebyte deploy` | `guides/python.md` |
| **Go** (Gin, Echo, Chi) | Manual — compile binary + `rebyte deploy` | `guides/go.md` |
| **Rust** (Axum, Actix Web, Rocket) | Manual — compile binary + `rebyte deploy` | `guides/rust.md` |

## NOT Supported

Do NOT attempt to deploy these — they will fail:

- **Express, Fastify, Koa, Hono** — raw Node.js HTTP servers. Use Next.js API routes or a full framework instead.
- **Docker containers** — Rebyte is serverless (Lambda + CDN), not container-based.

**External databases are fine.** Rebyte doesn't host Postgres/MySQL/MongoDB, but your Lambda can connect to any external database via environment variables. For managed databases built into Rebyte, use the SQLite or DynamoDB addon.

## Addons

For SQLite, DynamoDB, or AI Gateway (LLM access), see `reference/addons.md`.

## CLI Reference

For all CLI commands (`deploy`, `info`, `logs`, `delete`, `addon`), see `reference/cli.md`.

## Config Reference

For `rebyte.json` (Python/Go/Rust builds), see `reference/rebyte-json.md`. Node.js projects should NOT use `rebyte.json` — use auto-detect instead.
