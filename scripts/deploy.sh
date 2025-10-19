#!/bin/bash

###############################################################################
# deploy.sh - Deployment script for static website to AWS S3
#
# This script:
# 1. Validates AWS credentials
# 2. Syncs the src/ directory to S3 bucket
# 3. Sets appropriate cache headers
# 4. Validates deployment
#
# Usage: ./scripts/deploy.sh [bucket-name]
#
# Environment variables:
#   S3_BUCKET_NAME - S3 bucket name (required - no default)
#   AWS_REGION     - AWS region (default: us-east-1)
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${1:-${S3_BUCKET_NAME:-}}"
AWS_REGION="${AWS_REGION:-us-east-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SRC_DIR="$PROJECT_ROOT/src"

# Validate bucket name is provided
if [ -z "$BUCKET_NAME" ]; then
  echo -e "${RED}Error: S3 bucket name is required${NC}"
  echo "Usage: $0 <bucket-name>"
  echo "   or: S3_BUCKET_NAME=<bucket-name> $0"
  exit 1
fi

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Deploying to AWS S3${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Configuration:"
echo "  → Bucket: $BUCKET_NAME"
echo "  → Region: $AWS_REGION"
echo "  → Source: $SRC_DIR"
echo ""

# Step 1: Validate prerequisites
echo -e "${YELLOW}[1/4] Validating prerequisites...${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
  echo -e "${RED}Error: AWS CLI is not installed${NC}"
  echo "Install it from: https://aws.amazon.com/cli/"
  exit 1
fi

# Check if source directory exists
if [ ! -d "$SRC_DIR" ]; then
  echo -e "${RED}Error: Source directory not found: $SRC_DIR${NC}"
  exit 1
fi

# Check AWS credentials
echo "  → Checking AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
  echo -e "${RED}Error: AWS credentials not configured${NC}"
  echo "Run: aws configure"
  exit 1
fi

AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}  ✓ Authenticated as AWS account: $AWS_ACCOUNT${NC}"

# Step 2: Build the website
echo -e "${YELLOW}[2/4] Building website...${NC}"
cd "$PROJECT_ROOT"
npm run build || {
  echo -e "${RED}Build failed${NC}"
  exit 1
}
echo -e "${GREEN}  ✓ Build completed${NC}"

# Step 3: Sync to S3
echo -e "${YELLOW}[3/4] Syncing to S3...${NC}"

# HTML files - short cache, must revalidate
echo "  → Uploading HTML files..."
aws s3 sync "$SRC_DIR" "s3://$BUCKET_NAME/" \
  --region "$AWS_REGION" \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=3600, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --metadata-directive REPLACE \
  --delete

# CSS files - long cache (1 year)
echo "  → Uploading CSS files..."
aws s3 sync "$SRC_DIR/css" "s3://$BUCKET_NAME/css" \
  --region "$AWS_REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "text/css; charset=utf-8" \
  --metadata-directive REPLACE \
  --delete

# JavaScript files - long cache (1 year)
echo "  → Uploading JavaScript files..."
aws s3 sync "$SRC_DIR/js" "s3://$BUCKET_NAME/js" \
  --region "$AWS_REGION" \
  --exclude "config.js" \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "application/javascript; charset=utf-8" \
  --metadata-directive REPLACE \
  --delete

# Images - long cache (1 year)
echo "  → Uploading images..."
aws s3 sync "$SRC_DIR/assets/images" "s3://$BUCKET_NAME/assets/images" \
  --region "$AWS_REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE \
  --delete

# Icons - long cache (1 year)
echo "  → Uploading icons..."
aws s3 sync "$SRC_DIR/assets/icons" "s3://$BUCKET_NAME/assets/icons" \
  --region "$AWS_REGION" \
  --cache-control "public, max-age=31536000, immutable" \
  --metadata-directive REPLACE \
  --delete

# Resume PDFs - medium cache (1 week)
if [ -d "$SRC_DIR/assets/resume" ]; then
  echo "  → Uploading resume files..."
  aws s3 sync "$SRC_DIR/assets/resume" "s3://$BUCKET_NAME/assets/resume" \
    --region "$AWS_REGION" \
    --cache-control "public, max-age=604800" \
    --content-type "application/pdf" \
    --metadata-directive REPLACE \
    --delete
fi

echo -e "${GREEN}  ✓ All files synced to S3${NC}"

# Step 4: Validate deployment
echo -e "${YELLOW}[4/4] Validating deployment...${NC}"

# Check if index.html exists in bucket
if aws s3 ls "s3://$BUCKET_NAME/index.html" --region "$AWS_REGION" &> /dev/null; then
  echo -e "${GREEN}  ✓ index.html found in bucket${NC}"
else
  echo -e "${RED}  ✗ index.html not found in bucket${NC}"
  exit 1
fi

# Get bucket size
BUCKET_SIZE=$(aws s3 ls "s3://$BUCKET_NAME" --recursive --region "$AWS_REGION" --summarize | grep "Total Size" | awk '{print $3}')
BUCKET_SIZE_MB=$(echo "scale=2; $BUCKET_SIZE / 1024 / 1024" | bc)
FILE_COUNT=$(aws s3 ls "s3://$BUCKET_NAME" --recursive --region "$AWS_REGION" --summarize | grep "Total Objects" | awk '{print $3}')

echo ""
echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}Deployment successful! ✓${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""
echo "Deployment summary:"
echo "  → Bucket: s3://$BUCKET_NAME"
echo "  → Region: $AWS_REGION"
echo "  → Files deployed: $FILE_COUNT"
echo "  → Total size: ${BUCKET_SIZE_MB} MB"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Invalidate CloudFlare cache: ./scripts/invalidate-cache.sh"
echo "  2. Verify website: https://$BUCKET_NAME"
echo ""
