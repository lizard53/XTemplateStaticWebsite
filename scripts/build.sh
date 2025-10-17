#!/bin/bash

###############################################################################
# build.sh - Build script for dharambhushan.com portfolio website
#
# This script:
# 1. Validates HTML, CSS, and JavaScript
# 2. Optimizes CSS and JavaScript files
# 3. Prepares the src/ directory for deployment
#
# Usage: ./scripts/build.sh
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"
DIST_DIR="$PROJECT_ROOT/dist"

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Building dharambhushan.com website${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# Check if src/ directory exists
if [ ! -d "$SRC_DIR" ]; then
  echo -e "${RED}Error: src/ directory not found${NC}"
  exit 1
fi

# Step 1: Clean dist directory
echo -e "${YELLOW}[1/5] Cleaning dist directory...${NC}"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/css" "$DIST_DIR/js"

# Step 2: Run linters
echo -e "${YELLOW}[2/5] Running linters...${NC}"
cd "$PROJECT_ROOT"

# HTML validation
echo "  → Validating HTML files..."
npx htmlhint "$SRC_DIR/**/*.html" || {
  echo -e "${RED}HTML validation failed${NC}"
  exit 1
}

# CSS validation
echo "  → Validating CSS files..."
npx stylelint "$SRC_DIR/css/**/*.css" || {
  echo -e "${RED}CSS validation failed${NC}"
  exit 1
}

# JavaScript validation
echo "  → Validating JavaScript files..."
npx eslint "$SRC_DIR/js/**/*.js" || {
  echo -e "${RED}JavaScript validation failed${NC}"
  exit 1
}

echo -e "${GREEN}  ✓ All linters passed${NC}"

# Step 3: Optimize CSS
echo -e "${YELLOW}[3/5] Optimizing CSS...${NC}"
npx clean-css-cli \
  -o "$DIST_DIR/css/main.min.css" \
  "$SRC_DIR/css/main.css" \
  "$SRC_DIR/css/components.css" \
  "$SRC_DIR/css/themes.css" \
  "$SRC_DIR/css/animations.css"

echo -e "${GREEN}  ✓ CSS optimized${NC}"

# Step 4: Optimize JavaScript
echo -e "${YELLOW}[4/5] Optimizing JavaScript...${NC}"
npx terser \
  "$SRC_DIR/js/main.js" \
  "$SRC_DIR/js/theme-toggle.js" \
  "$SRC_DIR/js/animations.js" \
  "$SRC_DIR/js/modal.js" \
  "$SRC_DIR/js/contact-form.js" \
  "$SRC_DIR/js/neural-network.js" \
  "$SRC_DIR/js/analytics.js" \
  -o "$DIST_DIR/js/bundle.min.js" \
  --compress \
  --mangle \
  --source-map "url=bundle.min.js.map"

echo -e "${GREEN}  ✓ JavaScript optimized${NC}"

# Step 5: Build summary
echo -e "${YELLOW}[5/5] Build summary...${NC}"

# Calculate file sizes
CSS_SIZE=$(du -h "$DIST_DIR/css/main.min.css" | cut -f1)
JS_SIZE=$(du -h "$DIST_DIR/js/bundle.min.js" | cut -f1)

echo ""
echo -e "${GREEN}Build completed successfully!${NC}"
echo ""
echo "Optimized files:"
echo "  → CSS: dist/css/main.min.css ($CSS_SIZE)"
echo "  → JS:  dist/js/bundle.min.js ($JS_SIZE)"
echo ""
echo "Source files are ready for deployment in: $SRC_DIR"
echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Build complete ✓${NC}"
echo -e "${GREEN}====================================${NC}"
