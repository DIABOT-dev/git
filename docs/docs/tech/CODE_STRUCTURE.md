# DIABOT Code Structure – Clean Architecture & DDD

## 🧱 Layers Overview
- **Domain**: business entities, validators, and types (BG, BP, Meal, Weight, Water, Insulin)
- **Application**: use cases, repositories, services (pure logic)
- **Infrastructure**: adapters (API, database, storage)
- **UI**: components, forms, hooks, pages

## 📂 Folder Layout (Next.js + TypeScript)
src/
 ├── app/              # Next.js routes
 ├── modules/          # Domain modules (bg, meal, weight, etc.)
 ├── shared/           # Shared components, ui, hooks, utils
 ├── lib/              # Config, constants, db connection
 ├── types/            # Global types
 ├── tests/            # Unit & integration tests

## 🔁 Cross-module Rules
- Không import trực tiếp giữa modules → chỉ dùng shared/
- shared/ui cho component tái sử dụng
- shared/utils cho hàm helper, validator
- lib/ giữ config dùng chung (env-safe)

## 🧩 Deployment Flow
- Build → Docker multi-stage
- GitHub Actions: lint → test → build → smoke
- Deploy lên Viettel Cloud container (Caddy reverse proxy)
