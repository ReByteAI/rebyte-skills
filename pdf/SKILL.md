---
version: 1
name: pdf
description: Use this skill for anything PDF — creating professional PDFs (resumes, one-pagers, white papers, letters, portfolios, equity reports, changelogs, custom documents) with the Kami design system; reading or extracting text/tables; merging, splitting, rotating, watermarking, encrypting; filling PDF forms; extracting embedded images; OCR on scanned PDFs. Trigger on any `.pdf` request or phrases like "make me a PDF", "generate a report", "build me a resume", "one-pager", "white paper", "export to PDF", "professional document".
license: Skill code proprietary. Bundled design system adapted from tw93/kami (MIT) — see KAMI_LICENSE.txt. Bundled fonts (TsangerJinKai02, JetBrainsMono) have their own upstream licenses; see references/create.md for details.
---

# PDF Skill

One skill for every PDF task. Read only the sub-reference that matches what the user wants.

## Task → Reference Router

| The user wants to… | Read |
|---|---|
| Create a PDF — resume, one-pager, long doc, letter, portfolio, equity report, changelog, or anything custom | `references/create.md` |
| Understand the visual design system (tokens, typography, colors, layouts) | `references/design.md` |
| Understand how WeasyPrint builds PDFs + troubleshoot render issues | `references/production.md` |
| Write good copy inside a document (tone, rhythm, bilingual conventions) | `references/writing.md` |
| Embed a diagram (architecture, flowchart, quadrant, timeline, chart…) inside a document | `references/diagrams.md` |
| Memorize the non-negotiable rules at a glance | `references/cheatsheet.md` |
| Read or extract text, tables, metadata, or coordinates from a PDF | `references/extract.md` |
| Merge, split, rotate, crop, watermark, or encrypt existing PDFs | `references/manipulate.md` |
| OCR a scanned PDF or extract embedded images | `references/ocr.md` |
| Fill a PDF form (fillable fields or non-fillable flat forms) | `references/forms.md` |
| Do any of the above in JavaScript (pdf-lib, pdfjs-dist) | `references/javascript.md` |

## Default for Creation

When the user asks for any new PDF document, default to **`references/create.md`**. It walks through:
1. **Template path** — match the user's ask to one of the pre-built templates in `assets/templates/` (resume, one-pager, long-doc, letter, portfolio, equity-report, changelog) and fill it with their data
2. **Custom path** — if no template fits, write a custom HTML in the Kami design system using `references/design.md` tokens and `references/cheatsheet.md` rules, then render via the same pipeline

Both paths render through `scripts/build.py` → WeasyPrint. The visual language is consistent across templated and custom documents.

## Directory Layout

```
pdf/
├── SKILL.md                         # this index
├── KAMI_LICENSE.txt                 # MIT attribution for the Kami design system
├── references/
│   ├── create.md                    # ⭐ entry point for all PDF creation
│   ├── design.md                    # design tokens + layout rules
│   ├── production.md                # WeasyPrint build + troubleshooting
│   ├── writing.md                   # tone + bilingual conventions
│   ├── diagrams.md                  # diagram primitives
│   ├── cheatsheet.md                # one-page rules summary
│   ├── tokens.json                  # machine-readable design tokens
│   ├── stabilizer_profiles.json     # per-document-type QA profiles
│   ├── extract.md                   # read PDFs
│   ├── manipulate.md                # merge/split/rotate/watermark/encrypt
│   ├── ocr.md                       # scanned PDFs + image extraction
│   ├── forms.md                     # fill PDF forms
│   └── javascript.md                # pdf-lib + pdfjs-dist
├── assets/
│   ├── styles.css                   # shared stylesheet for all templates + custom docs
│   ├── templates/                   # pre-built document HTMLs (CN + EN variants)
│   ├── fonts/                       # TsangerJinKai02 (CN), JetBrainsMono (code)
│   ├── diagrams/                    # 14 standalone diagram HTMLs
│   └── images/logo.svg
└── scripts/
    ├── build.py                     # orchestrator: template + data → PDF
    ├── stabilize.py                 # page-count + visual QA
    └── (form scripts: check_fillable_fields, extract_form_field_info, fill_*, etc.)
```

## Core Dependencies

```bash
# Creating PDFs (required)
pip install weasyprint pypdf --break-system-packages
# Linux first-time:
apt install -y libpango-1.0-0 libpangoft2-1.0-0 fonts-noto-cjk

# Reading/manipulating PDFs
pip install pdfplumber pypdfium2 --break-system-packages

# OCR
pip install pytesseract pdf2image --break-system-packages
# Also: apt-get install tesseract-ocr poppler-utils
```

## Routing Tips

- User says "generate report / export PDF / resume / white paper / one-pager / proposal / make me a PDF / professional report" → `create.md`
- User says "extract / read / pull out text / read table" → `extract.md`
- User says "merge / split / rotate / watermark / combine" → `manipulate.md`
- User says "scan / OCR / make searchable" → `ocr.md`
- User says "fill form / form field" → `forms.md`

When unsure, skim this file's router; don't load all references at once.
