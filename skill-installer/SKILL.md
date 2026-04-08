---
name: skill-installer
description: Search and install open-source skills from community GitHub repositories. Use when users ask to find, discover, or install skills/plugins for specific tasks, domains, or workflows.
---

# Skill Installer

Find and install open-source skills from community GitHub repositories.

## Check Before Installing

```bash
ls ~/.skills/
```

## Search by Keyword

```bash
python3 ~/.skills/skill-installer/scripts/fetch_skills.py --search "keyword"
```

## List All Community Skills

```bash
python3 ~/.skills/skill-installer/scripts/fetch_skills.py --list
```

## Deep Dive into a Skill

```bash
python3 ~/.skills/skill-installer/scripts/fetch_skills.py --deep-dive REPO SKILL
```

## SkillsMP Marketplace Search

Search the SkillsMP marketplace (skillsmp.com) — a curated index of community skills.

```bash
# Keyword search
python3 ~/.skills/skill-installer/scripts/fetch_skills.py --skillsmp "SEO"

# AI semantic search (finds conceptually related skills)
python3 ~/.skills/skill-installer/scripts/fetch_skills.py --ai-search "How to create a web scraper"

# With pagination and sorting
python3 ~/.skills/skill-installer/scripts/fetch_skills.py --skillsmp "react" --page 2 --limit 10 --sort stars
```

## Options

- `--online` — Fetch real-time data from GitHub (default uses cache)
- `--json` — Structured JSON output
- `--rate-limit` — Check GitHub API rate limit
- `--skillsmp QUERY` — Search SkillsMP marketplace by keyword
- `--ai-search QUERY` — AI semantic search via SkillsMP
- `--page N` — Page number for SkillsMP results (default: 1)
- `--limit N` — Results per page for SkillsMP (default: 20, max: 100)
- `--sort stars|recent` — Sort order for SkillsMP (default: recent)

## Data Access

The script auto-detects the best method for GitHub sources:

| Priority | Method | Rate Limit |
|----------|--------|------------|
| 1 | GitHub Connector (gh CLI) | 15000/hr |
| 2 | Offline cache | Unlimited |
| 3 | `GITHUB_TOKEN` env | 5000/hr |

SkillsMP API: 500 requests/day. Override key via `SKILLSMP_API_KEY` env var.

When using cached data, inform the user.

## Sources

- **GitHub**: 7 repositories — anthropics/skills, obra/superpowers, vercel-labs/agent-skills, K-Dense-AI/claude-scientific-skills, ComposioHQ/awesome-claude-skills, travisvn/awesome-claude-skills, BehiSecc/awesome-claude-skills
- **SkillsMP**: skillsmp.com marketplace — keyword and AI semantic search across all indexed skills

## After Finding a Skill

Read the skill's `SKILL.md` after installation to understand how to use it.
