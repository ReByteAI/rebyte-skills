# OCR and Image Extraction

For scanned PDFs (no extractable text) and for pulling embedded raster images out of a PDF.

## When to Use This

- `pdftotext` or `pypdf.extract_text()` returns nothing / gibberish / `(cid:N)` patterns
- The user describes the PDF as a "scan" or "image-based" or says "make it searchable"
- The user wants the images embedded in the PDF (figures, charts, photos) as separate files

## Dependencies

```bash
pip install pytesseract pdf2image --break-system-packages
# System packages
apt-get install tesseract-ocr poppler-utils          # Linux
brew install tesseract poppler                        # macOS

# For non-English OCR, install the matching language pack:
apt-get install tesseract-ocr-chi-sim tesseract-ocr-chi-tra tesseract-ocr-jpn
```

Check what languages are installed:

```bash
tesseract --list-langs
```

## OCR a Scanned PDF

```python
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path("scanned.pdf", dpi=300)
text = ""
for i, image in enumerate(images):
    text += f"\n--- Page {i+1} ---\n"
    text += pytesseract.image_to_string(image)

print(text)
```

### Specify Language

```python
# Simplified Chinese + English (common for mainland docs)
text = pytesseract.image_to_string(image, lang="chi_sim+eng")

# Japanese
text = pytesseract.image_to_string(image, lang="jpn")
```

### Higher-Accuracy OCR

Raise DPI and clean up the image before OCR:

```python
from pdf2image import convert_from_path
from PIL import Image, ImageFilter
import pytesseract

images = convert_from_path("scan.pdf", dpi=400)  # 300 is default; 400 for small fonts
for image in images:
    # Convert to grayscale, sharpen
    processed = image.convert("L").filter(ImageFilter.SHARPEN)
    text = pytesseract.image_to_string(processed, lang="chi_sim+eng")
    print(text)
```

### Produce a Searchable PDF

To make the scanned PDF itself searchable (overlay invisible text on the images), use tesseract's PDF output:

```bash
# Convert scan to images first
pdftoppm -png -r 300 scan.pdf page

# OCR each page to a searchable single-page PDF
for img in page-*.png; do
  tesseract "$img" "${img%.png}" -l chi_sim+eng pdf
done

# Merge the per-page searchable PDFs
qpdf --empty --pages page-*.pdf -- searchable.pdf
```

## Extracting Embedded Images

For images already embedded in the PDF (figures, logos, photos), use `pdfimages` — no rendering needed, you get the original bytes.

```bash
# Extract all images in their original format
pdfimages -all document.pdf images/img

# Export as JPEGs (when originals are JPEG-compressed)
pdfimages -j document.pdf output_prefix

# List images without extracting (shows format, dimensions, compression)
pdfimages -list document.pdf

# Extract with page numbers in filenames
pdfimages -j -p document.pdf page_images
```

## Rendering Pages to Images

Different from embedded extraction — this rasterizes the *whole page* (text + images flattened):

```bash
# High-res PNGs
pdftoppm -png -r 300 document.pdf output_prefix

# Specific page range, higher res
pdftoppm -png -r 600 -f 1 -l 3 document.pdf high_res

# JPEG with quality setting
pdftoppm -jpeg -jpegopt quality=85 -r 200 document.pdf jpeg_output
```

Python equivalent with `pypdfium2`:

```python
import pypdfium2 as pdfium

pdf = pdfium.PdfDocument("document.pdf")
for i, page in enumerate(pdf):
    bitmap = page.render(scale=3.0)  # scale=1.0 is 72 DPI, 3.0 ≈ 216 DPI
    bitmap.to_pil().save(f"page_{i+1}.png", "PNG")
```

## Fallback Pattern: Try Text Extraction, OCR if Empty

A common pipeline — attempt native text extraction, fall back to OCR only when needed (OCR is slow):

```python
from pypdf import PdfReader
from pdf2image import convert_from_path
import pytesseract

def extract_text(pdf_path, min_chars=50):
    reader = PdfReader(pdf_path)
    native = "".join(p.extract_text() or "" for p in reader.pages)
    if len(native.strip()) >= min_chars:
        return native
    # Fallback to OCR
    images = convert_from_path(pdf_path, dpi=300)
    return "\n".join(pytesseract.image_to_string(img) for img in images)
```

## Troubleshooting

### OCR output is all gibberish
- Wrong language pack — confirm with `tesseract --list-langs`
- DPI too low — raise to 300 or 400 for small text
- Skewed/rotated scan — rotate first with `PIL.Image.rotate()` or detect with `deskew`

### `pdf2image` fails with "poppler not found"
Install poppler: `apt-get install poppler-utils` or `brew install poppler`. On Windows, pass the `poppler_path` argument pointing at the bin directory.

### OCR is very slow on large PDFs
- Process pages in parallel (`multiprocessing.Pool`)
- Lower DPI to 200 if text is large enough
- For Chinese/Japanese/Korean, `chi_sim+eng` is faster than `chi_sim+chi_tra+eng`
