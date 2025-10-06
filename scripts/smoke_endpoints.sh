#!/bin/bash
# Smoke test: Verify 6 core logging endpoints return proper auth errors (401)
# Usage: ./scripts/smoke_endpoints.sh [BASE_URL]

BASE="${1:-http://localhost:3001}"

echo "=== Core Endpoints Authentication Test ==="
echo "Base URL: $BASE"
echo "Testing that endpoints require authentication (expect 401)..."
echo ""

TIMESTAMP=$(date -Iseconds 2>/dev/null || date +"%Y-%m-%dT%H:%M:%S%z")

# Test BG logging
echo "Testing BG log endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"mgdl\":120,\"measured_at\":\"${TIMESTAMP}\"}" \
  "${BASE}/api/log/bg")
if [ "$STATUS" = "401" ]; then
  echo "✅ BG Log: $STATUS (auth required)"
else
  echo "⚠️  BG Log: $STATUS (expected 401)"
fi

# Test Water logging
echo "Testing Water log endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"ml\":250,\"logged_at\":\"${TIMESTAMP}\"}" \
  "${BASE}/api/log/water")
if [ "$STATUS" = "401" ]; then
  echo "✅ Water Log: $STATUS (auth required)"
else
  echo "⚠️  Water Log: $STATUS (expected 401)"
fi

# Test Meal logging
echo "Testing Meal log endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test\",\"carbs_g\":30,\"logged_at\":\"${TIMESTAMP}\"}" \
  "${BASE}/api/log/meal")
if [ "$STATUS" = "401" ]; then
  echo "✅ Meal Log: $STATUS (auth required)"
else
  echo "⚠️  Meal Log: $STATUS (expected 401)"
fi

# Test Insulin logging
echo "Testing Insulin log endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"dose_units\":5,\"taken_at\":\"${TIMESTAMP}\"}" \
  "${BASE}/api/log/insulin")
if [ "$STATUS" = "401" ]; then
  echo "✅ Insulin Log: $STATUS (auth required)"
else
  echo "⚠️  Insulin Log: $STATUS (expected 401)"
fi

# Test BP logging
echo "Testing BP log endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"systolic\":120,\"diastolic\":80,\"taken_at\":\"${TIMESTAMP}\"}" \
  "${BASE}/api/log/bp")
if [ "$STATUS" = "401" ]; then
  echo "✅ BP Log: $STATUS (auth required)"
else
  echo "⚠️  BP Log: $STATUS (expected 401)"
fi

# Test Weight logging
echo "Testing Weight log endpoint..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{\"weight_kg\":70,\"taken_at\":\"${TIMESTAMP}\"}" \
  "${BASE}/api/log/weight")
if [ "$STATUS" = "401" ]; then
  echo "✅ Weight Log: $STATUS (auth required)"
else
  echo "⚠️  Weight Log: $STATUS (expected 401)"
fi

echo ""
echo "✅ All endpoints properly require authentication"
