#!/bin/bash
set -e

echo "🧩 Waiting for Postgres..."
until pg_isready -h localhost -U diabot -d diabot >/dev/null 2>&1; do
  sleep 2
done
export DIABOT_DB_URL="postgresql://diabot:diabot@localhost:5432/diabot"

echo "📦 Migrations"
psql "$DIABOT_DB_URL" -f migrations/100_indexes.sql
psql "$DIABOT_DB_URL" -f migrations/101_views.sql

echo "🌱 Seed"
psql "$DIABOT_DB_URL" -f scripts/seed.sql
PROFILE_ID=$(psql "$DIABOT_DB_URL" -t -c "select id from profiles limit 1;" | xargs)
echo "PROFILE_ID=$PROFILE_ID"

echo "🧩 Wait app on :3000"
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/qa/selftest | grep -q "200"; then
    echo "✅ App ready"
    break
  fi
  sleep 3
done

echo "🧪 Probes"
psql "$DIABOT_DB_URL" -c "EXPLAIN SELECT * FROM bg_logs WHERE profile_id='${PROFILE_ID}' ORDER BY ts DESC LIMIT 20;"
curl -sS -i -X POST http://localhost:3000/api/log/bg \
  -H "Content-Type: application/json" \
  -d "{\"profile_id\":\"${PROFILE_ID}\",\"value\":120,\"unit\":\"mg/dL\",\"context\":\"fasting\",\"ts\":\"2025-10-10T12:00:00Z\"}"
curl -sS "http://localhost:3000/api/chart/7d?profile_id=${PROFILE_ID}"
