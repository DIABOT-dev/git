import { WeightLogDTO } from "./types";

export function validateWeightLog(dto: WeightLogDTO): string | null {
  if (!dto.weight_kg || dto.weight_kg <= 0) return "Cân nặng không hợp lệ";
  if (dto.weight_kg < 25 || dto.weight_kg > 300) return "Giá trị ngoài khoảng cho phép (25–300kg)";
  if (!dto.taken_at) return "Thiếu thời gian";
  if (new Date(dto.taken_at) > new Date()) return "Thời gian không được lớn hơn hiện tại";
  return null;
}
