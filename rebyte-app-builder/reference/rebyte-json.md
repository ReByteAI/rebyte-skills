# rebyte.json

Project config file for explicit build control. When present, `rebyte build` reads it and runs your build commands to produce `.rebyte/`.

**Do NOT use `rebyte.json` for Node.js** — use auto-detect instead (`rebyte build` without config). `rebyte.json` is for Python, Go, Rust, monorepos, or when you need explicit control.

## Schema

```json
{
  "static": { ... },
  "functions": { ... },
  "routes": [ ... ],
  "addons": [ ... ]
}
```

All fields are optional, but at least one of `static` or `functions` must be defined.

## static

Declares how to build and where to find static assets (HTML, CSS, JS).

```json
{
  "static": {
    "path": "frontend/",
    "build": "npm run build",
    "output": "dist/"
  }
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `path` | string | No | `"."` | Directory containing static source, relative to project root |
| `build` | string | No | — | Shell command to build static assets. Runs inside `path`. |
| `output` | string | **Yes** | — | Build output directory, relative to `path`. Copied to `.rebyte/static/`. |

If `build` is omitted, no build step runs — the CLI just copies `output` directly.

## functions

Declares one or more Lambda functions. Each key is the function name (used in routes).

```json
{
  "functions": {
    "default": {
      "path": "server/",
      "runtime": "provided.al2023",
      "handler": "bootstrap",
      "build": "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap",
      "output": "bootstrap",
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `path` | string | No | `"."` | Function source directory, relative to project root |
| `runtime` | string | **Yes** | — | Lambda runtime (see table below) |
| `handler` | string | **Yes** | — | Entry point (e.g. `handler.handler`, `bootstrap`) |
| `build` | string | No | — | Shell command to build. Runs inside `path`. |
| `output` | string | **Yes** | — | Build output, relative to `path`. Copied to `.rebyte/functions/{name}.func/`. |
| `memory` | number | No | `1024` | Memory in MB (128–3008) |
| `maxDuration` | number | No | `30` | Timeout in seconds (max 30) |

### Supported Runtimes

| Runtime | Language | Handler | Output |
|---------|----------|---------|--------|
| `nodejs20.x` | Node.js | `index.handler` | Bundled JS file or directory |
| `python3.12` | Python | `handler.handler` | Directory with .py files + pip deps |
| `provided.al2023` | Go / Rust | `bootstrap` | Single compiled binary named `bootstrap` |

### Output Handling

- **If `output` is a file** (e.g. `bootstrap`): copied into `.rebyte/functions/{name}.func/`
- **If `output` is a directory** (e.g. `.`): directory contents copied into `.rebyte/functions/{name}.func/`

## routes

Request routing rules. Optional — if omitted, sensible defaults are generated.

```json
{
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/functions/default" },
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/index.html" }
  ]
}
```

Routes are processed in order. Static files in `.rebyte/static/` are always served first when `{ "handle": "filesystem" }` is present.

| Field | Description |
|-------|-------------|
| `src` | Regex pattern to match request path |
| `dest` | Destination: `/functions/{name}` for Lambda, or a static file path |
| `handle` | Special handler (`"filesystem"` serves static files) |
| `headers` | Response headers to add |
| `status` | HTTP status code (for redirects) |

## addons

Declare addons to provision alongside your deployment.

```json
{
  "addons": ["sqlite", "ai-gateway"]
}
```

See `reference/addons.md` for addon details.

## Examples

### Static site (Vite React)

```json
{
  "static": {
    "build": "npm run build",
    "output": "dist/"
  }
}
```

### FastAPI + React frontend

```json
{
  "static": {
    "path": "frontend/",
    "build": "npm run build",
    "output": "dist/"
  },
  "functions": {
    "default": {
      "path": "server/",
      "runtime": "python3.12",
      "handler": "handler.handler",
      "build": "pip3 install -r requirements.txt --target . --platform manylinux2014_x86_64 --only-binary=:all: --python-version 3.12",
      "output": "."
    }
  },
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/functions/default" },
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/index.html" }
  ],
  "addons": ["sqlite"]
}
```

### Go API + static frontend

```json
{
  "static": {
    "path": "frontend/",
    "build": "npm run build",
    "output": "dist/"
  },
  "functions": {
    "default": {
      "path": "server/",
      "runtime": "provided.al2023",
      "handler": "bootstrap",
      "build": "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap",
      "output": "bootstrap"
    }
  },
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/functions/default" },
    { "handle": "filesystem" }
  ]
}
```

### Rust (Axum) API only

```json
{
  "functions": {
    "default": {
      "runtime": "provided.al2023",
      "handler": "bootstrap",
      "build": "cargo build --release --target x86_64-unknown-linux-musl && cp target/x86_64-unknown-linux-musl/release/myapp bootstrap",
      "output": "bootstrap"
    }
  }
}
```

### Monorepo with multiple functions

```json
{
  "static": {
    "path": "packages/web/",
    "build": "npm run build",
    "output": "dist/"
  },
  "functions": {
    "api": {
      "path": "packages/api/",
      "runtime": "nodejs20.x",
      "handler": "index.handler",
      "build": "npm run build",
      "output": "dist/"
    },
    "worker": {
      "path": "packages/worker/",
      "runtime": "python3.12",
      "handler": "handler.handler",
      "build": "pip3 install -r requirements.txt --target dist/ && cp -r src/* dist/",
      "output": "dist/"
    }
  },
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/functions/api" },
    { "src": "^/worker/(.*)$", "dest": "/functions/worker" },
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/index.html" }
  ]
}
```
