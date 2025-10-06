#!/bin/bash

# DIABOT V4 - API Test Commands (Bộ A - Chuẩn API V4)
# Thay <ACCESS>, <REFRESH>, <UID> bằng giá trị thực

echo "=== WATER LOG ==="
curl -i -X POST -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  -d '{"amount_ml":250,"taken_at":"2025-01-27T10:00:00Z"}' \
  http://localhost:3000/api/log/water

echo -e "\n=== MEAL LOG ==="
curl -i -X POST -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  -d '{"items":["Rice","Chicken"],"carbs_g":45,"calories_kcal":320,"taken_at":"2025-01-27T12:00:00Z"}' \
  http://localhost:3000/api/log/meal

echo -e "\n=== GLUCOSE LOG ==="
curl -i -X POST -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  -d '{"value_mgdl":110,"tag":"fasting","taken_at":"2025-01-27T07:00:00Z"}' \
  http://localhost:3000/api/log/bg

echo -e "\n=== INSULIN LOG ==="
curl -i -X POST -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  -d '{"dose_units":5,"type":"bolus","taken_at":"2025-01-27T12:30:00Z"}' \
  http://localhost:3000/api/log/insulin

echo -e "\n=== WEIGHT LOG ==="
curl -i -X POST -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  -d '{"weight_kg":70.5,"taken_at":"2025-01-27T08:00:00Z"}' \
  http://localhost:3000/api/log/weight

echo -e "\n=== BP LOG ==="
curl -i -X POST -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  -d '{"systolic":120,"diastolic":80,"pulse":72,"taken_at":"2025-01-27T09:00:00Z"}' \
  http://localhost:3000/api/log/bp

echo -e "\n=== PROFILE GET ==="
curl -i -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  http://localhost:3000/api/profile/<UID>

echo -e "\n=== CHART GET ==="
curl -i -H "Cookie: sb-access-token=<ACCESS>; sb-refresh-token=<REFRESH>" \
  "http://localhost:3000/api/chart/bg_avg?range=7d"