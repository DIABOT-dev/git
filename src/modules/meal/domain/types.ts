// src/modules/meal/domain/types.ts
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type Portion = "low" | "medium" | "high";

export type SaveMealLogDTO = {
  meal_type: MealType;
  items?: any[];        // mảng món ăn
  text?: string;        // <--- THÊM DÒNG NÀY
  portion: Portion;     // map trực tiếp với DB (text/enum)
  ts: string;           // ISO string, <= now
  image_url?: string;   // Thêm dòng này nếu bạn đã thêm cột image_url vào DB
};
