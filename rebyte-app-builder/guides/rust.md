# Rust

Deploy Rust web apps (Axum, Actix Web, Rocket) to Rebyte Cloud. Rust compiles to a single static binary that runs on AWS Lambda.

## Two Patterns

### Pattern A: Static Frontend + Rust API

The frontend is a separate JavaScript build (React, Vue, etc.) served from CDN. Rust only handles `/api/*` routes.

### Pattern B: Server-Rendered HTML

Rust generates all HTML directly (using Askama, Tera, Maud, or returning HTML strings). No separate frontend build — everything goes through Lambda.

Both patterns deploy the same way. The difference is whether you have static files and how you set up routes.

## Supported Frameworks

| Framework | How to Adapt |
|-----------|-------------|
| **Axum** | `lambda_http::run(app)` — native integration, Router implements Tower Service |
| **Actix Web** | `lambda_web::run_actix_on_lambda(factory)` via `lambda-web` crate |
| **Rocket** | `lambda_web::run_rocket_on_lambda(rocket)` via `lambda-web` crate |
| **Raw Lambda** | `lambda_runtime::run(handler)` — no web framework |

The official AWS crate is `lambda_http` (from `aws-lambda-rust-runtime`). Axum works natively. For Actix and Rocket, use the `lambda-web` community crate.

## Option 1: Using `rebyte.json` (Recommended)

### Rust API + React Frontend

```json
{
  "static": {
    "path": "frontend/",
    "build": "npm run build",
    "output": "dist/"
  },
  "functions": {
    "default": {
      "runtime": "provided.al2023",
      "handler": "bootstrap",
      "build": "cargo build --release --target x86_64-unknown-linux-musl && cp target/x86_64-unknown-linux-musl/release/my-app bootstrap",
      "output": "bootstrap"
    }
  },
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/functions/default" },
    { "handle": "filesystem" }
  ]
}
```

Then build and deploy:

```bash
rebyte build
rebyte deploy
```

### Rust Server-Rendered (No Frontend)

```json
{
  "functions": {
    "default": {
      "runtime": "provided.al2023",
      "handler": "bootstrap",
      "build": "cargo build --release --target x86_64-unknown-linux-musl && cp target/x86_64-unknown-linux-musl/release/my-app bootstrap",
      "output": "bootstrap"
    }
  }
}
```

For the full `rebyte.json` schema, see `reference/rebyte-json.md`.

## Option 2: Manual `.rebyte/` Setup

### Prerequisites

Install the musl target (one-time):

```bash
rustup target add x86_64-unknown-linux-musl
```

### Axum Example (Best Lambda Integration)

Axum's Router implements the Tower Service trait that `lambda_http` expects natively.

**Cargo.toml:**

```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
lambda_http = "0.13"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["macros"] }
```

**src/main.rs:**

```rust
use axum::{routing::get, Json, Router};
use serde_json::{json, Value};

async fn hello() -> Json<Value> {
    Json(json!({"message": "Hello from Rust on Rebyte Cloud!"}))
}

async fn get_item(axum::extract::Path(id): axum::extract::Path<u32>) -> Json<Value> {
    Json(json!({"item_id": id, "name": format!("Item {}", id)}))
}

#[tokio::main]
async fn main() -> Result<(), lambda_http::Error> {
    let app = Router::new()
        .route("/api/hello", get(hello))
        .route("/api/items/{id}", get(get_item));

    lambda_http::run(app).await
}
```

### Actix Web Example

**Cargo.toml:**

```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
actix-web = "4"
lambda-web = { version = "0.2", features = ["actix4"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**src/main.rs:**

```rust
use actix_web::{web, App, HttpResponse};
use serde_json::json;

async fn hello() -> HttpResponse {
    HttpResponse::Ok().json(json!({"message": "Hello from Actix!"}))
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let factory = move || {
        App::new()
            .route("/api/hello", web::get().to(hello))
    };

    lambda_web::run_actix_on_lambda(factory).await?;
    Ok(())
}
```

### Build & Deploy (Manual)

```bash
# 1. Compile for Lambda (static Linux binary)
cargo build --release --target x86_64-unknown-linux-musl

# 2. Create .rebyte/ directory
mkdir -p .rebyte/functions/default.func .rebyte/static

# 3. Copy binary (rename to bootstrap)
cp target/x86_64-unknown-linux-musl/release/my-app .rebyte/functions/default.func/bootstrap

# 4. Copy static frontend (if any)
if [ -d "frontend/dist" ]; then cp -r frontend/dist/* .rebyte/static/; fi

# 5. Write function config
cat > .rebyte/functions/default.func/.vc-config.json << 'EOF'
{
  "runtime": "provided.al2023",
  "handler": "bootstrap",
  "memory": 512,
  "maxDuration": 30
}
EOF

# 6. Write routes config
cat > .rebyte/config.json << 'EOF'
{
  "version": 1,
  "routes": [
    { "src": "^/api/(.*)$", "dest": "/functions/default" },
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/index.html" }
  ]
}
EOF

# 7. Deploy
rebyte deploy
```

For server-rendered apps with no static frontend, simplify the routes:

```json
{
  "version": 1,
  "routes": [
    { "handle": "filesystem" },
    { "src": "^/(.*)$", "dest": "/functions/default" }
  ]
}
```

## Environment Variables

Create `.rebyte/.env.production`:

```
DATABASE_URL=your-database-url
API_KEY=your-api-key
```

Access in Rust: `std::env::var("DATABASE_URL")`.

For addon variables (SQLite, DynamoDB, AI Gateway), see `reference/addons.md`.

## Optimizing Binary Size

Add to `Cargo.toml`:

```toml
[profile.release]
strip = true
lto = true
codegen-units = 1
```

## Limitations

- **250MB package size** — rarely an issue for Rust (binaries are 5–20MB)
- **30 second timeout**
- **Cold starts** — ~50–100ms (fastest of all runtimes)
- **musl target required** — must compile with `x86_64-unknown-linux-musl` for static binaries
- **Compile time** — release builds are slow (2–5 min). Use `--release` for deploys.

## Troubleshooting

**Always check logs first:**
```bash
rebyte logs                  # All logs (last 5 min)
rebyte logs -m 30             # Last 30 minutes
rebyte logs --level ERROR     # Only errors
```

| Error | Cause | Fix |
|-------|-------|-----|
| `exec format error` | Wrong target | Use `--target x86_64-unknown-linux-musl` |
| `bootstrap not found` | Binary not renamed | `cp target/.../my-app .../bootstrap` |
| Linker errors with musl | Missing musl tools | `sudo apt-get install musl-tools` |
| `permission denied` | Binary not executable | `chmod +x .../bootstrap` |
