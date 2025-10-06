import { supabaseAdmin } from "@/lib/db";
import { WaterRepository } from "@/application/ports/WaterRepository";
import { WaterIntake } from "@/domain/entities/WaterIntake";

export class SupabaseWaterRepository implements WaterRepository {
  async create(entry: WaterIntake): Promise<WaterIntake> {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase.from("water_logs").insert({
      user_id: entry.userId,
      ml: entry.ml,
      at: entry.at
    }).select().single();
    if (error) throw error;
    return { ...entry, id: data.id };
  }
}
