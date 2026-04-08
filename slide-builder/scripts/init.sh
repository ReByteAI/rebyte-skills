#!/bin/bash
# Initialize a new Slidev presentation project
set -euo pipefail

PROJECT_NAME="${1:-}"
THEME="${2:-seriph}"

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: bash scripts/init.sh <project-name> [theme]"
    echo "Example: bash scripts/init.sh my-talk seriph"
    exit 1
fi

# Determine project directory
if [ -d "/code" ]; then
    PROJECT_DIR="/code/$PROJECT_NAME"
else
    PROJECT_DIR="$PWD/$PROJECT_NAME"
fi

echo "=== Slidev Init ==="
echo "Project: $PROJECT_DIR"
echo "Theme: $THEME"

# Theme to package mapping
# Official themes use @slidev/theme-* namespace
# Community themes use slidev-theme-* format
get_theme_package() {
    case "$1" in
        # Official themes (@slidev/ namespace)
        default)      echo "@slidev/theme-default" ;;
        seriph)       echo "@slidev/theme-seriph" ;;
        apple-basic)  echo "@slidev/theme-apple-basic" ;;
        shibainu)     echo "@slidev/theme-shibainu" ;;
        bricks)       echo "@slidev/theme-bricks" ;;
        # Community themes (slidev-theme-* format)
        dracula)      echo "slidev-theme-dracula" ;;
        eloc)         echo "slidev-theme-eloc" ;;
        unicorn)      echo "slidev-theme-unicorn" ;;
        penguin)      echo "slidev-theme-penguin" ;;
        academic)     echo "slidev-theme-academic" ;;
        mokkapps)     echo "slidev-theme-mokkapps" ;;
        the-unnamed)  echo "slidev-theme-the-unnamed" ;;
        frankfurt)    echo "slidev-theme-frankfurt" ;;
        hep)          echo "slidev-theme-hep" ;;
        excali-slide) echo "slidev-theme-excali-slide" ;;
        mint)         echo "slidev-theme-mint" ;;
        neversink)    echo "slidev-theme-neversink" ;;
        geist)        echo "slidev-theme-geist" ;;
        nord)         echo "slidev-theme-nord" ;;
        purplin)      echo "slidev-theme-purplin" ;;
        takahashi)    echo "slidev-theme-takahashi" ;;
        scholarly)    echo "slidev-theme-scholarly" ;;
        neocarbon)    echo "slidev-theme-neocarbon" ;;
        # Fallback: assume community theme format
        *)            echo "slidev-theme-$1" ;;
    esac
}

THEME_PACKAGE=$(get_theme_package "$THEME")

# Ensure pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

# Create or enter project
if [ -d "$PROJECT_DIR" ]; then
    echo "Project exists, entering..."
    cd "$PROJECT_DIR"
else
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"

    # package.json
    cat > package.json << EOF
{
  "name": "slidev-presentation",
  "private": true,
  "scripts": {
    "dev": "slidev --open",
    "build": "slidev build",
    "export": "slidev export",
    "export-pptx": "slidev export --format pptx"
  },
  "dependencies": {
    "@slidev/cli": "^51.0.0",
    "$THEME_PACKAGE": "latest",
    "@iconify-json/mdi": "latest",
    "@iconify-json/logos": "latest"
  },
  "devDependencies": {
    "playwright-chromium": "^1.40.0"
  }
}
EOF

    # Default slides.md
    cat > slides.md << 'EOF'
---
theme: THEME_PLACEHOLDER
title: My Presentation
favicon: https://rebyte.ai/favicon.ico
seoMeta:
  ogImage: auto
background: https://cover.sli.dev
class: text-center
transition: slide-left
---

# Presentation Title

Subtitle or tagline

---

# Agenda

<v-clicks>

- Topic 1
- Topic 2
- Topic 3

</v-clicks>

---

# Topic 1

Key point here

---
layout: two-cols
---

# Comparison

Left side content

::right::

Right side content

---
layout: fact
---

# 100%
Key Metric

---
layout: end
---

# Thank You!

Questions?
EOF

    # Replace theme placeholder
    sed -i.bak "s/THEME_PLACEHOLDER/$THEME/" slides.md && rm -f slides.md.bak

    echo "Installing dependencies..."
    pnpm install
fi

echo ""
echo "=== Done ==="
echo "Location: $PROJECT_DIR"
echo ""
echo "Next: Edit slides.md, then run 'bash scripts/build-deploy.sh'"
