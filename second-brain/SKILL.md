---
version: 1
name: second-brain
description: Workspace structure convention for Agent Computer. Establishes raw/ (user materials, read-only), content directories (AI-maintained), and output/ (deliverables). Use as a sub-skill in workflow skills that need structured file organization. Inspired by Karpathy's LLM Knowledge Base model.
---

# Second Brain — Workspace Structure

This skill defines the file organization convention for `/code/`.
It does NOT generate content — it tells you WHERE to put things and HOW to organize work.

**Origin:** Karpathy's [LLM Knowledge Base](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) model — `raw/` (immutable source) → AI compiler → structured content → output. Adapted for Agent Computer's production workflows (slides, reports, apps) rather than pure knowledge management.

**Core insight:** The Agent Computer filesystem IS the user's "second brain." This skill is the contract that makes it work.

## Directory Convention

```
/code/
  raw/                    # User's source materials (IMMUTABLE)
  slides/                 # Slide decks (managed by slide skill)
    {slug}/
      index.html
      assets/
  output/                 # Final deliverables
  INDEX.md                # Workspace index (agent-maintained)
```

Content-specific directories are defined by each content skill:
- Slides: `/code/slides/{slug}/index.html` (defined by slide skill)
- Future: `/code/reports/`, `/code/docs/`, etc.

## Write Permissions

| Directory | Agent Permission | Notes |
|-----------|-----------------|-------|
| `/code/raw/` | **READ-ONLY** | Never modify, never delete, never reorganize |
| `/code/slides/` | READ + WRITE | Agent creates and maintains slide decks |
| `/code/output/` | WRITE | Agent saves final deliverables here |
| `/code/INDEX.md` | WRITE | Agent maintains workspace index |
| Other `/code/` dirs | Normal | User's project code, follow normal conventions |

## INDEX.md

Agent MUST maintain `/code/INDEX.md`. This is the agent's "memory" of what exists in the workspace — it prevents re-scanning directories and helps the agent resume context across edits.

Format:

```markdown
# Workspace Index

## Slide Decks
- [AI Agent Intro](slides/ai-agent-intro/index.html) — 10 pages, updated 2026-04-06
- [Q4 Review](slides/q4-review/index.html) — 8 pages, updated 2026-04-05

## Raw Materials
- raw/research-paper.pdf — source for AI Agent Intro
- raw/quarterly-data.csv — source for Q4 Review
```

Update INDEX.md after every create/update/delete operation.

## Rules

1. **raw/ is sacred.** When user uploads files or provides raw materials → store in `/code/raw/`. Never modify, never delete, never reorganize files in raw/. Treat as immutable source of truth.
2. **Content goes in skill-designated directories.** When creating structured content (slides, reports, etc.) → use the content skill's designated directory, not raw/ and not a random location.
3. **Deliverables go to output/.** When producing final output (published URL, exported file) → reference in `/code/output/` or deploy.
4. **Don't move existing files.** If user's raw materials are already somewhere in `/code/`, don't move them. Just read from where they are.
5. **INDEX.md is mandatory.** Update after every structural change.

## INGEST Pattern

When user provides new source material:

1. Save to `/code/raw/` (if not already there)
2. Read and understand the material
3. Discuss key takeaways with the user if appropriate
4. Update relevant content (slides, reports, etc.) if they reference this material
5. Update `INDEX.md` — record what was added and what changed

A single ingest may touch multiple content files. That's expected and correct.

## QUERY Pattern

When user asks questions about their materials:

1. Read `INDEX.md` to locate relevant files quickly
2. Read relevant files from `/code/raw/` and content directories
3. Synthesize answer from user's own materials (not generic knowledge)
4. Cite which files informed the answer

## Why This Architecture

| Karpathy's model | Agent Computer adaptation |
|-----------------|--------------------------|
| `raw/` — immutable sources | `/code/raw/` — same principle |
| `wiki/` — AI-compiled knowledge | Skill-specific dirs (`/code/slides/`, `/code/reports/`) — more flexible than one wiki/ |
| `output/` — query results | `/code/output/` — final deliverables |
| `CLAUDE.md` — rules file | This skill — the workspace contract |
| INGEST / QUERY / LINT | Same patterns, adapted for production workflows |

**Why no wiki/ directory?** Karpathy's wiki/ makes sense for knowledge accumulation. But Agent Computer workflows are production-oriented (make a PPT, build a report). Each content type has its own skill and directory structure. Forcing everything through wiki/ would over-constrain the system.

**Why raw/ matters most?** Raw/ enables:
- **Traceability** — debug agent behavior by checking what sources it used
- **Reproducibility** — regenerate any content from the same raw materials
- **Iteration** — user adds new raw material → agent updates existing content
