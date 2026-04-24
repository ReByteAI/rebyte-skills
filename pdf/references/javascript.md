# JavaScript / Node.js PDF Libraries

Use when the runtime is Node, the browser, or another JS environment — not in Python.

## Tool Selection

| Task | Library |
|---|---|
| Create PDFs from scratch in Node | `pdf-lib` (MIT) |
| Modify existing PDFs in Node | `pdf-lib` |
| Render PDFs in the browser | `pdfjs-dist` (Apache) — Mozilla's PDF.js |
| Extract text with coordinates in JS | `pdfjs-dist` |
| Inspect form fields / annotations | `pdfjs-dist` |

## pdf-lib

### Load and Modify an Existing PDF

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const existing = fs.readFileSync('input.pdf');
const pdf = await PDFDocument.load(existing);

console.log(`Pages: ${pdf.getPageCount()}`);

const newPage = pdf.addPage([600, 400]);
newPage.drawText('Added by pdf-lib', { x: 100, y: 300, size: 16 });

fs.writeFileSync('modified.pdf', await pdf.save());
```

### Create a PDF from Scratch

```javascript
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

const pdf = await PDFDocument.create();
const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

const page = pdf.addPage([595, 842]); // A4
const { width, height } = page.getSize();

page.drawText('Invoice #12345', {
    x: 50, y: height - 50,
    size: 18, font: bold,
    color: rgb(0.2, 0.2, 0.8),
});

page.drawRectangle({
    x: 40, y: height - 100,
    width: width - 80, height: 30,
    color: rgb(0.9, 0.9, 0.9),
});

const rows = [
    ['Item',    'Qty', 'Price', 'Total'],
    ['Widget',  '2',   '$50',   '$100'],
    ['Gadget',  '1',   '$75',   '$75'],
];

let y = height - 150;
for (const row of rows) {
    let x = 50;
    for (const cell of row) {
        page.drawText(cell, { x, y, size: 12, font: helvetica });
        x += 120;
    }
    y -= 25;
}

fs.writeFileSync('created.pdf', await pdf.save());
```

### Merge PDFs (with Per-PDF Page Selection)

```javascript
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

const merged = await PDFDocument.create();

const pdf1 = await PDFDocument.load(fs.readFileSync('doc1.pdf'));
const pdf2 = await PDFDocument.load(fs.readFileSync('doc2.pdf'));

// All pages from pdf1
const pages1 = await merged.copyPages(pdf1, pdf1.getPageIndices());
pages1.forEach(p => merged.addPage(p));

// Specific pages from pdf2 (0, 2, 4)
const pages2 = await merged.copyPages(pdf2, [0, 2, 4]);
pages2.forEach(p => merged.addPage(p));

fs.writeFileSync('merged.pdf', await merged.save());
```

## pdfjs-dist (PDF.js)

### Render a Page to Canvas (Browser)

```javascript
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.js';

const pdf = await pdfjsLib.getDocument('document.pdf').promise;
console.log(`Pages: ${pdf.numPages}`);

const page = await pdf.getPage(1);
const viewport = page.getViewport({ scale: 1.5 });

const canvas = document.createElement('canvas');
canvas.width = viewport.width;
canvas.height = viewport.height;

await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport,
}).promise;

document.body.appendChild(canvas);
```

### Extract Text with Coordinates

```javascript
import * as pdfjsLib from 'pdfjs-dist';

const pdf = await pdfjsLib.getDocument('document.pdf').promise;
let fullText = '';

for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const pageText = content.items.map(item => item.str).join(' ');
    fullText += `\n--- Page ${i} ---\n${pageText}`;

    // Each item has transform[4]=x, transform[5]=y
    const withCoords = content.items.map(item => ({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5],
        width: item.width,
        height: item.height,
    }));
}
```

### Read Annotations and Form Fields

```javascript
const pdf = await pdfjsLib.getDocument('annotated.pdf').promise;

for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const annotations = await page.getAnnotations();
    for (const a of annotations) {
        console.log(`type=${a.subtype} contents=${a.contents} rect=${JSON.stringify(a.rect)}`);
    }
}
```

## Licensing

- `pdf-lib`: MIT — safe for commercial use
- `pdfjs-dist`: Apache 2.0 — safe for commercial use
