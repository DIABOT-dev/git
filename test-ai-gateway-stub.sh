#!/bin/bash
# Test script for AI Gateway stub mode
# Usage: ./test-ai-gateway-stub.sh

set -e

echo "=== AI Gateway Stub Mode Test ==="
echo ""

# Test 1: Build with stub mode
echo "1. Testing build with AI_GATEWAY_STUB=true..."
AI_GATEWAY_STUB=true npm run build > /dev/null 2>&1
echo "✅ Build successful with stub mode"
echo ""

# Test 2: Start server and test GET
echo "2. Starting server with stub mode..."
AI_GATEWAY_STUB=true npm start > /tmp/server-stub.log 2>&1 &
SERVER_PID=$!
sleep 6

echo "3. Testing GET /api/ai/gateway..."
RESPONSE=$(curl -s http://localhost:3000/api/ai/gateway)
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "stub"; then
  echo "✅ GET endpoint returns stub mode indicator"
else
  echo "❌ GET endpoint missing stub mode indicator"
  kill $SERVER_PID
  exit 1
fi
echo ""

# Test 3: Test POST
echo "4. Testing POST /api/ai/gateway..."
POST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/ai/gateway \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test-123","message":"Test message"}')
echo "Response: $POST_RESPONSE"

if echo "$POST_RESPONSE" | grep -q '"mode":"stub"'; then
  echo "✅ POST endpoint returns stub response"
else
  echo "❌ POST endpoint missing stub response"
  kill $SERVER_PID
  exit 1
fi
echo ""

# Cleanup
echo "5. Stopping server..."
kill $SERVER_PID
sleep 2
echo "✅ Test completed successfully!"
echo ""
echo "NOTE: Stub mode is baked into build. To disable:"
echo "  1. Remove AI_GATEWAY_STUB from environment"
echo "  2. Run: npm run build"
echo "  3. Run: npm start"
