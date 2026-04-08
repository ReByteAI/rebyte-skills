---
name: dynamodb-database
description: Provision DynamoDB NoSQL database for web apps. Use for key-value storage, document storage, high-performance NoSQL. Triggers include "DynamoDB", "NoSQL", "key-value store", "document database".
---

# DynamoDB Database

Provision DynamoDB NoSQL database access for your apps.

{{include:auth.md}}

## When to Use

Use this skill when your app needs:
- Key-value storage
- Document storage
- High-performance NoSQL
- Flexible schema design
- Automatic scaling

**Use SQLite (sqlite-database skill) instead if:**
- You need relational data with joins
- You need complex SQL queries
- You prefer traditional SQL syntax

## Two Usage Modes

### 1. Standalone Mode (No Site Deployment)
Use DynamoDB as a pure key-value store without deploying a website. Perfect for:
- Backend data storage
- Caching
- Session storage
- Any key-value needs

Just call `provision` and use the API operations (get, put, delete, query, scan) directly.

### 2. With Lambda Functions
When you deploy a site with Lambda functions, DynamoDB credentials are automatically injected as environment variables (`DYNAMODB_TABLE`, `DYNAMODB_PREFIX`).

## Provision DynamoDB Access

```bash
curl -X POST "$API_URL/api/data/dynamodb/provision" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:
```json
{
  "tableName": "cctools-app-data",
  "prefix": "deploy#abc123",
  "region": "us-east-1",
  "instructions": "... detailed usage instructions ..."
}
```

**IMPORTANT:** The response includes detailed `instructions` on how to use DynamoDB. Always read and follow those instructions.

## Using DynamoDB in Lambda

The table name and prefix are set as environment variables:
- `DYNAMODB_TABLE` - The shared DynamoDB table name
- `DYNAMODB_PREFIX` - Your deployment's unique prefix

```javascript
// functions/api.js (CommonJS format)

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE = process.env.DYNAMODB_TABLE;
const PREFIX = process.env.DYNAMODB_PREFIX;

// Helper to build prefixed keys
const pk = (type, id) => `${PREFIX}#${type}#${id}`;
const sk = (type, id) => id ? `${type}#${id}` : type;

exports.handler = async function(event) {
  // PUT item
  await docClient.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: pk('user', 'user123'),
      sk: sk('profile'),
      name: 'John',
      email: 'john@example.com',
      createdAt: new Date().toISOString(),
    },
  }));

  // GET item
  const result = await docClient.send(new GetCommand({
    TableName: TABLE,
    Key: {
      pk: pk('user', 'user123'),
      sk: sk('profile'),
    },
  }));

  // QUERY by partition key
  const userItems = await docClient.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': pk('user', 'user123'),
    },
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result.Item),
  };
};
```

## Data Model Patterns

### Single Table Design

DynamoDB works best with a single-table design:

```
pk                              sk              attributes
deploy#abc123#user#123   profile         {name, email, ...}
deploy#abc123#user#123   post#001        {title, content, ...}
deploy#abc123#user#123   post#002        {title, content, ...}
deploy#abc123#order#abc  details         {total, status, ...}
```

### Key Composition

- **pk (partition key)**: Groups related items. Always include PREFIX.
- **sk (sort key)**: Orders items within a partition.

```javascript
// Good: Include prefix in partition key
const pk = `${PREFIX}#user#${userId}`;
const sk = `post#${postId}`;

// Bad: Missing prefix - will conflict with other deployments
const pk = `user#${userId}`;
```

## TTL (Time To Live)

Auto-expire items by setting the `ttl` attribute (Unix timestamp in seconds):

```javascript
{
  pk: pk('session', 'sess123'),
  sk: sk('data'),
  ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expire in 24 hours
  data: { ... }
}
```

## Important Notes

- **No site deployment required** - DynamoDB can be used standalone as a key-value store
- **Always use PREFIX** - Never write items without the prefix
- **No npm install needed** - AWS SDK is built into Lambda (when using Lambda)
- **One table, many deployments** - Your data is isolated by prefix
- **pk is partition key** - Use for primary lookups
- **sk is sort key** - Use for secondary grouping
- **TTL is optional** - Only set it for items that should auto-expire
- **Use CommonJS format** - `exports.handler`, NOT `export default` (when using Lambda)
- **Data cleanup** - DynamoDB data is automatically deleted when the workspace is deleted

## Debugging & Inspection

You can inspect and manage your DynamoDB data directly via the API. All operations enforce prefix isolation - you can only access your own data.

### Get a Single Item

```bash
curl -X POST "$API_URL/api/data/dynamodb/get" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pk": "deploy#abc123#user#123",
    "sk": "profile"
  }'
```

### Put/Update an Item

```bash
curl -X POST "$API_URL/api/data/dynamodb/put" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "item": "{\"pk\":\"deploy#abc123#user#123\",\"sk\":\"profile\",\"name\":\"John\"}"
  }'
```

### Delete an Item

```bash
curl -X POST "$API_URL/api/data/dynamodb/delete" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pk": "deploy#abc123#user#123",
    "sk": "profile"
  }'
```

### Query Items by Partition Key

```bash
curl -X POST "$API_URL/api/data/dynamodb/query" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pk": "deploy#abc123#user#123",
    "limit": 50
  }'
```

### List All Items (Scan)

```bash
curl -X POST "$API_URL/api/data/dynamodb/scan" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100
  }'
```

## API Reference

| Operation | Description |
|-----------|-------------|
| `provision` | Enable DynamoDB, set Lambda env vars |
| `info` | Get connection details without provisioning |
| `get` | Get single item by pk/sk |
| `put` | Create or update an item |
| `delete` | Delete single item by pk/sk |
| `query` | Query items by partition key |
| `scan` | List all items for this deployment |

### Provision DynamoDB

```
POST /api/data/dynamodb/provision
```

Enables DynamoDB for the workspace. Works in two modes:
- **Standalone**: Creates a DynamoDB-only record for key-value storage
- **With Lambda**: Also sets Lambda environment variables (`DYNAMODB_TABLE`, `DYNAMODB_PREFIX`)

### Get DynamoDB Info

```
POST /api/data/dynamodb/info
```

Returns DynamoDB details without provisioning.
