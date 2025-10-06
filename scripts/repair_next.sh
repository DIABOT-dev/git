#!/usr/bin/env sh
# Removed: set -eu (due to jsh error)

echo "🧹 Clean build caches..."
rm -rf .next .turbo dist coverage
rm -rf node_modules/.cache || true

echo "🗑️  Remove node_modules & lock conflicts"
rm -rf node_modules package-lock.json || true
npm cache clean --force # <--- THÊM DÒNG NÀY
npm install --legacy-peer-deps # <--- THÊM CỜ NÀY

echo "🧱 Rebuild Next.js..."
# ép Next tạo lại toàn bộ manifest trong .next/
npm run build

echo "🚀 Start dev server (port auto)..."
npm run dev
