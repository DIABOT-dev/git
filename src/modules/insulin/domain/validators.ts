import { SaveInsulinLogDTO, InsulinType, InsulinContext } from "./types";

const TYPES: InsulinType[] = ["am", "pm"];
const CONTEXTS: InsulinContext[] = ["before", "after2h", "random"];

export function validateInsulinDTO(
  dto: SaveInsulinLogDTO
): { valid: true } | { valid: false; message: string } {
  if (typeof dto.dose !== "number" || Number.isNaN(dto.dose) || dto.dose <= 0) {
    return { valid: false, message: "Liều insulin phải là số > 0." };
  }
  if (!TYPES.includes(dto.type)) {
    return { valid: false, message: "Type chỉ nhận 'am' hoặc 'pm'." };
  }
  if (!CONTEXTS.includes(dto.context)) {
    return { valid: false, message: "Context chỉ nhận 'before' | 'after2h' | 'random'." };
  }
  const t = Date.parse(dto.taken_at);
  if (Number.isNaN(t)) {
    return { valid: false, message: "Thời điểm không hợp lệ." };
  }
  if (t > Date.now()) {
    return { valid: false, message: "Thời điểm không được ở tương lai." };
  }
  return { valid: true };
}
