#!/bin/sh

# AI Gateway Smoke Test - Mock Mode (0 tokens)
set -e

BASE_URL="http://localhost:3000"
GATEWAY="$BASE_URL/api/ai/gateway"

echo "🧪 AI GATEWAY SMOKE TEST (MOCK MODE)"
echo "=================================="

# Step 1: Healthcheck
echo "1️⃣ Healthcheck..."
HEALTH=$(curl -s "$GATEWAY")
echo "Response: $HEALTH"

if echo "$HEALTH" | grep -q '"ok":true'; then
  echo "✅ Healthcheck PASS"
else
  echo "❌ Healthcheck FAIL"
  exit 1
fi

# Step 2: Coach checkin
echo ""
echo "2️⃣ Coach checkin..."
COACH=$(curl -s -X POST "$GATEWAY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: smoke-coach" \
  -d '{"user_id":"demo","intent":"coach_checkin","message":"Hôm nay nên làm gì?"}')

echo "Response: $COACH"

if echo "$COACH" | grep -q '"output"'; then
  echo "✅ Coach checkin PASS"
else
  echo "❌ Coach checkin FAIL"
  exit 1
fi

# Step 3: Safety escalation (BG=320)
echo ""
echo "3️⃣ Safety escalation..."
SAFETY=$(curl -s -X POST "$GATEWAY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: smoke-safety" \
  -d '{"user_id":"demo","intent":"coach_checkin","message":"BG 320, hơi lo"}')

echo "Response: $SAFETY"

if echo "$SAFETY" | grep -q '"safety":"high"'; then
  echo "✅ Safety escalation PASS"
else
  echo "❌ Safety escalation FAIL"
  exit 1
fi

echo ""
echo "🎉 ALL SMOKE TESTS PASSED"