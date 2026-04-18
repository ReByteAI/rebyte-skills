---
version: 1
name: wiki-workflow
description: Build and maintain a personal LLM-native wiki — a structured, interlinked collection of markdown notes that grows over time. Use when the user wants to build a knowledge base, second brain, personal wiki, or notes system; or asks to "ingest" a document/article/URL, "ask my notes a question", "look up what I know about X", or "tidy up my wiki". Inspired by Karpathy's LLM Wiki pattern and disksing/db9-wiki, adapted for the persistent local filesystem in Agent Computer VMs.
---

# Wiki Workflow

Maintain an LLM-native wiki on the local filesystem. The wiki is a structured, interlinked collection of markdown files that the agent grows incrementally as the user feeds it source material and asks questions. Because Agent Computer VMs are persistent, the local filesystem IS the wiki — no external database or sync layer needed.

## Why this workflow exists

Traditional RAG embeds source chunks and retrieves them on each query. That works, but the index is opaque, hard to maintain, and doesn't compound. This workflow takes the opposite approach: the agent reads sources, distills them into focused wiki pages, and links them together. Over time the user owns a real, browsable, editable knowledge base — the agent is the librarian, not the search engine.

The whole wiki lives under `/code/wiki/`. Standard Unix tools (`rg`, `cat`, `ls`) are the search layer. The agent reads files directly. There is no sync command and no external service.

## Directory layout

```
/code/wiki/
├── AGENTS.md          # Wiki-specific conventions (optional, written after first agreement)
├── log.md             # Append-only edit history
├── sources/           # Raw source materials, date-stamped, IMMUTABLE after ingest
│   └── YYYY-MM-DD/
│       └── original-filename.ext
└── pages/             # Wiki pages (markdown, one topic per file)
    ├── topic-a.md
    └── folder/
        └── topic-b.md
```

Two important conventions:

- **`sources/` is immutable.** Once a file lands there, never edit or rename it. It's the provenance trail.
- **`pages/` is the wiki.** Every page is a markdown file with frontmatter. Agents read, write, and link pages here.

## Page format

Every page in `pages/` has YAML frontmatter:

```markdown
---
title: JavaScript Closures
description: How closures work in JavaScript
tags: [javascript, functions, scope]
sources: [2026-04-07/mdn-closures.md]
updated: 2026-04-07
---

# JavaScript Closures

A closure is a function bundled with its lexical environment.

## Related

- [[scope]]
- [[javascript/functions]]
```

Rules:
- `sources` lists paths **relative to `sources/`**, without the `sources/` prefix.
- `updated` is the ISO date of the last edit.
- Cross-references use Obsidian-style wiki links: `[[FileName]]` when the filename is unique inside `pages/`, otherwise `[[folder/file|Display Name]]` with the path relative to `pages/` and **no `.md` extension**.

## The three operations

Every wiki interaction is one of three operations: **ingest**, **query**, or **lint**. Pick the one that matches the user's intent and follow the steps.

---

### INGEST — Process new source material into the wiki

**Trigger:** User provides a file, directory, URL, or pasted text and wants it added to the wiki. Examples: "ingest this PDF", "add this article to my notes", "save this for later".

**Steps:**

1. **Read the source.** If it's a path under `/code/`, read it directly. If it's a URL, fetch it. If it's pasted text, work from the user's message.

2. **Decide if discussion is needed before editing.**
   - If the wiki already has clear conventions and this is a small addition that fits the existing structure → proceed directly.
   - If the ingest would change structure, naming, page boundaries, or the linking strategy in a non-obvious way → summarize the proposed new pages, updates, naming, and links, and confirm with the user first.
   - **If the wiki is empty** (`pages/` does not exist or is empty), do NOT start writing pages immediately. First discuss conventions with the user: directory organization, whether to use subdirectories, primary language, filename style. Write the agreed conventions into `/code/wiki/AGENTS.md` before ingesting any content.

