# Node.js Frameworks

Deploy Node.js web apps with auto-detect. Write your app normally, then run two commands.

## Quick Start

```bash
rebyte build
rebyte deploy
```

That's it. The CLI detects your framework, builds it, and packages everything. No `rebyte.json` needed.

## Supported Frameworks

| Framework | Detection |
|-----------|-----------|
| Next.js | `next.config.*` |
| Nuxt | `nuxt.config.*` |
| Remix | `@remix-run/dev` in deps |
| SvelteKit | `svelte.config.js` |
| Vite | `vite.config.*` |
| Astro | `astro.config.*` |
| Gatsby | `gatsby-config.*` |
| CRA | `react-scripts` in deps |

## Next.js

### Initialize

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### Required: `next.config.ts`

```typescript
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

Both settings are required. `output: 'standalone'` enables serverless-compatible output. `images.unoptimized` is required because Lambda doesn't support on-demand image optimization.

Write your Next.js app normally — pages, API routes, server components, everything works as expected. Then:

```bash
rebyte build
rebyte deploy
```

### Post-Deploy

SSR deployments need ~90 seconds for full CDN propagation. Do NOT debug 500/502/403 errors that appear immediately after deploy — wait 90 seconds first.

## Nuxt

### Initialize

```bash
npx nuxi@latest init .
npm install
```

Write your Nuxt app normally. Then:

```bash
rebyte build
rebyte deploy
```

### Environment Variables

Use Nuxt runtime config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    databaseUrl: '', // set via NUXT_DATABASE_URL env var
    public: {
      apiBase: '', // set via NUXT_PUBLIC_API_BASE env var
    },
  },
});
```

## Remix

### Initialize

```bash
npx create-remix@latest . --template remix-run/remix/templates/remix
```

Write your Remix app normally. Then:

```bash
rebyte build
rebyte deploy
```

## SvelteKit

Write your SvelteKit app normally. Then:

```bash
rebyte build
rebyte deploy
```

## Environment Variables

### User-Defined

Create `.rebyte/.env.production` after building:

```
DATABASE_URL=postgres://...
API_KEY=secret123
```

### Addon Variables

When addons are enabled, their variables are auto-injected into Lambda. See `reference/addons.md`.

### Precedence

1. Addon variables (highest)
2. Platform variables (`REBYTE_DEPLOY_URL`, etc.)
3. `.env.production` (lowest)

Environment variables are **only available server-side** (API routes, server components, loaders), not in client-side code. For client-side config, use framework-specific patterns (e.g., `NEXT_PUBLIC_*` in Next.js).

## Native Modules

Native modules (C/C++ bindings) don't work in Lambda. Use pure JS alternatives:

| Don't Use | Use Instead |
|-----------|-------------|
| `better-sqlite3` | `@libsql/client/http` (with SQLite addon) |
| `sqlite3` | `@libsql/client/http` |
| `bcrypt` | `bcryptjs` |
| `sharp` | External image service |

## Debugging

After deploy, check logs to verify your app is working:
```bash
rebyte logs                  # All logs (last 5 min)
rebyte logs -m 30             # Last 30 minutes
rebyte logs --level ERROR     # Only errors
```

## Common Pitfalls

1. **Next.js: missing `output: 'standalone'`** — build will fail without it.
2. **Next.js: missing `images.unoptimized: true`** — image optimization doesn't work on Lambda.
3. **Debugging errors right after deploy** — SSR needs ~90s for CDN propagation. Wait before investigating.
4. **Running `drizzle-kit migrate` at build time** — database doesn't exist until deploy. Run migrations inside the request handler at cold start.
