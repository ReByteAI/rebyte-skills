---
name: skill-manager
description: Manage your team skills — list your skills, view metadata and version history, read version content for comparison, download specific versions, and publish new versions. Use when you need to understand why a skill changed, compare versions, or publish an update.
---

# Skill Manager

Manage your organization skills from inside a task. Every operation is scoped to your user within your organization.

## Related Skills

Skills have a lifecycle: **create → publish → install → manage**. This skill handles **publish** and **manage**. The other steps have their own skills:

- **skill-creator** — Create a new skill from scratch or improve an existing one. Handles requirements, scaffolding, SKILL.md authoring, testing, and packaging into a `.skill` ZIP. Use this first when you need a new skill.
- **skill-installer** — Install skills from the catalog (your team's skills and Rebyte's featured skills). Use this to discover and install available skills into your VM.

The typical flow: use **skill-creator** to build and package → **skill-manager** to publish → **skill-installer** for other team members to install.

{{include:auth.md}}

## Operations

All operations go through the relay data proxy. The VM token provides org and user identity automatically.

### List My Skills

Returns all skills you own (created_by = you), with metadata.

```bash
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")

curl -s -X POST "$API_URL/api/data/skills/my-skills" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.skills[] | {id, slug, name, description, visibility, current_version}'
```

### List Versions

Get the full version history for one of your skills. Use this to understand what changed and when.

```bash
SKILL_ID="<skill-id>"

curl -s -X POST "$API_URL/api/data/skills/list-versions" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$SKILL_ID\"}" | jq '.versions[] | {version, published_at, changelog}'
```

### Get Version Content

Read the SKILL.md content of a specific version. This is the primary tool for understanding what changed between versions.

```bash
SKILL_ID="<skill-id>"
VERSION=3

curl -s -X POST "$API_URL/api/data/skills/get-version" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$SKILL_ID\", \"version\": $VERSION}" | jq -r '.content'
```

**Comparing two versions:**
```bash
# Get both versions and diff
curl -s -X POST "$API_URL/api/data/skills/get-version" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$SKILL_ID\", \"version\": 3}" | jq -r '.content' > /tmp/v3.md

curl -s -X POST "$API_URL/api/data/skills/get-version" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$SKILL_ID\", \"version\": 4}" | jq -r '.content' > /tmp/v4.md

diff /tmp/v3.md /tmp/v4.md
```

### Download a Version

Download the full `.skill` ZIP package for a specific version. Use this when you need to inspect all files (scripts, assets), not just SKILL.md.

```bash
SKILL_ID="<skill-id>"
VERSION=2

DOWNLOAD_URL=$(curl -s -X POST "$API_URL/api/data/skills/download-version" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"id\": \"$SKILL_ID\", \"version\": $VERSION}" | jq -r '.download_url')

curl -fsSL -o /tmp/skill-v${VERSION}.skill "$DOWNLOAD_URL"
mkdir -p /tmp/skill-v${VERSION}
unzip -q -o /tmp/skill-v${VERSION}.skill -d /tmp/skill-v${VERSION}/
```

### Publish

Publish a new version of a skill. If the slug doesn't exist yet, creates it as v1. If it exists, bumps the version automatically.

Never modify a skill in place — always publish a new version.

**Step 1: Package the skill directory**
```bash
cd my-skill && zip -r ../my-skill.skill . -x '*.DS_Store' && cd ..
```

**Step 2: Publish**
```bash
SLUG="my-skill"
SKILL_FILE="./my-skill.skill"
CHANGELOG="Improved error handling in deploy script"

PACKAGE_BASE64=$(base64 -w0 "$SKILL_FILE" 2>/dev/null || base64 "$SKILL_FILE" | tr -d '\n')

PAYLOAD=$(python3 -c "
import json, sys
d = {'slug': sys.argv[1], 'package': sys.argv[2]}
if len(sys.argv) > 3 and sys.argv[3]:
    d['changelog'] = sys.argv[3]
print(json.dumps(d))
" "$SLUG" "$PACKAGE_BASE64" "$CHANGELOG")

curl -s -X POST "$API_URL/api/data/skills/publish" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" | jq '{action, skill: {slug: .skill.slug, name: .skill.name, version: .skill.version}}'
```

## Typical Workflows

**"Why is my skill different from the last version?"**
1. `my-skills` → find the skill ID and current version
2. `list-versions` → see changelog entries
3. `get-version` for current and previous → diff them

**"Roll back to a previous version"**
1. `download-version` for the target version
2. Unzip, verify contents
3. `publish` the old package with changelog "Rolled back to vN"

**"Publish an improved skill"**
1. Edit the skill directory locally
2. Package into `.skill` ZIP
3. `publish` with a changelog describing the change
