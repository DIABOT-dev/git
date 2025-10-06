import { supabaseAdmin } from "@/lib/db";
import { MealRepository } from "@/application/ports/MealRepository";
import { Meal } from "@/domain/entities/Meal";

export class SupabaseMealRepository implements MealRepository {
  async create(entry: Meal): Promise<Meal> {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase.from("meal_logs").insert({
      user_id: entry.userId,
      meal_type: entry.mealType,
      foods_text: entry.foodsText,
      portion: entry.portion,
      at: entry.at
    }).select().single();
    if (error) throw error;
    return { ...entry, id: data.id };
  }
}
