# Rebyte Skills

Public repository of skills authored by [ReByte](https://rebyte.ai).

Each top-level directory is a skill: a `SKILL.md` plus any supporting scripts, references, or templates. Skills are packaged as `.skill` ZIPs and distributed to agents running in Rebyte's cloud VMs.

## Skill format

Each skill follows the [Anthropic SKILL.md convention](https://github.com/anthropics/skills):

```markdown
---
name: my-skill
description: One line of what this skill does and when to use it.
---

# My Skill

Instructions for the agent…
```

## Layout

```
rebyte-skills/
├── _common/              # Shared SKILL.md includes (e.g. auth patterns)
├── pdf/
│   └── SKILL.md
├── deep-research/
│   └── SKILL.md
└── …
```

### Shared includes

Any skill may reference a fragment from `_common/` using:

```
{{include:auth.md}}
```

Includes are expanded when the skill is packaged.

## Usage

Inside the Rebyte platform, skills from this repo are referenced as `rebyteai/<slug>`. Outside Rebyte, clone this repository and point your skill loader at any directory that contains a `SKILL.md`.

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
