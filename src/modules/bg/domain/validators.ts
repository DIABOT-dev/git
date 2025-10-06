// src/modules/bg/domain/validators.ts
import type { BGLogDTO } from "./types";

const UNIT = new Set(["mg/dL","mmol/L"]);
const CONTEXT = new Set(["before","after2h","random"]);

export function validateBG(dto: BGLogDTO): { valid: true } | { valid: false; message: string; errors?: string[] } {
  if (!dto || typeof dto !== "object") {
    return { valid: false, message: "Thiếu dữ liệu ghi BG." };
  }
  if (typeof dto.value !== "number" || Number.isNaN(dto.value) || dto.value <= 0) {
    return { valid: false, message: "Giá trị phải là số > 0." };
  }
  if (!UNIT.has(dto.unit)) {
    return { valid: false, message: "Đơn vị không hợp lệ." };
  }
  if (!CONTEXT.has(dto.context)) {
    return { valid: false, message: "Ngữ cảnh không hợp lệ." };
  }
  if (!dto.taken_at || Number.isNaN(Date.parse(dto.taken_at))) {
    return { valid: false, message: "Thời điểm không hợp lệ." };
  }
  if (Date.parse(dto.taken_at) > Date.now()) {
    return { valid: false, message: "Thời điểm không được ở tương lai." };
  }
  return { valid: true };
}