import { supabaseAdmin } from "@/lib/db";
import { InsulinRepository } from "@/application/ports/InsulinRepository";
import { InsulinDose } from "@/domain/entities/InsulinDose";

export class SupabaseInsulinRepository implements InsulinRepository {
  async create(entry: InsulinDose): Promise<InsulinDose> {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase.from("insulin_logs").insert({
      user_id: entry.userId,
      units: entry.units,
      insulin_type: entry.insulinType,
      at: entry.at
    }).select().single();
    if (error) throw error;
    return { ...entry, id: data.id };
  }
}
