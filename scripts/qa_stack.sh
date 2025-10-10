#!/bin/bash
set -e

echo "🧩 Waiting for Postgres to be ready..."
until pg_isready -h localhost -U diabot -d diabot > /dev/null 2>&1; do
  echo "⏳ Still waiting..."
  sleep 2
done
echo "✅ Postgres is ready!"

export DIABOT_DB_URL="postgresql://diabot:diabot@localhost:5432/diabot"

echo "📦 Running migrations..."
psql "$DIABOT_DB_URL" -f migrations/100_indexes.sql || true
psql "$DIABOT_DB_URL" -f migrations/101_views.sql || true

echo "🌱 Seeding database..."
if [ -f scripts/seed.sql ]; then
  psql "$DIABOT_DB_URL" -f scripts/seed.sql
else
  echo "⚠️ No seed.sql found, skipping."
fi

echo "🚀 Starting Next.js in background..."
npm run build > /dev/null 2>&1 || true
npm run start &

echo "🧩 Waiting for app to respond..."
for i in {1..20}; do
  if curl -s http://localhost:3000/api/qa/selftest | grep -q "200"; then
    echo "✅ App is ready!"
    break
  fi
  echo "⏳ Still waiting for app..."
  sleep 3
done

echo "🧪 Running QA probes..."
PROFILE_ID=$(psql "$DIABOT_DB_URL" -t -c "SELECT id FROM profiles LIMIT 1;" | xargs)

echo "PROFILE_ID=$PROFILE_ID" >> $GITHUB_ENV

psql "$DIABOT_DB_URL" -c "EXPLAIN SELECT * FROM bg_logs WHERE profile_id='${PROFILE_ID}' ORDER BY ts DESC LIMIT 20;"
curl -sS -i -X POST http://localhost:3000/api/log/bg \
  -H "Content-Type: application/json" \
  -d "{\"profile_id\":\"${PROFILE_ID}\",\"value\":120,\"unit\":\"mg/dL\",\"context\":\"fasting\",\"ts\":\"2025-10-10T12:00:00Z\"}"
curl -sS "http://localhost:3000/api/chart/7d?profile_id=${PROFILE_ID}"

echo "✅ QA probes completed."
