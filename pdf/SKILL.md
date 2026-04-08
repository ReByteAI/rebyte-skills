---
name: pdf
description: Use this skill whenever the user wants to do anything with PDF files. This includes creating professional PDF documents (reports, articles, white papers) with themed styling and CJK support, reading or extracting text/tables from PDFs, combining or merging multiple PDFs into one, splitting PDFs apart, rotating pages, adding watermarks, filling PDF forms, encrypting/decrypting PDFs, extracting images, and OCR on scanned PDFs to make them searchable. If the user mentions a .pdf file, asks to produce one, wants a "professionally formatted" document, or says "转PDF" or "生成报告", use this skill.
license: Proprietary. LICENSE.txt has complete terms
---

# PDF Processing Guide

## Overview

This guide covers essential PDF processing operations using Python libraries and command-line tools. For advanced features, JavaScript libraries, and detailed examples, see REFERENCE.md. If you need to fill out a PDF form, read FORMS.md and follow its instructions.

## Quick Start

```python
from pypdf import PdfReader, PdfWriter

# Read a PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Creating Professional PDFs

Use the built-in `md2pdf.py` script to create publication-quality PDF documents with
cover pages, table of contents, themed styling, and full CJK/Latin support. Write
content as Markdown, then render it into a professionally typeset PDF.

### When to Use

- User wants to create a PDF report, article, white paper, or document
- User wants professional typesetting with cover page, TOC, headers/footers
- Document contains CJK characters (Chinese/Japanese/Korean) mixed with Latin text
- User wants a specific design theme or branded document

### Workflow

1. Understand what document the user wants to create
2. Write the content as a Markdown file
3. Ask the user about design options (see below)
4. Run the converter to generate the PDF

```bash
pip install reportlab --break-system-packages

python pdf/scripts/md2pdf.py \
  --input report.md \
  --output report.pdf \
  --title "My Report" \
  --author "Author Name" \
  --theme warm-academic
```

All parameters except `--input` are optional — sensible defaults are applied.

### Pre-Conversion Options (MANDATORY)

**IMPORTANT: You MUST use the `AskUserQuestion` tool to ask these questions BEFORE
running the conversion. Ask all options in a SINGLE `AskUserQuestion` call.**

```
开始生成 PDF！先帮你确认几个选项 👇

━━━ 📐 设计风格 ━━━
 a) 暖学术    — 陶土色调，温润典雅，适合人文/社科报告
 b) 经典论文  — 棕色调，灵感源自 LaTeX classicthesis，适合学术论文
 c) Tufte     — 极简留白，深红点缀，适合数据叙事/技术写作
 d) 期刊蓝    — 藏蓝严谨，灵感源自 IEEE，适合正式发表风格
 e) 精装书    — 咖啡色调，书卷气，适合长篇专著/技术书
 f) 中国红    — 朱红配暖纸，适合中文正式报告/白皮书
 g) 水墨      — 纯灰黑，素雅克制，适合文学/设计类内容
 h) GitHub    — 蓝白极简，程序员熟悉的风格
 i) Nord 冰霜 — 蓝灰北欧风，清爽现代
 j) 海洋      — 青绿色调，清新自然

━━━ 🖼 扉页图片（封面之后的全页插图） ━━━
 1) 跳过
 2) 我提供本地图片路径
 3) AI 根据内容自动生成一张

━━━ 💧 水印 ━━━
 1) 不加
 2) 自定义文字（如 "DRAFT"、"内部资料"）

━━━ 📇 封底物料（名片/二维码/品牌） ━━━
 1) 跳过
 2) 我提供图片
 3) 纯文字信息

