#!/bin/bash
# Export Slidev presentation to PDF/PPTX/PNG
set -euo pipefail

FORMAT="${1:-pdf}"
OUTPUT="${2:-presentation}"

echo "=== Slidev Export ==="

# Verify we're in a slidev project
if [ ! -f "slides.md" ]; then
    echo "ERROR: slides.md not found. Run from project directory."
    exit 1
fi

# Ensure playwright is installed (required for export)
if [ ! -d "node_modules/playwright-chromium" ]; then
    echo "Installing playwright-chromium..."
    pnpm add -D playwright-chromium
    npx playwright install chromium
fi

case "$FORMAT" in
    pdf)
        echo "Exporting to PDF..."
        npx slidev export --output "${OUTPUT}.pdf"
        echo "Output: ${OUTPUT}.pdf"
        ;;
    pptx)
        echo "Exporting to PPTX..."
        npx slidev export --format pptx --output "${OUTPUT}.pptx"
        echo "Output: ${OUTPUT}.pptx"
        ;;
    png)
        echo "Exporting to PNG..."
        npx slidev export --format png --output "${OUTPUT}"
        echo "Output: ${OUTPUT}/"
        ;;
    *)
        echo "ERROR: Unknown format '$FORMAT'"
        echo "Supported: pdf, pptx, png"
        exit 1
        ;;
esac

echo ""
echo "=== Export Complete ==="
