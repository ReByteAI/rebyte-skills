# Static Sites

Deploy static HTML/CSS/JS sites to S3 + CloudFront CDN. Automatic HTTPS via `*.rebyte.pro`.

## Quick Start (Auto-Detect)

If you have a Vite, Gatsby, CRA, Astro (static), or plain HTML project:

```bash
rebyte build
rebyte deploy
```

The CLI detects your framework and builds automatically.

## Manual Deploy (Plain HTML)

For plain HTML with no build step:

```bash
mkdir -p .rebyte/static
cp -r *.html *.css *.js .rebyte/static/
cp -r assets/ .rebyte/static/ 2>/dev/null || true

cat > .rebyte/config.json << 'EOF'
{
  "version": 1,
  "routes": []
}
EOF

rebyte deploy
```

## SPA Routing

For single-page apps with client-side routing (React Router, Vue Router, etc.), add a fallback route so all paths serve `index.html`:

```json
{
  "version": 1,
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Supported Frameworks

| Framework | Build Command | Output Dir |
|-----------|---------------|------------|
| Vite | `npm run build` | `dist/` |
| Gatsby | `gatsby build` | `public/` |
| Create React App | `react-scripts build` | `build/` |
| Astro (static) | `astro build` | `dist/` |
| Plain HTML | (none) | `.` |

## Cache Behavior

| Pattern | TTL | Notes |
|---------|-----|-------|
| `*.html` | Short | Pages that change frequently |
| `*.js`, `*.css` | Long | Use content hashing (e.g., `main.a1b2c3.js`) |
| Images | Long | Static assets |

## Combining with a Backend

Static sites can serve as the frontend for a Python, Go, or Rust API backend. See `guides/python.md`, `guides/go.md`, or `guides/rust.md` for full instructions — each guide covers the static frontend + backend setup together.
