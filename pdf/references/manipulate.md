# Manipulating PDFs

Merging, splitting, rotating, cropping, watermarking, encrypting, and repairing existing PDFs.

## Tool Selection

| Task | Preferred tool |
|---|---|
| Merge a handful of PDFs in Python | `pypdf` |
| Merge many PDFs or specific page ranges from CLI | `qpdf` |
| Split into individual pages | `pypdf` or `qpdf --split-pages` |
| Rotate pages | `pypdf` or `qpdf --rotate` |
| Crop page boundaries | `pypdf` (set mediabox) |
| Stamp watermark PDF onto another | `pypdf.merge_page()` |
| Text watermark on a new PDF | See `create.md` → `--watermark` |
| Encrypt/decrypt | `pypdf` or `qpdf --encrypt` |
| Repair corrupted PDF | `qpdf --check` / `--fix-qdf` |
| Optimize for web | `qpdf --linearize` |

## pypdf — Python API

### Merge PDFs

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as f:
    writer.write(f)
```

### Split PDF (one page per file)

```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as f:
        writer.write(f)
```

### Rotate Pages

```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # clockwise, multiples of 90
writer.add_page(page)

with open("rotated.pdf", "wb") as f:
    writer.write(f)
```

### Crop Pages

Coordinates are in PDF points (1 pt = 1/72 inch), origin at bottom-left:

```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.mediabox.left   = 50
page.mediabox.bottom = 50
page.mediabox.right  = 550
page.mediabox.top    = 750

writer.add_page(page)
with open("cropped.pdf", "wb") as f:
    writer.write(f)
```

### Stamp Watermark PDF onto Each Page

To stamp a pre-made watermark PDF (e.g. a logo or "DRAFT" overlay) onto every page of a document:

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as f:
    writer.write(f)
```

For text watermarks on freshly generated PDFs, pass `--watermark` to `scripts/md2pdf.py` instead (see `create.md`).

### Password Protection

```python
reader = PdfReader("input.pdf")
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")
with open("encrypted.pdf", "wb") as f:
    writer.write(f)
```

### Batch Processing with Error Handling

```python
import glob, logging
from pypdf import PdfReader, PdfWriter

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

def merge_all(input_dir, output="merged.pdf"):
    writer = PdfWriter()
    for pdf in glob.glob(f"{input_dir}/*.pdf"):
        try:
            for page in PdfReader(pdf).pages:
                writer.add_page(page)
            log.info(f"Added {pdf}")
        except Exception as e:
            log.error(f"Skipped {pdf}: {e}")
    with open(output, "wb") as f:
        writer.write(f)
```

## qpdf — CLI Power Tool

Prefer qpdf for large files, precise page-range math, and any repair/optimization work.

### Merge / Extract / Rearrange

```bash
# Merge two PDFs
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# Pages 1–5 only
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf

# Complex range: pages 1, 3–5, 8, 10 to end
qpdf input.pdf --pages input.pdf 1,3-5,8,10-end -- extracted.pdf

# Merge specific page ranges from multiple PDFs
qpdf --empty --pages doc1.pdf 1-3 doc2.pdf 5-7 doc3.pdf 2,4 -- combined.pdf

# Split a PDF into chunks of N pages
qpdf --split-pages=3 input.pdf group_%02d.pdf
```

### Rotate

```bash
qpdf input.pdf output.pdf --rotate=+90:1       # page 1 by +90
qpdf input.pdf output.pdf --rotate=+180:2-5    # pages 2–5 by 180
```

### Encryption

```bash
# Encrypt with permission restrictions
qpdf --encrypt user_pass owner_pass 256 --print=none --modify=none -- input.pdf encrypted.pdf

# Inspect encryption
qpdf --show-encryption encrypted.pdf

# Decrypt (requires password)
qpdf --password=secret --decrypt encrypted.pdf decrypted.pdf
```

### Optimize and Repair

```bash
# Linearize for web/streaming
qpdf --linearize input.pdf optimized.pdf

# Full optimization pass
qpdf --optimize-level=all input.pdf compressed.pdf

# Sanity check structure
qpdf --check input.pdf

# Attempt repair
qpdf --fix-qdf damaged.pdf repaired.pdf

# In-place repair (overwrites original after validation)
qpdf --replace-input corrupted.pdf

# Dump structure for debugging
qpdf --show-all-pages input.pdf > structure.txt
```

## pdftk — Legacy Alternative

Still useful if it's installed; qpdf is generally more actively maintained.

```bash
# Merge
pdftk file1.pdf file2.pdf cat output merged.pdf

# Split into individual pages
pdftk input.pdf burst

# Rotate page 1 east (90° clockwise)
pdftk input.pdf rotate 1east output rotated.pdf
```

## Memory-Efficient Chunking

For PDFs too big to fit in memory:

```python
from pypdf import PdfReader, PdfWriter

def chunk_pdf(path, chunk_size=10):
    reader = PdfReader(path)
    for start in range(0, len(reader.pages), chunk_size):
        writer = PdfWriter()
        for i in range(start, min(start + chunk_size, len(reader.pages))):
            writer.add_page(reader.pages[i])
        with open(f"chunk_{start // chunk_size}.pdf", "wb") as f:
            writer.write(f)
```

## Library Licenses

- `pypdf`: BSD — `qpdf`: Apache — `pdftk`: GPL
