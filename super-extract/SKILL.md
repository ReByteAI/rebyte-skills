---
name: super-extract
description: Extract structured entities from unstructured text with character-level source grounding and interactive visualization. Supports NER, relation extraction, and information extraction with exact position mapping and highlighted widget output. Handles PDFs, DOCX, and plain text.
version: 0.2.0
license: Apache-2.0
---

# Super Extract — Structured Information Extraction with Source Grounding

Extract structured entities from any document (PDF, DOCX, or text) with character-level source grounding and interactive visualization. Inspired by [google/langextract](https://github.com/google/langextract).

## Sub-Skills

This is a workflow skill that composes:
- **pdf** skill — for reading and extracting text from PDF files
- **docx** skill — for reading and extracting text from Word documents

## When to Use

- User wants to extract entities, facts, or structured data from documents (PDF, DOCX, text)
- User needs named entity recognition (NER), relation extraction, or information extraction
- User wants extracted data grounded to exact positions in the source text
- User has a document (file, URL, pasted text) and wants structured output

## How It Works

The extraction pipeline is:

1. **Read the document** — use the pdf or docx skill to extract text from the source file
2. **Understand the task** — what entities/information to extract
3. **Extract** — extract structured JSON from the text
4. **Align** — run `bin/align.py` to ground extractions to exact character positions
5. **Visualize** — generate a widget with highlighted source text

## Step 0: Read the Document

If the source is a **PDF**, use the pdf skill to extract text.

If the source is a **DOCX**, use the docx skill to extract text.

If the source is a **URL to a PDF**, first download it then extract text with the pdf skill.

If the source is **plain text** (pasted or .txt file), skip this step.

## Step 1: Understand the Extraction Task

Ask the user (or infer from context):
- What entity classes to extract (e.g., "person", "medication", "date", "organization")
- What attributes each class should have (e.g., person → {role, age}, medication → {dosage, frequency})
- The source document (PDF, DOCX, text file, pasted text, or URL)

## Step 2: Extract Structured Data

Analyze the source text and extract entities as JSON. Output format:

```json
[
  {
    "extraction_class": "medication",
    "extraction_text": "Aspirin",
    "attributes": {"dosage": "100mg", "frequency": "daily"}
  },
  {
    "extraction_class": "condition",
    "extraction_text": "hypertension",
    "attributes": {"severity": "moderate"}
  }
]
```

Rules:
- `extraction_text` MUST be an exact substring of the source text (verbatim, case-sensitive)
- `extraction_class` is the entity type
- `attributes` is optional key-value metadata about the entity
- Extract entities in order of appearance in the source text

### For Long Documents

If the text exceeds ~4000 characters, chunk it:
1. Split into ~3000 char chunks with ~500 char overlap
2. Extract from each chunk separately
3. Merge results, deduplicating extractions that appear in overlap regions (same class + same text at same position = duplicate)

## Step 3: Align Extractions to Source Text

Save the source text and extractions, then run the aligner:

```bash
# Write input JSON
cat > /tmp/lx_input.json << 'ENDJSON'
{
  "source": "<the full source text>",
  "extractions": [
    {"extraction_class": "...", "extraction_text": "...", "attributes": {...}},
    ...
  ]
}
ENDJSON

# Run alignment (adjust path to where the skill is installed)
python3 bin/align.py --stdin < /tmp/lx_input.json > /tmp/lx_output.json
```

For CJK/non-spaced languages (Japanese, Chinese, Thai), add `--unicode`:

```bash
python3 bin/align.py --stdin --unicode < /tmp/lx_input.json > /tmp/lx_output.json
```

The output adds `char_interval` (start_pos, end_pos) and `alignment_status` to each extraction.

## Step 4: Generate Visualization

After alignment, generate an interactive visualization showing highlighted source text with entity annotations.

Read the aligned output from `/tmp/lx_output.json` and generate the visualization.

### Visualization Approach

Build highlighted HTML by:
1. Sort extractions by `char_interval.start_pos`
2. Walk through source text character by character
3. At each extraction start, insert a highlighted `<span>` with a tooltip
4. At each extraction end, close the `</span>`
5. HTML-escape all plain text between highlights

The visualization should include:
- **Legend** — color-coded entity classes with counts, clickable to filter
- **Highlighted text** — source text with colored spans for each extraction
- **Tooltips** — on hover/click, show extraction class, text, attributes, and char position
- **Navigation** — prev/next buttons to step through entities
- **Stats** — total extractions, aligned count, exact vs fuzzy matches

## Example

**Input:** "Patient takes Aspirin 100mg every morning for hypertension."

**Extract:**
```json
[
  {"extraction_class": "medication", "extraction_text": "Aspirin", "attributes": {"dosage": "100mg", "frequency": "every morning"}},
  {"extraction_class": "condition", "extraction_text": "hypertension"}
]
```

**After alignment**, each extraction gets `char_interval` with exact character positions, e.g.:
- "Aspirin" → char_interval: {start_pos: 14, end_pos: 21}
- "hypertension" → char_interval: {start_pos: 46, end_pos: 58}

**Visualization** shows the source text with "Aspirin" and "hypertension" highlighted in different colors, clickable tooltips showing attributes, and a legend for filtering by class.

## Tips

- For best results, tell the user what entity classes you'll extract before doing it
- If the user provides example extractions, use them as few-shot guidance
- For very long documents (>20k chars), summarize the extraction counts and offer to show the visualization for a specific section
- The aligner works best when `extraction_text` is an exact verbatim substring — avoid paraphrasing
- Use `--unicode` flag for any non-Latin text
