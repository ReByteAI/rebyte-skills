---
version: 1
name: research-workflow
description: Conduct comprehensive research and produce a professional research report as PDF. Use when user wants in-depth research on any topic — market analysis, technology comparisons, industry trends, academic topics, competitive intelligence, or any question requiring multi-source synthesis. Triggers include "research", "investigate", "analyze", "write a report on", "deep dive into", "comprehensive analysis of", "what do we know about".
---

# Research Workflow

Conduct thorough research on any topic and deliver a professional PDF research report with citations. This workflow connects search and research skills to go from a user's question to a polished, shareable document.

## Sub-Skills

- `rebyteai/internet-search` — Quick web search for facts, recent news, and specific data points
- `rebyteai/deep-research` — Comprehensive multi-source research with citations (10+ sources, trend analysis, conflicting viewpoints)
- `anthropics/pdf` — Generate the final research report as a professional PDF document

## Workflow

### Step 1: Understand the Research Question

Parse what the user wants to know. Identify:
- **Core question** — What is the central topic or question to answer?
- **Scope** — How broad or narrow? A quick overview or exhaustive analysis?
- **Audience** — Technical experts, executives, general public?
- **Deliverable** — What should the final report contain? (analysis, recommendations, data, comparisons)

If the request is ambiguous, ask clarifying questions. If it's clear, proceed directly.

### Step 2: Initial Discovery

Use `internet-search` to get oriented:
- Run 2-3 searches to understand the landscape
- Identify key players, terms, and recent developments
- Find authoritative sources to dive deeper into

This step is quick — just enough to know what you're dealing with.

### Step 3: Deep Research

Use `deep-research` for comprehensive analysis:
- Gather information from 10+ sources
- Cross-reference facts across sources
- Identify consensus views and conflicting opinions
- Collect data, statistics, and expert quotes
- Track all sources for citations

Let `deep-research` handle the heavy lifting. It will return structured findings with citations.

### Step 4: Synthesize and Structure

Before writing the report, organize findings:

1. **Key findings** — What are the 3-5 most important takeaways?
2. **Supporting evidence** — What data and sources back each finding?
3. **Conflicting views** — Where do sources disagree? Why?
4. **Gaps** — What couldn't be determined? What needs more research?
5. **Outline** — Structure the report logically:
   - Executive Summary
   - Background/Context
   - Key Findings (with subheadings)
   - Analysis/Discussion
   - Conclusions/Recommendations
   - Sources/References

### Step 5: Generate PDF Report

Use `anthropics/pdf` to create the final document:

1. **Title page** — Clear title, date, topic summary
2. **Executive summary** — 1 paragraph with key takeaways (for busy readers)
3. **Body sections** — Each major finding as a section with evidence
4. **Citations** — Inline references and a full bibliography
5. **Professional formatting** — Headers, bullet points, tables where appropriate

The PDF should be self-contained — a reader should understand the topic without external context.

### Step 6: Present Results

After generating the PDF:

1. Share the PDF link with the user
2. Provide a brief verbal summary:
   - Main conclusions
   - Most surprising finding
   - Any caveats or limitations
3. Ask if the user wants:
   - Additional depth on any section
   - Different angle or focus
   - Follow-up research on related topics

## Decision Points

- **"Should I use internet-search or deep-research?"** — Use `internet-search` for quick fact-finding and orientation. Use `deep-research` when you need comprehensive analysis from multiple sources. For most research requests, you'll use both: internet-search first to orient, then deep-research for depth.

- **"How many sources is enough?"** — For a credible research report, aim for 10+ sources minimum. More complex topics may need 20+. Quality matters more than quantity — prefer authoritative sources.

- **"The sources conflict"** — This is valuable information. Report the disagreement, explain why sources might differ (methodology, timing, bias), and present the most credible interpretation.

- **"I can't find enough information"** — Be honest. Report what you found, clearly state what's missing, and explain why (topic too new, proprietary information, etc.). A report that acknowledges gaps is more valuable than one that pretends to be complete.

- **"The topic is too broad"** — Ask the user to narrow it, or propose a focused angle yourself. "AI in healthcare" is too broad; "AI diagnostic tools for radiology in 2024-2025" is researchable.
