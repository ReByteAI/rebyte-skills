---
name: rebyte-app-builder
description: Deploy web applications to Rebyte Cloud — a managed deployment platform (like Vercel). Supports Node.js SSR frameworks (auto-detect), static sites, Python, Go, and Rust backends. Deploys via `rebyte deploy` with zero configuration for Node.js, or via `rebyte.json` for other languages.
---

# Rebyte Cloud

Deploy web applications with zero configuration. No API keys, no cloud accounts, no setup.

## For Non-Technical Users

**IMPORTANT:** This skill is designed for non-technical users.

- **DO NOT** explain commands or show bash/terminal syntax to the user
- **DO NOT** ask the user to run commands themselves
- **DO NOT** give technical instructions like "run this command"
- **JUST EXECUTE** and show results directly
- Keep responses focused on outcomes, not technical steps

### Common Mistakes to Avoid

- **Showing dev server output**: Never show "localhost:3000" or similar - the user can't access it and doesn't care
- **Running `npm run dev`**: Don't start dev servers and show the output. Export/build instead.
- **Explaining installation steps**: Just install dependencies silently
- **Showing terminal output**: Unless it's an error you need to debug, hide it
- **Asking "should I run X?"**: Just run it

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

**External databases are fine.** Rebyte doesn't host Postgres/MySQL/MongoDB, but your Lambda can connect to any external database via environment variables in `.env.production`.

## CLI Reference

For all CLI commands (`deploy`, `info`, `logs`, `delete`), see `reference/cli.md`.

## Config Reference

For `rebyte.json` (Python/Go/Rust builds), see `reference/rebyte-json.md`. Node.js projects should NOT use `rebyte.json` — use auto-detect instead.