3. **Copy the raw source into `sources/`.**
   - A single file → `sources/YYYY-MM-DD/<original-filename>`
   - A directory → `sources/YYYY-MM-DD/<original-directory>/`
   - Preserve the original filename whenever possible.
   - If a name already exists in that date folder, rename the incoming file with a version suffix (`-v2`, `-1130`, etc.).
   - For URLs, save the rendered/extracted markdown as `sources/YYYY-MM-DD/<slug>.md` and record the original URL inside the file as a top-level comment.

4. **Survey existing pages.** Run `ls -R /code/wiki/pages/` (or read the relevant subtrees) to see what's already there. For larger wikis, `rg -l . /code/wiki/pages/ | head -50` is enough to get the lay of the land.

5. **Plan the changes.** Decide:
   - Which **new pages** to create.
   - Which **existing pages** to update with new information.
   - What **cross-references** to add (both directions — new pages link to old, and old pages get backlinks added).

6. **Write the markdown.** Create or update files in `/code/wiki/pages/` with proper frontmatter. Each page should focus on a single topic. A meaty source might touch 5–15 pages — that's normal and expected.

7. **Append to `log.md`** in this exact format:

   ```markdown
   ## [YYYY-MM-DD] ingest | Source Title
   - created `slug` — short reason
   - updated `slug` — what changed
   ```

8. **Confirm with the user.** Briefly list what was added/updated. Don't dump the full diff — a short summary is enough.

**Guidelines:**
- One topic per page. If you're tempted to write `## Section` for a different topic, make it a separate page and link to it.
- Pages should be concise but complete enough to stand alone.
- Always add cross-references in both directions — new pages link to existing ones AND existing ones get a `[[new-page]]` reference added.
- Use descriptive slugs with directory structure when it helps (`javascript/closures`, not `js-closures-1`).
- The `sources` frontmatter field is the provenance trail. Always set it.

---

### QUERY — Search the wiki and synthesize an answer

**Trigger:** User asks a question that should be answered from their wiki. Examples: "what do I know about closures?", "look up X in my notes", "summarize my notes on Y".

**Steps:**

1. **Search for relevant pages** using ripgrep over `/code/wiki/pages/`:

   ```bash
   rg -l -i "<keyword>" /code/wiki/pages/
   rg -l -i "<synonym-or-related-term>" /code/wiki/pages/
   ```

   Run a few searches with different keywords — the user's wording may not match the page wording exactly. Also check titles and tags by reading frontmatter:

   ```bash
   rg -l -i "<term>" /code/wiki/pages/ --type md
   ```

2. **Read the candidate pages.** Open the top matches and read them in full. Follow `[[wiki-links]]` to related pages when they're relevant.

3. **Synthesize an answer** from the page contents. Cite the pages you used with Obsidian-style links: `According to [[closures]] and [[javascript/scope]], ...`

4. **If the wiki doesn't have enough to answer**, say so clearly. Don't fabricate. Offer to ingest a source that would fill the gap.

5. **Optionally write the synthesis back as a new page.** If the answer required combining information from multiple pages and produced a useful new framing, create a new wiki page capturing it. Update cross-references on the source pages. This is how explorations compound over time.

   When you do this, append to `log.md`:

   ```markdown
   ## [YYYY-MM-DD] query | Question Summary
   - created `slug` — captured query synthesis
   ```

**Guidelines:**
- Always ground answers in wiki content. Never fabricate.
- Use ripgrep liberally — running 3-5 different searches is cheap.
- If the user's question is broad, explore the wiki structure first (`ls /code/wiki/pages/`) before grepping.
- Writing back is optional, not mandatory. Do it when the synthesis is genuinely valuable, not for every Q&A.

---

### LINT — Health-check the wiki

**Trigger:** User asks to "tidy up", "clean up", "check", "audit", or "lint" the wiki.

**Steps:**

1. **Inventory.** List all pages: `ls -R /code/wiki/pages/`. Read frontmatter from each page to build a slug → title/tags/sources map. For larger wikis, scan in chunks.

