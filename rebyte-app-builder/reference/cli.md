# CLI Reference

The `rebyte` command is available in PATH on Rebyte Cloud VMs. Just run `rebyte <command>`.

Fallback: `rebyte <command>` if the wrapper is not available.

## build

Build the project and create `.rebyte/` directory.

```bash
rebyte build [options]
```

| Option | Description |
|--------|-------------|
| `-d, --dir <path>` | Project directory (default: `.`) |
| `--framework <name>` | Override auto-detection (ignored when rebyte.json exists) |

**Two modes:**

1. **`rebyte.json` exists** → reads config, runs your build commands, packages output. Works for any language.
2. **No `rebyte.json`** → auto-detects Node.js/static framework and builds automatically.

## deploy

Deploy the `.rebyte/` directory to Rebyte Cloud.

```bash
rebyte deploy [options]
```

| Option | Description |
|--------|-------------|
| `-d, --dir <path>` | Project directory (default: `.`) |
| `-n, --name <name>` | Deployment name for multiple deployments |
| `--skip-validation` | Skip local validation |

## info

Get deployment status and URL.

```bash
rebyte info [options]
```

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Deployment name |

## logs

View Lambda function logs.

```bash
rebyte logs [options]
```

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Deployment name |
| `-m, --minutes <number>` | Time range in minutes (default: 5) |
| `-l, --level <level>` | Filter by log level: INFO, WARN, ERROR, DEBUG |

## delete

Delete a deployment.

```bash
rebyte delete [options]
```

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Deployment name |
| `--confirm` | Confirm deletion (dry-run without this flag) |
| `--with-data` | Also delete all addon data |

```bash
# Preview what will be deleted
rebyte delete

# Actually delete
rebyte delete --confirm

# Delete everything including database data
rebyte delete --confirm --with-data
```

## addon list

List addon status for a deployment.

```bash
rebyte addon list [options]
```

## addon delete

Delete a specific addon's data.

```bash
rebyte addon delete <addon> [options]
```

| Argument | Description |
|----------|-------------|
| `<addon>` | `sqlite`, `dynamodb`, or `ai-gateway` |

| Option | Description |
|--------|-------------|
| `-n, --name <name>` | Deployment name |
| `--confirm` | Confirm deletion (dry-run without this flag) |

## Named Deployments

Use `-n` to manage multiple deployments per workspace:

```bash
rebyte deploy -n staging
rebyte deploy -n production
rebyte info -n staging
```

Each named deployment gets its own URL, Lambda function, and addon instances.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Error (message printed to stderr) |

## Post-Deploy Verification

```bash
rebyte info              # Check status + URL
rebyte logs              # View recent logs
rebyte logs --level ERROR # Check for errors
rebyte addon list        # Check addon status
```

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `req.on is not a function` | Next.js not built correctly | Run `rebyte build` (not `next build` alone) |
| `Cannot find module` | Dependencies not bundled | Run `rebyte build` to rebundle |
| 500/502 right after deploy | CDN propagation delay | Wait 90 seconds |
| 404 errors | Wrong routes | Check `config.json` routes |
