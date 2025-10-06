// src/modules/meal/domain/validators.ts
import { SaveMealLogDTO } from "./types";

export function validateMealLog(dto: SaveMealLogDTO): true {
  const meals = ["breakfast", "lunch", "dinner", "snack"];
  if (!meals.includes(dto.meal_type)) {
    // Thêm thông tin chi tiết vào thông báo lỗi
    throw new Error(`Invalid meal_type: '${dto.meal_type}'. Expected one of: ${meals.join(', ')}`);
  }
  const portions = ["low","medium","high"];
  if (!portions.includes(dto.portion)) throw new Error("Invalid portion");
  if (!dto.ts) throw new Error("ts required");
  const t = new Date(dto.ts);
  if (isNaN(t.getTime())) throw new Error("ts must be ISO string");
  if (t.getTime() > Date.now()) throw new Error("ts cannot be in the future");
  if (dto.items && (!Array.isArray(dto.items) || dto.items.length === 0)) throw new Error("items must be non-empty array");
  return true;
}
