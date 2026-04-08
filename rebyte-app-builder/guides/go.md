# Go

Deploy Go web apps (Gin, Echo, Chi) to Rebyte Cloud. Go compiles to a single binary that runs on AWS Lambda.

## Two Patterns

### Pattern A: Static Frontend + Go API

The frontend is a separate JavaScript build (React, Vue, etc.) served from CDN. Go only handles `/api/*` routes.

### Pattern B: Server-Rendered HTML

Go generates all HTML directly (Go `html/template`, or returning HTML strings). No separate frontend build — everything goes through Lambda.

Both patterns deploy the same way. The difference is whether you have static files and how you set up routes.

## Supported Frameworks

All use the official AWS adapter library: `github.com/awslabs/aws-lambda-go-api-proxy`.

| Framework | Adapter Package |
|-----------|----------------|
| **Gin** | `github.com/awslabs/aws-lambda-go-api-proxy/gin` |
| **Echo** | `github.com/awslabs/aws-lambda-go-api-proxy/echo` |
| **Chi** | `github.com/awslabs/aws-lambda-go-api-proxy/chi` |
| **Fiber** | `github.com/awslabs/aws-lambda-go-api-proxy/fiber` |
| **net/http** | `github.com/awslabs/aws-lambda-go-api-proxy/httpadapter` |
| **Raw Lambda** | `github.com/aws/aws-lambda-go/lambda` (no adapter) |

## Option 1: Using `rebyte.json` (Recommended)

### Go API + React Frontend

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

Then build and deploy:

```bash
rebyte build
rebyte deploy
```

### Go Server-Rendered (No Frontend)

```json
{
  "functions": {
    "default": {
      "runtime": "provided.al2023",
      "handler": "bootstrap",
      "build": "GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap",
      "output": "bootstrap"
    }
  }
}
```

For the full `rebyte.json` schema, see `reference/rebyte-json.md`.

## Option 2: Manual `.rebyte/` Setup

### Gin Example

**main.go:**

```go
package main

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	ginadapter "github.com/awslabs/aws-lambda-go-api-proxy/gin"
	"github.com/gin-gonic/gin"
)

var ginLambda *ginadapter.GinLambdaV2

func init() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	r.GET("/api/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Hello from Go on Rebyte Cloud!"})
	})

	r.GET("/api/items/:id", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"item_id": c.Param("id")})
	})

	ginLambda = ginadapter.NewV2(r)
}

func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return ginLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(handler)
}
```

**go.mod:**

```
module my-app

go 1.21

require (
	github.com/aws/aws-lambda-go v1.47.0
	github.com/awslabs/aws-lambda-go-api-proxy v0.16.0
	github.com/gin-gonic/gin v1.9.1
)
```

### Echo Example

**main.go:**

```go
package main

import (
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
	echoadapter "github.com/awslabs/aws-lambda-go-api-proxy/echo"
	"github.com/labstack/echo/v4"
)

var echoLambda *echoadapter.EchoLambdaV2

func init() {
	e := echo.New()

	e.GET("/api/hello", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{"message": "Hello from Echo!"})
	})

	echoLambda = echoadapter.NewV2(e)
}

func main() {
	lambda.Start(echoLambda.ProxyWithContext)
}
```

### Chi Example

```go
package main

import (
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/go-chi/chi/v5"
)

var chiLambda *chiadapter.ChiLambdaV2

func init() {
	r := chi.NewRouter()

	r.Get("/api/hello", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Hello from Chi!"})
	})

	chiLambda = chiadapter.NewV2(r)
}

func main() {
	lambda.Start(chiLambda.ProxyWithContext)
}
```

### Build & Deploy (Manual)

```bash
# 1. Install dependencies
go mod tidy

# 2. Compile for Lambda (Linux x86_64)
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o bootstrap main.go

# 3. Create .rebyte/ directory
mkdir -p .rebyte/functions/default.func .rebyte/static

# 4. Copy binary
cp bootstrap .rebyte/functions/default.func/bootstrap

# 5. Copy static frontend (if any)
if [ -d "frontend/dist" ]; then cp -r frontend/dist/* .rebyte/static/; fi

# 6. Write function config
cat > .rebyte/functions/default.func/.vc-config.json << 'EOF'
{
  "runtime": "provided.al2023",
  "handler": "bootstrap",
  "memory": 512,
  "maxDuration": 30
}
EOF

# 7. Write routes config
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

# 8. Deploy
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

Access in Go: `os.Getenv("DATABASE_URL")`.

For addon variables (SQLite, DynamoDB, AI Gateway), see `reference/addons.md`.

## Limitations

- **250MB package size** — rarely an issue for Go (binaries are 10–30MB)
- **30 second timeout**
- **Cold starts** — ~100–200ms (fast)
- **CGO_ENABLED=0** — must disable CGO. Pure Go dependencies only.
- **Cross-compile** — must use `GOOS=linux GOARCH=amd64`

## Troubleshooting

**Always check logs first:**
```bash
rebyte logs                  # All logs (last 5 min)
rebyte logs -m 30             # Last 30 minutes
rebyte logs --level ERROR     # Only errors
```

| Error | Cause | Fix |
|-------|-------|-----|
| `exec format error` | Wrong platform | Use `GOOS=linux GOARCH=amd64 go build` |
| `permission denied` | Binary not executable | `chmod +x .rebyte/functions/default.func/bootstrap` |
| `handler not found` | Binary not named `bootstrap` | Rename to `bootstrap` |
