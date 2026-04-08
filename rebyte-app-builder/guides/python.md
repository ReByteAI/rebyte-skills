# Python

Deploy Python web apps (FastAPI, Flask, Django) to Rebyte Cloud. Python runs on AWS Lambda with a handler adapter.

## Two Patterns

### Pattern A: Static Frontend + Python API

The frontend is a separate JavaScript build (React, Vue, etc.) served from CDN. Python only handles `/api/*` routes.

### Pattern B: Server-Rendered HTML

Python generates all HTML directly (Flask `render_template`, Django templates, FastAPI `HTMLResponse`). No separate frontend build — everything goes through Lambda.

Both patterns deploy the same way. The difference is whether you have static files and how you set up routes.

## Supported Frameworks

| Framework | Adapter | Type |
|-----------|---------|------|
| **FastAPI** | Mangum | ASGI → Lambda |
| **Flask** | apig-wsgi | WSGI → Lambda |
| **Django** | Mangum | ASGI → Lambda |

## Option 1: Using `rebyte.json` (Recommended)

The CLI handles building, packaging, and deploying. Create a `rebyte.json` in your project root.

### FastAPI + React Frontend

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
  ]
}
```

Then build and deploy:

```bash
rebyte build
rebyte deploy
```

### FastAPI Server-Rendered (No Frontend)

```json
{
  "functions": {
    "default": {
      "path": ".",
      "runtime": "python3.12",
      "handler": "handler.handler",
      "build": "pip3 install -r requirements.txt --target . --platform manylinux2014_x86_64 --only-binary=:all: --python-version 3.12",
      "output": "."
    }
  }
}
```

### Flask

Same structure, but your `handler.py` uses `apig-wsgi` instead of Mangum (see handler examples below).

For the full `rebyte.json` schema, see `reference/rebyte-json.md`.

## Option 2: Manual `.rebyte/` Setup

Create the `.rebyte/` directory yourself, then run `rebyte deploy` directly. No `rebyte.json` or `rebyte build` needed.

### FastAPI Example

**Project structure:**

```
my-app/
├── requirements.txt
├── main.py
├── frontend/        # Optional: static frontend
│   └── dist/
└── handler.py
```

**requirements.txt:**

```
fastapi>=0.100.0
uvicorn[standard]>=0.23.0
mangum>=0.17.0
```

**main.py:**

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/api/hello")
async def hello():
    return {"message": "Hello from FastAPI on Rebyte Cloud!"}

@app.get("/api/items/{item_id}")
async def get_item(item_id: int):
    return {"item_id": item_id, "name": f"Item {item_id}"}
```

**handler.py** (Mangum adapter):

```python
from mangum import Mangum
from main import app

handler = Mangum(app)
```

**Build & Deploy:**

```bash
# 1. Create .rebyte/ directory
mkdir -p .rebyte/functions/default.func .rebyte/static

# 2. Install dependencies for Lambda Linux
pip3 install -r requirements.txt \
  --target .rebyte/functions/default.func/ \
  --platform manylinux2014_x86_64 \
  --only-binary=:all: \
  --python-version 3.12

# If above fails for pure-Python packages, fallback:
pip3 install -r requirements.txt --target .rebyte/functions/default.func/

# 3. Copy Python source files
cp main.py handler.py .rebyte/functions/default.func/

# 4. Copy static frontend (if any)
if [ -d "frontend/dist" ]; then cp -r frontend/dist/* .rebyte/static/; fi

# 5. Write function config
cat > .rebyte/functions/default.func/.vc-config.json << 'EOF'
{
  "runtime": "python3.12",
  "handler": "handler.handler",
  "memory": 1024,
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

### Flask Example

**requirements.txt:**

```
flask>=3.0.0
apig-wsgi>=2.18.0
```

**app.py:**

```python
from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask on Rebyte Cloud!"})
```

**handler.py** (Flask uses apig-wsgi, NOT Mangum):

```python
from apig_wsgi import make_lambda_handler
from app import app

handler = make_lambda_handler(app)
```

Same build steps as FastAPI — just copy `app.py` and `handler.py` instead.

### Django Example

**requirements.txt:**

```
django>=4.2
mangum>=0.17.0
```

**Build & Deploy:**

```bash
# 1. Collect static files
python3 manage.py collectstatic --noinput

# 2. Create .rebyte/
mkdir -p .rebyte/functions/default.func .rebyte/static

# 3. Install deps
pip3 install -r requirements.txt \
  --target .rebyte/functions/default.func/ \
  --platform manylinux2014_x86_64 \
  --only-binary=:all: \
  --python-version 3.12

# 4. Copy Django project
cp -r myproject/ myapp/ manage.py .rebyte/functions/default.func/

# 5. Copy collected static files
if [ -d "staticfiles" ]; then cp -r staticfiles/* .rebyte/static/; fi

# 6. Write handler.py
cat > .rebyte/functions/default.func/handler.py << 'EOF'
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')

from mangum import Mangum
from django.core.asgi import get_asgi_application

application = get_asgi_application()
handler = Mangum(application)
EOF

# 7. Write .vc-config.json and config.json (same as FastAPI)
# 8. Deploy
rebyte deploy
```

## Environment Variables

Create `.rebyte/.env.production`:

```
SECRET_KEY=your-secret-key
DEBUG=false
```

Access in Python via `os.environ["SECRET_KEY"]`.

For addon variables (SQLite, DynamoDB, AI Gateway), see `reference/addons.md`. Addon env vars are auto-injected — declare addons in `config.json`:

```json
{
  "version": 1,
  "addons": ["sqlite"],
  "routes": [...]
}
```

## Limitations

- **250MB package size** — strip bloat:
  ```bash
  find .rebyte/functions/default.func/ -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null
  find .rebyte/functions/default.func/ -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null
  ```
- **30 second timeout**
- **Cold starts** — 500ms–2s depending on package size
- **manylinux wheels** — always use `--platform manylinux2014_x86_64 --only-binary=:all:` for compiled packages

## Troubleshooting

**Always check logs first:**
```bash
rebyte logs                  # All logs (last 5 min)
rebyte logs -m 30             # Last 30 minutes
rebyte logs --level ERROR     # Only errors
```

| Error | Cause | Fix |
|-------|-------|-----|
| `ModuleNotFoundError` | Dep not installed to function dir | Reinstall with `pip install --target` |
| `handler.handler is not callable` | Missing `handler` variable in handler.py | Ensure `handler = Mangum(app)` or `handler = make_lambda_handler(app)` |
| Package too large | Unused files in deps | Remove `__pycache__`, `.dist-info` dirs |
