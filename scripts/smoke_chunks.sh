#!/bin/bash
# Smoke test: Verify static chunks are accessible (HTTP 200)
# Usage: ./scripts/smoke_chunks.sh [BASE_URL]

BASE="${1:-http://localhost:3001}"

echo "=== Static Chunks Accessibility Test ==="
echo "Base URL: $BASE"
echo ""

# Test key chunks
echo "Testing webpack chunk..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/_next/static/chunks/webpack-f1e3bd20fef4059a.js")
if [ "$STATUS" = "200" ]; then
  echo "✅ Webpack chunk: $STATUS"
else
  echo "❌ Webpack chunk: $STATUS (expected 200)"
  exit 1
fi

echo "Testing layout chunk..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/_next/static/chunks/app/layout-ca0dc2a2855fe0c6.js")
if [ "$STATUS" = "200" ]; then
  echo "✅ Layout chunk: $STATUS"
else
  echo "❌ Layout chunk: $STATUS (expected 200)"
  exit 1
fi

echo "Testing framework chunk..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}/_next/static/chunks/framework-f66176bb897dc684.js")
if [ "$STATUS" = "200" ]; then
  echo "✅ Framework chunk: $STATUS"
else
  echo "❌ Framework chunk: $STATUS (expected 200)"
  exit 1
fi

echo ""
echo "✅ All static chunks accessible"
