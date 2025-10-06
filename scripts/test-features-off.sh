#!/bin/bash
# Test script: Verify feature flags OFF mode
# All new APIs should return 404 when flags are OFF

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "Feature Flags OFF-Mode Test"
echo "================================================"
echo "Base URL: $BASE_URL"
echo ""

# Test counter
PASSED=0
FAILED=0

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local expected_status=$3
  local description=$4

  echo -n "Testing: $description ... "

  if [ "$method" == "GET" ]; then
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
  else
    status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d '{}' "$BASE_URL$endpoint")
  fi

  if [ "$status" == "$expected_status" ]; then
    echo -e "${GREEN}PASS${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}FAIL${NC} (Expected HTTP $expected_status, got HTTP $status)"
    ((FAILED++))
  fi
}

# Test FamilyLink endpoints (should return 404 when RELATIVE_ENABLED=false)
echo "Testing FamilyLink endpoints (RELATIVE_ENABLED=false)..."
echo "----------------------------------------------"
test_endpoint "POST" "/api/relative/add" "404" "POST /api/relative/add"
test_endpoint "GET" "/api/relative/dashboard?user_id=test" "404" "GET /api/relative/dashboard"
test_endpoint "POST" "/api/relative/log/bg" "404" "POST /api/relative/log/bg"
test_endpoint "POST" "/api/relative/log/meal" "404" "POST /api/relative/log/meal"
test_endpoint "POST" "/api/relative/log/water" "404" "POST /api/relative/log/water"
echo ""

# Test Proactive Nudge endpoints (should return 404 when NUDGE_ENABLED=false)
echo "Testing Proactive Nudge endpoints (NUDGE_ENABLED=false)..."
echo "----------------------------------------------"
test_endpoint "GET" "/api/nudge/today" "404" "GET /api/nudge/today"
test_endpoint "POST" "/api/nudge/ack" "404" "POST /api/nudge/ack"
echo ""

# Test QA selftest (should include feature flags)
echo "Testing QA selftest endpoint..."
echo "----------------------------------------------"
echo -n "Testing: GET /api/qa/selftest ... "
response=$(curl -s "$BASE_URL/api/qa/selftest")
status=$(echo "$response" | jq -r '.meta.version' 2>/dev/null || echo "")

if [ -n "$status" ]; then
  echo -e "${GREEN}PASS${NC} (Version: $status)"
  ((PASSED++))

  # Check if feature flags are present
  has_flags=$(echo "$response" | jq -r '.featureFlags' 2>/dev/null || echo "null")
  if [ "$has_flags" != "null" ]; then
    echo -e "${GREEN}✓${NC} Feature flags present in response"
    relative_flag=$(echo "$response" | jq -r '.featureFlags.serverSide.RELATIVE_ENABLED' 2>/dev/null || echo "null")
    nudge_flag=$(echo "$response" | jq -r '.featureFlags.serverSide.NUDGE_ENABLED' 2>/dev/null || echo "null")
    echo "  RELATIVE_ENABLED: $relative_flag"
    echo "  NUDGE_ENABLED: $nudge_flag"
  else
    echo -e "${YELLOW}⚠${NC} Feature flags not found in response"
  fi
else
  echo -e "${RED}FAIL${NC}"
  ((FAILED++))
fi
echo ""

# Summary
echo "================================================"
echo "Test Summary"
echo "================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed!${NC}"
  exit 1
fi
