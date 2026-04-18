---
version: 1
name: context-lake
description: Access and manage structured data. Query your organization's connected databases, files, and services. Import your own CSV/Parquet/JSON files as queryable SQL tables. Build views that join across sources. All data is queryable via standard SQL.
---

# Agent Context — Data for Agents

Agent Context is a managed data layer inside your Agent Computer. It gives you:

- **Organization data** — databases, S3 files, and services your team has connected
- **Your own tables** — import files as queryable datasets scoped to your workspace
- **SQL queries** — standard SQL (Apache DataFusion) across all sources
- **Views** — materialized joins across datasets, auto-refreshed on source changes

## Setup

```bash
curl -fsSL https://cc-tools-binaries.s3.amazonaws.com/rebyte-data/rebyte-data-linux-amd64 -o /usr/local/bin/rebyte-data && chmod +x /usr/local/bin/rebyte-data
```

Auth is automatic — credentials are pre-configured in this VM.

## Quick Start

```bash
# See what data is available
rebyte-data tables

# Query a table
rebyte-data query 'SELECT * FROM "customers" LIMIT 10'

# Import your own file
rebyte-data import ./results.csv --name results

# Query your imported data
rebyte-data query 'SELECT category, COUNT(*) FROM results GROUP BY category'
```

## Commands

| Command | Description |
|---------|-------------|
| `rebyte-data tables` | List all datasets you can access |
| `rebyte-data schema <table>` | Show column names and types |
| `rebyte-data query "SQL"` | Execute a SQL query, print results as table |
| `rebyte-data import <file> [--name <table>]` | Upload a file and create a queryable dataset |
| `rebyte-data drop <table>` | Delete a dataset you created |

## Importing Data

Import CSV, Parquet, JSON, JSONL, or TSV files. Schema is auto-inferred.

```bash
# Import with explicit name
rebyte-data import ./sales_2024.csv --name sales

# Name is auto-derived from filename if omitted
rebyte-data import ./quarterly_report.parquet
# → creates table "quarterly_report"
```

After import, the data is immediately queryable via SQL. Your imported tables are scoped to your workspace — other agents can't see them.

**Supported formats:** `.csv`, `.tsv`, `.parquet`, `.json`, `.jsonl`

## SQL Reference

Standard SQL via [Apache DataFusion](https://datafusion.apache.org/user-guide/sql/index.html).

**Always double-quote table names** — identifiers are case-sensitive:

```sql
-- ✅ Correct
SELECT * FROM "my_dataset" LIMIT 5
SELECT c.name FROM "customers" c JOIN "orders" o ON c.id = o.customer_id

-- ❌ Wrong
SELECT * FROM my_dataset LIMIT 5
```

Common patterns:

```sql
-- Filter and aggregate
SELECT region, SUM(revenue) FROM "sales" GROUP BY region ORDER BY SUM(revenue) DESC

-- Join across sources (org data + your imported data)
SELECT o.id, o.total, r.category
FROM "orders" o
JOIN results r ON o.product_id = r.id

-- Text search
SELECT * FROM "products" WHERE name ILIKE '%widget%'

-- Date filtering
SELECT * FROM "events" WHERE created_at > '2024-01-01'
```

## Semantic Search

Datasets with embedded columns support vector similarity search:

```sql
-- Find similar documents
SELECT title, cosine_similarity(embedding, embed('quarterly revenue trends')) AS score
FROM "documents"
ORDER BY score DESC LIMIT 5

-- Combine structured filters with semantic search
SELECT * FROM "support_tickets"
WHERE status = 'open'
ORDER BY cosine_similarity(embedding, embed('billing issue')) DESC
LIMIT 10
```

## Architecture

- **Organization data** (admin-managed) — connected databases, S3 buckets, views. Read-only. Always fresh or cached with scheduled refresh.
- **Agent data** (your imports) — files you upload, stored in cloud storage, queryable via SQL. Scoped to your workspace.
- **Views** — materialized SQL queries cached in DuckDB. Auto-refresh when source data changes via S3 notifications.

All data is queryable through a single SQL interface. No need to know where the data lives.
