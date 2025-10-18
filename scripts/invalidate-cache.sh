#!/bin/bash

###############################################################################
# invalidate-cache.sh - CloudFlare cache invalidation script
#
# This script invalidates the CloudFlare CDN cache after deployment
#
# Usage: ./scripts/invalidate-cache.sh
#
# Environment variables:
#   CLOUDFLARE_ZONE_ID - CloudFlare zone ID (required)
#   CLOUDFLARE_API_TOKEN - CloudFlare API token with cache purge permissions (required)
#   DOMAIN_NAME - Domain name (default: dharambhushan.com)
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
DOMAIN_NAME="${DOMAIN_NAME:-dharambhushan.com}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
API_TOKEN="${CLOUDFLARE_API_TOKEN:-}"

echo -e "${GREEN}====================================${NC}"
echo -e "${GREEN}CloudFlare Cache Invalidation${NC}"
echo -e "${GREEN}====================================${NC}"
echo ""

# Validate prerequisites
if [ -z "$ZONE_ID" ]; then
  echo -e "${RED}Error: CLOUDFLARE_ZONE_ID environment variable not set${NC}"
  echo ""
  echo "To find your Zone ID:"
  echo "  1. Log in to CloudFlare dashboard"
  echo "  2. Select your domain ($DOMAIN_NAME)"
  echo "  3. Scroll down to find 'Zone ID' in the right sidebar"
  echo ""
  echo "Then set it:"
  echo "  export CLOUDFLARE_ZONE_ID='your-zone-id'"
  echo ""
  exit 1
fi

if [ -z "$API_TOKEN" ]; then
  echo -e "${RED}Error: CLOUDFLARE_API_TOKEN environment variable not set${NC}"
  echo ""
  echo "To create an API token:"
  echo "  1. Go to: https://dash.cloudflare.com/profile/api-tokens"
  echo "  2. Click 'Create Token'"
  echo "  3. Use template 'Edit zone DNS' or create custom token with:"
  echo "     - Zone.Cache Purge permissions"
  echo "     - Zone Resources: Include > Specific zone > $DOMAIN_NAME"
  echo ""
  echo "Then set it:"
  echo "  export CLOUDFLARE_API_TOKEN='your-api-token'"
  echo ""
  exit 1
fi

echo "Configuration:"
echo "  → Domain: $DOMAIN_NAME"
echo "  → Zone ID: $ZONE_ID"
echo ""

# Purge everything
echo -e "${YELLOW}Purging CloudFlare cache...${NC}"

RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}')

# Check if successful
SUCCESS=$(echo "$RESPONSE" | grep -o '"success":[^,]*' | grep -o '[^:]*$' | tr -d ' ')

if [ "$SUCCESS" = "true" ]; then
  echo -e "${GREEN}✓ CloudFlare cache purged successfully${NC}"
  echo ""
  echo -e "${BLUE}Cache invalidation complete!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Wait 2-3 minutes for cache to clear globally"
  echo "  2. Test your website: https://$DOMAIN_NAME"
  echo "  3. Verify changes are visible"
  echo ""
else
  echo -e "${RED}✗ CloudFlare cache purge failed${NC}"
  echo ""
  echo "Response:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""
  exit 1
fi

echo -e "${GREEN}====================================${NC}"