示例回复："a, 扉页跳过, 水印:仅供学习参考, 封底图片:/path/qr.png"
直接说人话就行，不用记编号 😄
```

### Theme Name Mapping

| Choice | `--theme` value | Inspiration |
|--------|----------------|-------------|
| a) 暖学术 | `warm-academic` | Lovstudio design system |
| b) 经典论文 | `classic-thesis` | LaTeX classicthesis |
| c) Tufte | `tufte` | Edward Tufte's books |
| d) 期刊蓝 | `ieee-journal` | IEEE journal format |
| e) 精装书 | `elegant-book` | LaTeX ElegantBook |
| f) 中国红 | `chinese-red` | Chinese formal documents |
| g) 水墨 | `ink-wash` | 水墨画 / ink wash painting |
| h) GitHub | `github-light` | GitHub Markdown style |
| i) Nord | `nord-frost` | Nord color scheme |
| j) 海洋 | `ocean-breeze` | — |

### CLI Argument Mapping

| User Choice | CLI arg |
|-------------|---------|
| Design style a-j | `--theme <value>` |
| Frontispiece local | `--frontispiece <path>` |
| Frontispiece AI | Generate image first, then `--frontispiece /tmp/frontispiece.png` |
| Watermark text | `--watermark "文字"` |
| Back cover image | `--banner <path>` |
| Back cover text | `--disclaimer "声明"` and/or `--copyright "© 信息"` |

### Full Configuration Reference

| Argument | Default | Description |
|----------|---------|-------------|
| `--input` | (required) | Path to markdown file |
| `--output` | `output.pdf` | Output PDF path |
| `--title` | From first H1 | Document title for cover page |
| `--subtitle` | `""` | Subtitle text |
| `--author` | `""` | Author name |
| `--date` | Today | Date string |
| `--version` | `""` | Version string for cover |
| `--watermark` | `""` | Watermark text (empty = none) |
| `--theme` | `warm-academic` | Color theme name |
| `--theme-file` | `""` | Custom theme JSON file path |
| `--cover` | `true` | Generate cover page |
| `--toc` | `true` | Generate table of contents |
| `--page-size` | `A4` | Page size (A4 or Letter) |
| `--frontispiece` | `""` | Full-page image after cover |
| `--banner` | `""` | Back cover banner image |
| `--header-title` | `""` | Report title in page header |
| `--footer-left` | author | Brand/author in footer |
| `--stats-line` | `""` | Stats on cover |
| `--stats-line2` | `""` | Second stats line |
| `--edition-line` | `""` | Edition line at cover bottom |
| `--disclaimer` | `""` | Back cover disclaimer |
| `--copyright` | `""` | Back cover copyright |
| `--code-max-lines` | `30` | Max lines per code block |

### CJK Rendering Notes

- Always uses `_font_wrap()` for CJK/Latin mixed text — prevents □ rendering
- `wordWrap='CJK'` enables breaks at CJK character boundaries (no "Claude\nCode" splits)
- Canvas text (cover, headers, footers) uses `_draw_mixed()` for CJK characters
- Fonts: Palatino + Songti SC (macOS), Times + SimSun (Windows), Liberation + Noto CJK (Linux)

## Python Libraries

### pypdf - Basic Operations

#### Merge PDFs
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### Split PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### Extract Metadata
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### Rotate Pages
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # Rotate 90 degrees clockwise
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber - Text and Table Extraction

#### Extract Text with Layout
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### Extract Tables
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### Advanced Table Extraction
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:  # Check if table is not empty
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

# Combine all tables
if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab - Create PDFs

#### Basic PDF Creation
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

# Add text
c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")

# Add a line
c.line(100, height - 140, 400, height - 140)

# Save
c.save()
```

#### Create PDF with Multiple Pages
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

# Add content
title = Paragraph("Report Title", styles['Title'])
story.append(title)
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

# Page 2
story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

# Build PDF
doc.build(story)
```

#### Subscripts and Superscripts

**IMPORTANT**: Never use Unicode subscript/superscript characters (₀₁₂₃₄₅₆₇₈₉, ⁰¹²³⁴⁵⁶⁷⁸⁹) in ReportLab PDFs. The built-in fonts do not include these glyphs, causing them to render as solid black boxes.

Instead, use ReportLab's XML markup tags in Paragraph objects:
```python
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet

styles = getSampleStyleSheet()

# Subscripts: use <sub> tag
chemical = Paragraph("H<sub>2</sub>O", styles['Normal'])

# Superscripts: use <super> tag
squared = Paragraph("x<super>2</super> + y<super>2</super>", styles['Normal'])
```

For canvas-drawn text (not Paragraph objects), manually adjust font the size and position rather than using Unicode subscripts/superscripts.

## Command-Line Tools

### pdftotext (poppler-utils)
```bash
# Extract text
pdftotext input.pdf output.txt

# Extract text preserving layout
pdftotext -layout input.pdf output.txt

# Extract specific pages
pdftotext -f 1 -l 5 input.pdf output.txt  # Pages 1-5
```

### qpdf
```bash
# Merge PDFs
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Split pages
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf
qpdf input.pdf --pages . 6-10 -- pages6-10.pdf

# Rotate pages
qpdf input.pdf output.pdf --rotate=+90:1  # Rotate page 1 by 90 degrees

# Remove password
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf
```

### pdftk (if available)
```bash
# Merge
pdftk file1.pdf file2.pdf cat output merged.pdf

# Split
pdftk input.pdf burst

# Rotate
pdftk input.pdf rotate 1east output rotated.pdf
```

## Common Tasks

### Extract Text from Scanned PDFs
```python
# Requires: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

# Convert PDF to images
images = convert_from_path('scanned.pdf')

# OCR each page
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### Add Watermark
```python
from pypdf import PdfReader, PdfWriter

# Create watermark (or load existing)
watermark = PdfReader("watermark.pdf").pages[0]

# Apply to all pages
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### Extract Images
```bash
# Using pdfimages (poppler-utils)
pdfimages -j input.pdf output_prefix

# This extracts all images as output_prefix-000.jpg, output_prefix-001.jpg, etc.
```

### Password Protection
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

# Add password
writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## Quick Reference

| Task | Best Tool | Command/Code |
|------|-----------|--------------|
| Merge PDFs | pypdf | `writer.add_page(page)` |
| Split PDFs | pypdf | One page per file |
| Extract text | pdfplumber | `page.extract_text()` |
| Extract tables | pdfplumber | `page.extract_tables()` |
| Create PDFs | reportlab | Canvas or Platypus |
| Command line merge | qpdf | `qpdf --empty --pages ...` |
| OCR scanned PDFs | pytesseract | Convert to image first |
| Fill PDF forms | pdf-lib or pypdf (see FORMS.md) | See FORMS.md |

## Next Steps

- For advanced pypdfium2 usage, see REFERENCE.md
- For JavaScript libraries (pdf-lib), see REFERENCE.md
- If you need to fill out a PDF form, follow the instructions in FORMS.md
- For troubleshooting guides, see REFERENCE.md
