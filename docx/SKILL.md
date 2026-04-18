---
version: 1
name: docx
description: Process, create, convert, and analyze documents — PDFs, Word docs, spreadsheets, and more. Use when user wants to extract data from PDFs, create Word documents, merge or split PDFs, convert between formats, analyze spreadsheet data, or process uploaded files. Triggers include "extract from PDF", "create Word document", "merge PDFs", "convert document", "analyze spreadsheet", "OCR this scan", "extract tables", "create template", "process invoice".
---

# Document Processing Workflow

Process, create, convert, and analyze documents by combining PDF tools, Word document generation, spreadsheet processing, and web research.

## Sub-Skills

- `anthropics/pdf` — Full PDF toolkit: text extraction, table extraction, creation, merging, splitting, OCR for scanned docs, watermarking, page rotation, form filling, password protection. Uses pypdf, pdfplumber, reportlab.
- `anthropics/docx` — Word document creation and editing: formatting, tracked changes, comments, two-column layouts, text extraction, conversion to images. Uses docx-js and OOXML.
- `anthropics/xlsx` — Excel spreadsheet creation and analysis: formulas, formatting, data visualization, financial models, pivot-style analysis. Uses openpyxl and pandas.
- `rebyteai/internet-search` — Research for content generation, template references, or data to populate documents.

## Workflow

### Step 1: Identify the Operation

Parse what the user wants. Document tasks fall into these categories:

| Operation | Description | Primary Skill |
|-----------|-------------|---------------|
| **Extract** | Pull text, tables, data, images from a document | `pdf`, `xlsx` |
| **Create** | Build a new document from scratch | `docx`, `pdf`, `xlsx` |
| **Transform** | Convert between formats, merge, split, restructure | `pdf`, `docx`, `xlsx` |
| **Analyze** | Summarize, calculate stats, generate insights | `xlsx` |
| **Edit** | Modify an existing document (watermark, fill form, reformat) | `pdf`, `docx`, `xlsx` |

Identify:
- **Input** — Is there an uploaded file? What format? (PDF, DOCX, XLSX, CSV, scanned image)
- **Operation** — Extract, create, transform, analyze, or edit?
- **Output format** — PDF, Word doc, Excel, online spreadsheet, JSON, plain text?

### Step 2: Process Input (if file uploaded)

When the user uploads a file:

**PDF files:**
- Use `pdf` for text extraction, table extraction, form data, or image extraction
- For scanned PDFs, use OCR capabilities (pdftotext, Tesseract)
- For tables, pdfplumber gives structured row/column data

**Spreadsheet files (XLSX, CSV):**
- Use `xlsx` (openpyxl + pandas) for analysis, formula work, and formatting
- pandas for statistical analysis (describe(), groupby(), pivot tables)
- Preserve existing formulas when editing

**Word files (DOCX):**
- Use `docx` for reading content, extracting text, modifying tracked changes
- Pandoc for text extraction when formatting doesn't matter

If no file is uploaded and the task is "create from scratch," skip to Step 3.

### Step 3: Execute the Operation

**Creating documents:**

*Word documents:*
Use `docx` with html2pptx-style workflow:
1. Build content structure (headings, paragraphs, tables, lists)
2. Apply professional formatting (styles, fonts, colors)
3. Add structural elements (TOC, headers/footers, page numbers)

*PDF documents:*
Use `pdf` with reportlab for creation:
1. Define page layout and styles
2. Add content with proper typography
3. Include images, tables, charts as needed

*Spreadsheets:*
- Use `xlsx` for Excel files with formulas, formatting, and data visualization

*Templates:*
For reusable templates (mail merge, invoices, forms):
1. Create the document structure
2. Add placeholder fields or form fields
3. Include instructions for use

**Transforming documents:**

*Merge PDFs:* Use `pdf` to combine multiple files in order, add page numbers and bookmarks
*Split PDFs:* Detect chapter/section boundaries, create separate files
*Convert formats:* PDF → text (pdftotext), DOCX → text (pandoc), CSV → XLSX (pandas + openpyxl)
*Restructure:* Split sheets, combine data, reorganize sections

**Analyzing documents:**

1. Extract the data (text, tables, numbers)
2. Process with appropriate tools (pandas for stats, formulas for calculations)
3. Generate insights (summaries, outliers, trends)
4. Present results (new document, spreadsheet, or inline summary)

### Step 4: Research (if needed)

Use `internet-search` when creating documents that need external content:
- Industry benchmarks for comparison documents
- Template best practices (e.g., invoice standards, contract clauses)
- Data to populate templates (current rates, regulations, standards)

Skip this step for pure file processing (merge, split, extract, OCR).

### Step 5: Deliver

Based on what was created:

**Downloadable files (PDF, DOCX, XLSX):**
- Upload to Artifact Store
- Note the format and any special instructions (e.g., "enable macros for formulas")

**Extracted data:**
- For structured data: output as spreadsheet or JSON
- For text: output as formatted markdown or plain text
- For tables: output as spreadsheet with proper column headers

**Reports/analysis:**
- Combine findings into a clear summary
- Include both the raw data and the analysis

## Decision Points

- **"Which PDF tool?"** — `anthropics/pdf` covers all PDF operations. It's the only PDF skill needed.

- **"Scanned PDF?"** — If the PDF has no extractable text (scanned/photographed), use OCR. The `pdf` skill includes pdftotext and Tesseract for this.

- **"Should I use `internet-search`?"** — Only when creating documents that need external content. Not needed for processing uploaded files.

- **"Multiple output formats?"** — If the user doesn't specify, choose the most natural format: tables → spreadsheet, reports → Word/PDF, data → CSV/JSON. Ask if ambiguous.
