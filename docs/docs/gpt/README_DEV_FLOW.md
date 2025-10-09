# GPT Development Flow – Official

## 🔁 Branch Workflow
gpt-dev  →  gpt-control  →  main

## 🚀 Quy tắc làm việc
- GPT chỉ commit ở `gpt-dev`
- PR `gpt-dev → gpt-control` → review & CI check
- PR `gpt-control → main` khi CI xanh
- `main` có branch protection, require status check

## 🧠 Mục tiêu
- GPT thay thế Bolt làm Dev Lead tự động
- Giữ ngữ cảnh qua docs/ + spec
- Không truy cập DB hoặc storage trực tiếp
