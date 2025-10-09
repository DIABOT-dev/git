# Security Checklist – DIABOT

## 🚫 Những điều bị cấm
- Không đọc hoặc ghi `.env` trong code
- Không truy cập database hoặc API ngoài qua GPT
- Không commit secret, token, hoặc key
- Không kết nối trực tiếp tới Viettel S3 hay Postgres từ GPT
- Không dùng thư viện chưa được duyệt

## ✅ Quy tắc an toàn
- Dữ liệu thật chỉ đi qua DIA BRAIN Gateway
- GPT chỉ xử lý dữ liệu ẩn danh
- Mọi endpoint test phải là `/api/qa/*` hoặc `/api/mock/*`
- GitHub Actions: secrets lưu trong org, không push file `.env`
- Mọi PR phải có CI xanh trước khi merge
