import { supabaseAdmin } from "@/lib/db";
import { BloodGlucoseRepository } from "@/application/ports/BloodGlucoseRepository";
import { BloodGlucose } from "@/domain/entities/BloodGlucose";

export class SupabaseBloodGlucoseRepository implements BloodGlucoseRepository {
  async create(entry: BloodGlucose): Promise<BloodGlucose> {
    const supabase = supabaseAdmin;
    const { data, error } = await supabase.from("bg_logs").insert({
      user_id: entry.userId,
      mgdl: entry.mgdl,
      context: entry.context,
      at: entry.at
    }).select().single();
    if (error) throw error;
    return { ...entry, id: data.id };
  }
}
