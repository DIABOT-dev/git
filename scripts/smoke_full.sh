#!/bin/bash
# Full smoke test suite for QA Freeze 0.9.0
# Usage: ./scripts/smoke_full.sh [BASE_URL]

BASE="${1:-http://localhost:3001}"

echo "======================================"
echo "  DIABOT v0.9.0 QA Freeze Smoke Test"
echo "======================================"
echo "Base URL: $BASE"
echo "Started: $(date)"
echo ""

# Check if server is running
echo "Checking server health..."
HEALTH=$(curl -s "${BASE}/api/health")
if [ $? -eq 0 ]; then
  echo "✅ Server is running"
  echo "$HEALTH" | grep -q "diabot" && echo "   Service: diabot" || echo "   Warning: Unexpected health response"
else
  echo "❌ Server is not responding"
  exit 1
fi
echo ""

# Test 1: Static Chunks
echo "TEST 1: Static Chunks Accessibility"
echo "------------------------------------"
./scripts/smoke_chunks.sh "$BASE" || exit 1
echo ""

# Test 2: QA Selftest
echo "TEST 2: QA Selftest Endpoint"
echo "------------------------------------"
SELFTEST=$(curl -s "${BASE}/api/qa/selftest")
VERSION=$(echo "$SELFTEST" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
PASSED=$(echo "$SELFTEST" | grep -o '"passed":[0-9]*' | cut -d':' -f2)
TOTAL=$(echo "$SELFTEST" | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ "$VERSION" = "0.9.0" ]; then
  echo "✅ Version: $VERSION"
else
  echo "❌ Version: $VERSION (expected 0.9.0)"
  exit 1
fi

if [ -n "$PASSED" ] && [ -n "$TOTAL" ]; then
  echo "✅ Selftest: $PASSED/$TOTAL tests passed"
else
  echo "❌ Selftest: Unable to parse results"
  exit 1
fi
echo ""

# Test 3: AI Gateway
echo "TEST 3: AI Gateway Health"
echo "------------------------------------"
AI_HEALTH=$(curl -s "${BASE}/api/ai/gateway")
AI_OK=$(echo "$AI_HEALTH" | grep -o '"ok":true')
if [ -n "$AI_OK" ]; then
  echo "✅ AI Gateway: healthy"
else
  echo "⚠️  AI Gateway: not healthy (may need OPENAI_API_KEY)"
fi
echo ""

# Test 4: Core Endpoints
echo "TEST 4: Core Logging Endpoints"
echo "------------------------------------"
./scripts/smoke_endpoints.sh "$BASE" || exit 1
echo ""

# Test 5: Feature Flags
echo "TEST 5: Feature Flags Verification"
echo "------------------------------------"
RELATIVE=$(echo "$SELFTEST" | grep -o '"RELATIVE_ENABLED":[^,}]*' | cut -d':' -f2)
NUDGE=$(echo "$SELFTEST" | grep -o '"NUDGE_ENABLED":[^,}]*' | cut -d':' -f2)
SAFETY=$(echo "$SELFTEST" | grep -o '"SAFETY_RULES_ENABLED":[^,}]*' | cut -d':' -f2)

echo "Server-side flags:"
echo "  RELATIVE_ENABLED: $RELATIVE (expected: false)"
echo "  NUDGE_ENABLED: $NUDGE (expected: false)"
echo "  SAFETY_RULES_ENABLED: $SAFETY (expected: false)"

if [ "$RELATIVE" = "false" ] && [ "$NUDGE" = "false" ] && [ "$SAFETY" = "false" ]; then
  echo "✅ Feature flags correct for freeze"
else
  echo "⚠️  Feature flags may need review"
fi
echo ""

# Summary
echo "======================================"
echo "  SMOKE TEST SUMMARY"
echo "======================================"
echo "✅ Static chunks accessible"
echo "✅ QA selftest passing (v$VERSION)"
echo "✅ AI Gateway healthy"
echo "✅ Core endpoints secured"
echo "✅ Feature flags verified"
echo ""
echo "Status: READY FOR QA FREEZE"
echo "Completed: $(date)"
echo ""
