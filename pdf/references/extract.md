# Extracting from PDFs

Reading text, tables, metadata, and coordinates from existing PDFs. Pick the tool that matches what you need.

## Tool Selection

| Task | Best tool |
|---|---|
| Plain text, whole document | `pdftotext` CLI (fastest) |
| Text with layout preserved | `pdftotext -layout` |
| Text with precise coordinates | `pdfplumber.page.chars` |
| Tables | `pdfplumber.extract_tables()` |
| Metadata (title/author/creator) | `pypdf.PdfReader.metadata` |
| Render pages to images | `pypdfium2` |
| Text with bounding boxes (XML) | `pdftotext -bbox-layout` |

If the PDF is a scan (image-based), text extraction returns nothing useful — jump to `ocr.md` instead.

## pypdf — Basic Reads

```python
from pypdf import PdfReader

reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text
text = "".join(page.extract_text() for page in reader.pages)
```

### Metadata

```python
meta = reader.metadata
print(meta.title, meta.author, meta.subject, meta.creator)
```

### Encrypted PDFs

```python
if reader.is_encrypted:
    reader.decrypt("password")
```

## pdfplumber — Text and Tables

### Extract Text with Layout

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        print(page.extract_text())
```

### Extract Tables

```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        for j, table in enumerate(page.extract_tables()):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

### Tables → DataFrame → Excel

```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        for table in page.extract_tables():
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

if all_tables:
    pd.concat(all_tables, ignore_index=True).to_excel("extracted.xlsx", index=False)
```

### Tables with Custom Detection

For tables with unusual line spacing or implicit grids:

```python
with pdfplumber.open("complex_table.pdf") as pdf:
    page = pdf.pages[0]
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 3,
        "intersection_tolerance": 15,
    }
    tables = page.extract_tables(table_settings)

    # Visual debug — save the rendered page with detected table overlays
    img = page.to_image(resolution=150)
    img.save("debug_layout.png")
```

### Text with Precise Coordinates

```python
with pdfplumber.open("document.pdf") as pdf:
    page = pdf.pages[0]
    for char in page.chars[:10]:
        print(f"'{char['text']}' at x:{char['x0']:.1f} y:{char['y0']:.1f}")

    # Text within a bounding box (left, top, right, bottom)
    region = page.within_bbox((100, 100, 400, 200)).extract_text()
```

## pypdfium2 — Fast Rendering and Text

Use when you need page images (for preview, OCR fallback, or visual QA):

```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    bitmap = page.render(scale=2.0, rotation=0)
    bitmap.to_pil().save(f"page_{i+1}.png", "PNG")
```

Text extraction is also available:

```python
pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    print(f"Page {i+1}: {len(page.get_text())} chars")
```

## Command-Line Tools

### pdftotext (poppler-utils)

```bash
pdftotext input.pdf output.txt               # plain text
pdftotext -layout input.pdf output.txt       # preserve layout
pdftotext -f 1 -l 5 input.pdf output.txt     # pages 1–5
pdftotext -bbox-layout input.pdf output.xml  # text + bounding boxes (XML)
```

## Performance Tips

- `pdftotext` is the fastest for plain-text extraction on large documents
- Use `pdfplumber` only when you need tables or coordinates
- Avoid `pypdf.extract_text()` on very large documents — it's slower than either alternative
- For batch jobs, stream page-by-page instead of loading the whole PDF into memory:

```python
from pypdf import PdfReader

reader = PdfReader("huge.pdf")
for i, page in enumerate(reader.pages):
    text = page.extract_text()
    # process and discard immediately
```

## Troubleshooting

### Text comes back empty or garbled
The PDF is likely a scan (image-based) or uses a non-embedded font. Convert to images and OCR — see `ocr.md`.

### Text has weird `(cid:N)` patterns
The PDF uses a subset font without a proper Unicode map. Options:
- Try `pypdfium2` — sometimes extracts cleaner text than pypdf
- Fall back to OCR (`ocr.md`)

### Tables come out misaligned
Try `pdfplumber` with `"vertical_strategy": "text"` and `"horizontal_strategy": "text"` for tables drawn without explicit lines.

## Library Licenses

- `pypdf`: BSD — `pdfplumber`: MIT — `pypdfium2`: Apache/BSD — `poppler-utils`: GPL-2
