# Test Plan — LOG BG (No-code phase)
Unit (sau): validators (value>0, unit hợp lệ, taken_at <= now), usecase (mock repo)
Contract: POST /log/bg trả 201/4xx đúng schema
E2E: Dashboard → /log/bg → nhập hợp lệ → Lưu → Toast "Lưu thành công"
A11y: Lighthouse ≥ 90; keyboard-only; SR labels
