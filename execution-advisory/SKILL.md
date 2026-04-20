---
version: 1
name: execution-advisory
description: Pair a fast/cheap executor (Haiku, Sonnet, Flash, opencode) with occasional consultations to a high-intelligence advisor (Claude Opus, Gemini 3.1 Pro) when you hit a hard decision point. The advisor runs as a real sub-agent via /api/sub-agent/invoke and returns a plan you continue with. Install when you want near-frontier intelligence at executor-level cost — especially for long-horizon tasks where most turns are mechanical but a few require strong reasoning. Trigger phrases include "advisor", "consult opus", "second opinion from a smarter model", "save tokens with advisor pattern", "stuck on a hard decision".
---

# Execution Advisory

You are the **executor** — a fast, cheap model handling the bulk of this task. This skill gives you a menu of **advisors**: stronger, more expensive models you can consult at specific decision points via the sub-agent API. The advisor runs as its own task, sees the problem you hand it, thinks hard, and returns a plan. You then continue with that plan at your executor cost.

This is the same pattern Anthropic describes for pairing Sonnet/Haiku with Opus. The difference: advisors here are real sub-agents with their own tools, not just text-only consultants. They can read files, run commands, and search — whatever their executor supports.

## Authentication

**IMPORTANT:** All API requests require authentication. Get your auth token and API URL by running:

```bash
AUTH_TOKEN=$(/home/user/.local/bin/rebyte-auth)
API_URL=$(python3 -c "import json; print(json.load(open('/home/user/.rebyte.ai/auth.json'))['sandbox']['relay_url'])")
```

Include the token in all API requests as a Bearer token, and use `$API_URL` as the base for all API endpoints.

## The core trade

Most turns in a long task are mechanical: reading files, running greps, making small edits. That work is cheap on a small model. A few turns genuinely need stronger reasoning: picking an approach, debugging a subtle bug, reviewing a final result. Consulting an advisor on *those specific turns* gives you near-frontier quality for a fraction of the cost of running the whole task on the strong model.

The math only works if you call the advisor rarely and deliberately. Calling one on every turn defeats the purpose.

## When to consult

- **Early**, after you've oriented (found the relevant files, read them, understood the shape of the problem) — but **before** you commit to an approach. Orientation is cheap; committing to the wrong approach is expensive.
- **Final check** before declaring done — but only *after* you've made your deliverable durable (file written, change committed, result saved). The advisor call takes time; if the session ends during it, a durable result persists.
- **When stuck** — errors recurring, approach not converging, results that don't fit the hypothesis.
- **When considering a change of approach** — the cost of a wrong pivot is high; an advisor can confirm or redirect cheaply.

For tasks longer than a few steps, consulting an advisor at least once before committing to an approach and once before declaring done is the highest-leverage pattern.

## When NOT to consult

- Simple mechanical tasks where the next action is dictated by what you just read. You don't need an advisor to tell you "grep for X" after you've already decided to grep for X.
- When a cheap local check would answer the question — read a file, run a command, search the code. Don't pay for an advisor what a grep can tell you.
- On every turn. The advice is most valuable early (before crystallization) and late (before declaring done). The turns in between are usually yours to execute.
- For single-turn Q&A with no plan to make — nothing to advise on.

## Available advisors

These are hard-coded. Pick the one whose strengths match your question; when in doubt, start with `opus`.

| Preset | `executor` | `model` | Strengths |
|---|---|---|---|
| **opus** | `claude` | `claude-opus-4.6` | Strong all-rounder. Best for code architecture, nuanced trade-off analysis, careful review, and any task where "taste" matters. Must be specified explicitly — the claude executor defaults to Sonnet. |
| **gemini** | `gemini` | *(omit — default)* | Best for long-context analysis (very large files, whole-repo summaries) and multimodal questions (diagrams, screenshots). The Gemini CLI has one model slot (`auto-gemini-3`) which auto-routes between Flash and Pro based on query complexity, so no explicit model is needed — and none can be passed. |

Each advisor is a full sub-agent — it can read files, run tools, and explore. It shares `/code` with you, so it sees the same files you see. You do not need to paste code into the prompt; tell the advisor what to look at and it will read it.

## How to call an advisor

The sub-agent endpoint is documented in your base system prompt under "Calling Other Agents". This skill just gives you the presets to plug into it.

