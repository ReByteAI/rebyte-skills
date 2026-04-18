---
version: 1
name: team-skill-workflow
description: Create and publish a custom skill for your team. Use when user wants to create a team skill, build a private skill, make a skill for the organization, or publish a skill to the team store. Triggers include "create a team skill", "build a skill for my team", "make a custom skill", "create and publish a skill", "new team skill".
---

# Team Skill Workflow

Create a custom skill and publish it to your team's private skill store in one go. This workflow connects the skill creator with the skill publisher so the user goes from idea to a shared team skill seamlessly.

## Sub-Skills

- `rebyteai/skill-creator` — Create the skill: understand requirements, scaffold the directory, write SKILL.md and resources, package into a `.skill` file
- `rebyteai/skill-manager` — Publish the packaged `.skill` file to the organization's private skill store

## Workflow

### Step 1: Understand the Request

Ask the user what skill they want to create. Identify:
- **Purpose** — What should the skill do? What problem does it solve?
- **Triggers** — What would a user say that should activate this skill?
- **Resources** — Does the skill need scripts, reference docs, or asset files?

If the request is clear, proceed directly. If ambiguous, ask one or two clarifying questions before moving on.

### Step 2: Create the Skill

Use `skill-creator` to build the skill. Follow its full process:

1. Plan the reusable contents (scripts, references, assets)
2. Run `scripts/init_skill.py` to scaffold the skill directory
3. Implement the resources and write SKILL.md
4. Test any scripts by running them
5. Run `scripts/package_skill.py` to produce the `.skill` file

Do NOT skip the packaging step — a `.skill` file is required for publishing.

### Step 3: Publish to Team Store

Use `skill-manager` to publish the packaged skill:

```bash
scripts/publish.sh <slug> <path-to-skill-file>
```

The slug should match the skill directory name (lowercase, hyphenated).

### Step 4: Confirm

After publishing, tell the user:
- The skill name and slug
- That it's now available to all team members in the skill store
- How to use it: team members can find it under "Team Skills" in the skill store, or it will be auto-suggested when relevant

If publishing fails, show the error and help the user fix it before retrying.

## Decision Points

- **"The user wants to update an existing team skill"** — Skip scaffolding. Edit the existing skill directory, re-package, and re-publish with the same slug. The publisher overwrites the previous version.

- **"The user provides a GitHub repo with SKILL.md"** — Skip skill-creator entirely. Package the repo's skill directory directly with `package_skill.py`, then publish. This is the faster path when the skill already exists.

- **"The packaging step fails validation"** — Fix the issues reported by `package_skill.py` (usually missing frontmatter fields or description quality), then re-run packaging.
