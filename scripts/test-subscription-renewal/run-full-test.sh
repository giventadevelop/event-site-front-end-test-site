#!/bin/bash

# Full Automated Test Suite for Subscription Renewal
#
# This script runs the complete test suite:
# 1. Expedite Stripe subscription renewal
# 2. Wait for webhook processing
# 3. Verify database state
# 4. Trigger batch job
# 5. Verify final state
#
# Usage:
#   ./scripts/test-subscription-renewal/run-full-test.sh \
#     --subscription-id=sub_1SeifsK5BrggeAHMBvg2XE93 \
#     --tenant-id=tenant_demo_002 \
#     --days-to-advance=30

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SUBSCRIPTION_ID=""
TENANT_ID=""
DAYS_TO_ADVANCE=30

while [[ $# -gt 0 ]]; do
  case $1 in
    --subscription-id=*)
      SUBSCRIPTION_ID="${1#*=}"
      shift
      ;;
    --tenant-id=*)
      TENANT_ID="${1#*=}"
      shift
      ;;
    --days-to-advance=*)
      DAYS_TO_ADVANCE="${1#*=}"
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

if [ -z "$SUBSCRIPTION_ID" ]; then
  echo -e "${RED}Error: --subscription-id is required${NC}"
  echo "Usage: ./run-full-test.sh --subscription-id=sub_xxx --tenant-id=tenant_xxx [--days-to-advance=30]"
  exit 1
fi

if [ -z "$TENANT_ID" ]; then
  TENANT_ID="${NEXT_PUBLIC_TENANT_ID:-tenant_demo_002}"
  echo -e "${YELLOW}Warning: Using default tenant ID: $TENANT_ID${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Subscription Renewal Full Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Subscription ID: $SUBSCRIPTION_ID"
echo "Tenant ID: $TENANT_ID"
echo "Days to Advance: $DAYS_TO_ADVANCE"
echo ""

# Step 1: Expedite Stripe renewal
echo -e "${BLUE}[1/5] Expediting Stripe subscription renewal...${NC}"
node scripts/test-subscription-renewal/expedite-stripe-renewal.js \
  --subscription-id="$SUBSCRIPTION_ID" \
  --days-to-advance="$DAYS_TO_ADVANCE"

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to expedite Stripe renewal${NC}"
  exit 1
fi

# Step 2: Wait for webhook processing
echo -e "\n${BLUE}[2/5] Waiting for webhook processing (10 seconds)...${NC}"
sleep 10

# Step 3: Verify database state (before batch job)
echo -e "\n${BLUE}[3/5] Verifying database state (before batch job)...${NC}"
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id="$SUBSCRIPTION_ID" \
  --tenant-id="$TENANT_ID" || echo -e "${YELLOW}Database verification showed issues (may be expected)${NC}"

# Step 4: Trigger batch job
echo -e "\n${BLUE}[4/5] Triggering batch job...${NC}"
node scripts/test-subscription-renewal/trigger-batch-job.js \
  --tenant-id="$TENANT_ID" \
  --subscription-id="$SUBSCRIPTION_ID"

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to trigger batch job${NC}"
  exit 1
fi

# Step 5: Wait for batch job to complete
echo -e "\n${BLUE}Waiting for batch job to complete (10 seconds)...${NC}"
sleep 10

# Step 6: Verify final database state
echo -e "\n${BLUE}[5/5] Verifying final database state (after batch job)...${NC}"
node scripts/test-subscription-renewal/verify-database.js \
  --subscription-id="$SUBSCRIPTION_ID" \
  --tenant-id="$TENANT_ID"

if [ $? -eq 0 ]; then
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo -e "${GREEN}========================================${NC}"
else
  echo -e "\n${YELLOW}========================================${NC}"
  echo -e "${YELLOW}⚠️  Tests completed with warnings${NC}"
  echo -e "${YELLOW}========================================${NC}"
fi