Shell helper (paste once at the top of your workflow, then reuse). Source the task-context env file first so `$REBYTE_TASK_ID` and `$REBYTE_PROMPT_ID` are available:

```bash
source /home/user/.rebyte.ai/context.env

advise() {
  # Usage: advise <preset> "<question>"
  # preset: opus | gemini
  local preset="$1"; local question="$2"
  local body
  case "$preset" in
    opus)
      body=$(jq -nc --arg p "$question" --arg t "$REBYTE_TASK_ID" --arg pr "$REBYTE_PROMPT_ID" \
        '{prompt:$p, executor:"claude", model:"claude-opus-4.6", parent_task_id:$t, parent_prompt_id:$pr}')
      ;;
    gemini)
      body=$(jq -nc --arg p "$question" --arg t "$REBYTE_TASK_ID" --arg pr "$REBYTE_PROMPT_ID" \
        '{prompt:$p, executor:"gemini", parent_task_id:$t, parent_prompt_id:$pr}')
      ;;
    *) echo "unknown advisor: $preset (try: opus | gemini)" >&2; return 2 ;;
  esac
  curl -sS -X POST "$API_URL/api/sub-agent/invoke" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$body"
}
```

Call it with the preset and your question. The question should be concrete: describe what you've already found, what you're about to do, and what you want the advisor to confirm or correct.

```bash
advise opus "I'm about to refactor /code/src/auth/middleware.ts to move the JWT verification
into a shared utility. I've read the file; it's ~200 lines and has 3 call sites in routes/.
My plan: (1) extract verifyJwt into src/utils/jwt.ts, (2) update the 3 call sites, (3) drop the
original. Before I start: is there a gotcha I'm missing — e.g. a second verification path I haven't
noticed, or a reason this can't be shared safely? Be specific; read the file if useful."
```

The response is a JSON object with `task_id` and `events_url`. The advisor's final answer is in its task event stream. You can either:
- Wait and poll: use the events_url or query the task's prompt_requests for `status = 'succeeded'` and read the final result.
- Or (in async style) fire the call early, keep working, and check back later.

## How to weigh the response

Give the advice serious weight. The advisor saw your full context and had time to think. But:

- If you follow a step and it **empirically fails** (test breaks, script errors), adapt. A passing self-test is not evidence the advice is wrong — it's evidence your test doesn't check what the advice is checking.
- If you already have **primary-source evidence** that contradicts a specific claim (the file literally says X, the spec literally says Y), trust the evidence and surface the conflict in *one more* advisor call: "I found X, you suggested Y — which constraint breaks the tie?" A reconcile call is far cheaper than committing to the wrong branch.
- **Don't silently switch** between the advisor's plan and your own intuition. Either follow it, or reconcile it.

## Example flow

Task: "Fix the flaky test in `tests/integration/billing.test.ts`."

Executor (you, on the cheap model):
1. Read the test, run it a few times, note it fails ~30% of the time at `expect(invoice.total).toBe(100)`.
2. Grep for the invoice generation path, read the relevant service files — ~5 minutes, all mechanical.
3. At this point you have two hypotheses: a race between two DB writes, or a timezone rollover. You're not sure which, and picking wrong means another 30 min of wasted debugging.
4. **Consult opus**: "Flaky test in billing.test.ts, fails ~30% at `invoice.total == 100`. I suspect either (a) a race between the invoice-line and invoice-total writes in src/billing/aggregate.ts, or (b) a timezone rollover in the test's clock setup. Read both files and tell me which is more likely and how to verify."
5. Advisor replies: "It's (a). Line 87 of aggregate.ts does two INSERTs without a transaction; if the total read runs between them you see a partial sum. Verify by adding `BEGIN; ... COMMIT` and retrying 20 times."
6. You apply the fix, verify it, commit, call `advise opus "Quick check: did I miss anything?"` and ship.

Two advisor calls for an otherwise mechanical debug session. Much cheaper than running the whole thing on Opus, nearly as good.

## Cost note

Advisors are priced at their own rates — Opus and Gemini-Pro tokens cost meaningfully more than executor tokens. One to three advisor calls per long task is the sweet spot. Ten calls defeats the point; zero calls wastes the capability. Calibrate based on how hard the task is.
