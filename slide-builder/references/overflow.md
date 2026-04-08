# Overflow Detection

Slidev does not auto-fit content like PowerPoint. Text, tables, and code that exceed the slide boundary will be clipped.

**ALWAYS check for overflow before deploying.**

## Install Checker (first time only)

```bash
npm install -g slidev-overflow-checker
npx playwright install
```

## Run Overflow Check

```bash
# Start dev server in background
pnpm run dev --port 3030 &

# Wait for server to start
sleep 10

# Run overflow checker
slidev-overflow-checker --url http://localhost:3030 --project ./
```

## Fix Overflow Issues

| Issue Type | Fix Strategy |
|------------|--------------|
| Too many bullet points (>5) | Split into multiple slides |
| Long table (>5 rows) | Wrap with `<Transform :scale="0.8">` |
| Long code block (>12 lines) | Split or wrap with `<Transform :scale="0.85">` |
| Wide table/content | Wrap with `<Transform :scale="0.75">` |
| Dense text | Reduce content or use smaller layout |

## Transform Wrapper Example

```markdown
<Transform :scale="0.8">

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Row 1 | Data | Data |
| Row 2 | Data | Data |
| ... more rows ... |

</Transform>
```

## Re-check After Fixing

After fixing, re-run the checker to verify:

```bash
slidev-overflow-checker --url http://localhost:3030 --project ./
```

Only proceed to deploy when **no overflow issues** are reported.