2. **Check for issues:**

   - **Broken links** — `[[slug]]` references pointing to pages that don't exist in `/code/wiki/pages/`.
   - **Ambiguous short links** — `[[FileName]]` used when multiple pages share that filename (the link should be the full path form).
   - **Orphan pages** — Pages with no incoming links from other pages AND no `sources` entry. They've drifted free of the wiki graph.
   - **Missing frontmatter** — Pages lacking required fields (`title`, `description`, `tags`, `updated`).
   - **Unreferenced sources** — Files in `sources/` that no page lists in its `sources` frontmatter. Either the source was forgotten or the link was broken.
   - **Stale content** — Pages whose `updated` date is older than their referenced source files' modification times.
   - **Duplicate topics** — Multiple pages covering nearly the same subject. Candidates for merging.
   - **Missing cross-references** — Pages on closely related topics that don't link to each other.

3. **Present a report** to the user listing each category of issue with concrete examples and proposed fixes. Don't fix anything yet.

4. **Wait for user confirmation** before applying fixes. The user may want to skip some categories or handle issues differently.

5. **Apply approved fixes:**
   - Add missing cross-references.
   - Update stale page content from sources.
   - Merge duplicates (prefer merging over deleting).
   - Fix or remove broken links.

6. **Append to `log.md`:**

   ```markdown
   ## [YYYY-MM-DD] lint | Health Check
   - updated `slug` — fix description
   - merged `slug-a` into `slug-b` — reason
   ```

**Guidelines:**
- Always present findings before changing anything.
- Prefer merging duplicates over deleting them — merging preserves the link graph.
- Respect the shortest-unique wiki link rule.
- Don't be over-eager about flagging "stale" content. A page can be intentionally evergreen.

---

## Initial setup

If the user invokes this workflow on a workspace where `/code/wiki/` doesn't exist:

1. Create the directory structure: `mkdir -p /code/wiki/pages /code/wiki/sources`.
2. Create an empty `/code/wiki/log.md` with a header line.
3. **Discuss conventions with the user before ingesting anything.** Cover at least:
   - **Language** — English, Chinese, mixed?
   - **Subdirectories** — flat (`pages/topic.md`) or nested by category (`pages/javascript/closures.md`)?
   - **Filename style** — kebab-case, snake_case, camelCase?
   - **Tag taxonomy** — free-form tags or a fixed set?
4. Write the agreed conventions into `/code/wiki/AGENTS.md`. From then on, both you and any future agent reading the wiki will follow them.

## Workspace integration

If the workspace also uses the `second-brain` convention (`/code/raw/`, `/code/INDEX.md`):

- Wiki sources still live in `/code/wiki/sources/`, not `/code/raw/`. The wiki is self-contained.
- However, when the user asks to ingest a file already in `/code/raw/`, copy it from `/code/raw/` into `/code/wiki/sources/YYYY-MM-DD/` per the ingest steps. Do not move or delete the original in `/code/raw/`.
- After major changes, add a one-liner to `/code/INDEX.md` under a `## Wiki` heading: `Wiki: N pages, last updated YYYY-MM-DD`.

## Decision points

- **"Should I ingest or just answer from memory?"** — If the user asked you to ingest something, ingest it. If they asked a question, query the wiki first; only fall back to general knowledge if the wiki has nothing relevant, and say so explicitly.

- **"How granular should pages be?"** — One topic per page. If you can't write a page's title without using "and" or a comma, it's probably two pages.

- **"The source is huge — how many pages is too many?"** — There's no hard limit. A 50-page paper might legitimately become 20 wiki pages. But don't pad — every page should have a reason to exist.

- **"The wiki conflicts with the source."** — Surface it. Ask the user which is correct. Don't silently overwrite the wiki, and don't silently ignore the new source.

- **"Should I update old pages or write a new one?"** — Update existing pages when the new source refines or extends what's already there. Write a new page when the new source introduces a genuinely distinct topic. When in doubt, update + cross-reference.

- **"The wiki is getting messy."** — Run lint. Don't manually clean things up in the middle of an ingest or query — that's lint's job.
