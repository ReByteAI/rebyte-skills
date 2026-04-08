# Addons

Optional services provisioned alongside your deployment. Declare in `config.json` and environment variables are auto-injected into Lambda.

## Available Addons

| Addon | Description | Env Vars |
|-------|-------------|----------|
| `sqlite` | Turso SQLite database | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| `dynamodb` | AWS DynamoDB key-value store | `REBYTE_DYNAMODB_TABLE`, `REBYTE_DYNAMODB_PREFIX` |
| `ai-gateway` | LLM API access (OpenAI-compatible) | `REBYTE_AI_GATEWAY_URL`, `REBYTE_AI_GATEWAY_KEY` |

## Enabling Addons

Add to `config.json` (inside `.rebyte/`):

```json
{
  "version": 1,
  "addons": ["sqlite", "ai-gateway"],
  "routes": [...]
}
```

Or in `rebyte.json` (project root):

```json
{
  "addons": ["sqlite", "ai-gateway"],
  ...
}
```

## Lifecycle

- **Provisioned** on first deploy with the addon declared
- **Data persists** across deploys — code is replaced, data is not
- **Removing** an addon from config stops env var injection but does NOT delete data
- **Delete data** explicitly: `rebyte addon delete sqlite --confirm`

## Scoping

Each deployment has its own addon instances. Named deployments (`-n staging`, `-n production`) have separate databases, prefixes, and keys.

---

## SQLite (Turso)

Serverless SQLite database. Standard Turso env vars auto-injected at runtime.

### Lambda Compatibility (Node.js)

**CRITICAL**: Import from `@libsql/client/http`, NOT `@libsql/client`.

```javascript
// WRONG — loads native binary, crashes on Lambda
import { createClient } from '@libsql/client';

// CORRECT — pure HTTP, works on Lambda
import { createClient } from '@libsql/client/http';
```

Native modules (`better-sqlite3`, `sqlite3`) also don't work on Lambda.

### Setup (Node.js)

```bash
npm install @libsql/client
```

```javascript
import { createClient } from '@libsql/client/http';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
```

### Queries

```javascript
// Create table
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert
await db.execute({
  sql: 'INSERT INTO users (email, name) VALUES (?, ?)',
  args: ['user@example.com', 'John'],
});

// Select
const result = await db.execute('SELECT * FROM users');

// Batch
const results = await db.batch([
  'SELECT * FROM users',
  'SELECT * FROM posts',
]);
```

### Migrations

**The database is created when you deploy. It does not exist during build.** Never run migration scripts at build time.

Run migrations inside the Lambda handler on first request:

```javascript
let initialized = false;

async function ensureTables() {
  if (initialized) return;
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, name TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
  ]);
  initialized = true;
}

export async function handler(event) {
  await ensureTables(); // runs once per cold start
  // ... handle request
}
```

### Drizzle ORM

```typescript
import { createClient } from '@libsql/client/http';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);
```

`drizzle-kit generate` is safe at build time (generates SQL files only). `drizzle-kit migrate` requires a DB connection — run at Lambda cold start:

```typescript
import { migrate } from 'drizzle-orm/libsql/migrator';
import { db } from './index';

let migrated = false;

export async function runMigrations() {
  if (migrated) return;
  await migrate(db, { migrationsFolder: './drizzle' });
  migrated = true;
}
```

### Setup (Python)

Use any HTTP-based SQLite client. Access env vars via `os.environ["TURSO_DATABASE_URL"]`.

### Limitations

- No direct SQL console (use API queries)
- ~10–50ms HTTP latency per query
- 16MB max row size

---

## DynamoDB

AWS DynamoDB key-value/document store with automatic scaling.

### Architecture

All deployments share one DynamoDB table with prefix-based isolation. **Always prefix your keys** with `REBYTE_DYNAMODB_PREFIX`.

```
Table: rebyte-app-data
┌─────────────────────────────────┬─────────────────┐
│ pk (partition key)              │ sk (sort key)    │
├─────────────────────────────────┼─────────────────┤
│ dep_abc123_user#1               │ profile          │
│ dep_abc123_user#1               │ settings         │
│ dep_xyz789_user#1               │ profile          │  ← different deployment
└─────────────────────────────────┴─────────────────┘
```

### Setup (Node.js)

```bash
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

```javascript
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.REBYTE_DYNAMODB_TABLE;
const PREFIX = process.env.REBYTE_DYNAMODB_PREFIX;
```

### Operations

```javascript
// Put
await docClient.send(new PutCommand({
  TableName: TABLE,
  Item: {
    pk: `${PREFIX}user#${userId}`,
    sk: 'profile',
    name: 'John',
    email: 'john@example.com',
  },
}));

// Get
const result = await docClient.send(new GetCommand({
  TableName: TABLE,
  Key: { pk: `${PREFIX}user#${userId}`, sk: 'profile' },
}));

// Query
const items = await docClient.send(new QueryCommand({
  TableName: TABLE,
  KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
  ExpressionAttributeValues: {
    ':pk': `${PREFIX}user#${userId}`,
    ':skPrefix': 'order#',
  },
}));

// Delete
await docClient.send(new DeleteCommand({
  TableName: TABLE,
  Key: { pk: `${PREFIX}user#${userId}`, sk: 'profile' },
}));
```

### Key Design

Use composite keys for different entity types:

```javascript
{ pk: `${PREFIX}user#123`, sk: 'profile', ... }
{ pk: `${PREFIX}user#123`, sk: 'order#001', ... }
{ pk: `${PREFIX}product#abc`, sk: 'info', ... }
```

Use TTL for temporary data (sessions, caches):

```javascript
{ pk: `${PREFIX}session#${id}`, sk: 'data', expiresAt: Math.floor(Date.now() / 1000) + 3600 }
```

### Limitations

- 400KB max item size
- 25 items per batch write
- Queries limited to single partition key
- ~5–10ms latency per operation

---

## AI Gateway

Access LLMs (GPT-4, Claude, Gemini) through a unified OpenAI-compatible API. Billing included in Rebyte usage.

### Usage (Node.js)

**With OpenAI SDK:**

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REBYTE_AI_GATEWAY_KEY,
  baseURL: process.env.REBYTE_AI_GATEWAY_URL + '/v1',
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Write a haiku about coding.' },
  ],
});
```

**With fetch:**

```javascript
const response = await fetch(`${process.env.REBYTE_AI_GATEWAY_URL}/v1/chat/completions`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.REBYTE_AI_GATEWAY_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }],
  }),
});
```

**Streaming:**

```javascript
const stream = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Tell me a story.' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### Available Models

| Model | Provider | Best For |
|-------|----------|----------|
| `gpt-4` | OpenAI | Complex reasoning |
| `gpt-4-turbo` | OpenAI | Faster GPT-4 |
| `gpt-3.5-turbo` | OpenAI | Quick responses |
| `claude-3-opus` | Anthropic | Deep analysis |
| `claude-3-sonnet` | Anthropic | Balanced |
| `claude-3-haiku` | Anthropic | Fast, cheap |

### Usage (Python/Go/Rust)

The API is OpenAI-compatible. Use any OpenAI client library for your language, or make HTTP requests to `REBYTE_AI_GATEWAY_URL` with `REBYTE_AI_GATEWAY_KEY` as the bearer token.

---

## Managing Addons

```bash
# Check addon status
rebyte addon list

# Preview deletion
rebyte addon delete sqlite

# Actually delete (permanent)
rebyte addon delete sqlite --confirm
```
