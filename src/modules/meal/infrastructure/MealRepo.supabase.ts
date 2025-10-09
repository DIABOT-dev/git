// src/modules/meal/infrastructure/MealRepo.supabase.ts
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { SaveMealLogDTO } from "../domain/types";

export class MealRepo {
  async insert(dto: SaveMealLogDTO, userId: string) {
    // Sử dụng supabaseAdmin() để có client Supabase với service role key, bỏ qua RLS
    const supabase = supabaseAdmin(); // Gọi supabaseAdmin như một hàm
    const { data, error } = await supabase.from("meal_logs").insert({
      user_id: userId, // Sử dụng user_id được truyền vào
      meal_type: dto.meal_type,
      items: dto.items || [], // Sử dụng trực tiếp mảng items
      portion: dto.portion,
      taken_at: dto.ts, // Đổi 'ts' thành 'taken_at' để khớp schema
      // image_url: dto.image_url, // Thêm dòng này nếu bạn đã thêm cột image_url vào DB
    }).select("*");
    if (error) throw new Error(error.message);
    return data;
  }
}
