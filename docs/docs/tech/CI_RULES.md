# CI/CD Rules – DIABOT Pipeline

## 🧩 Branch Flow
- `gpt-dev`: feature & development (GPT làm việc)
- `gpt-control`: staging & review
- `main`: production (protected)

## ✅ Required Status Checks
- GPT Control CI (smoke read-only)
- Type check, build, lint

## 🧠 Commit Convention
<type>(scope): <message>

Types:
- feat: tính năng mới
- fix: sửa lỗi
- chore: bảo trì, cấu hình
- docs: tài liệu
- refactor: tái cấu trúc

## 🚀 PR Flow
1. PR từ `gpt-dev` → `gpt-control`
2. CI phải xanh (smoke pass)
3. PR từ `gpt-control` → `main` khi review xong

## 🧱 CI Jobs
- lint (eslint)
- test (vitest)
- build (next build)
- smoke (curl /api/qa/selftest → 200)
