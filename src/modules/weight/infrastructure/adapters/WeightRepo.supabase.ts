import { client as supabase } from '@/lib/supabase/client';
import { WeightLogDTO } from "../../domain/types";

export const WeightRepo = {
  async insert(dto: WeightLogDTO) {
    const { data, error } = await supabase
      .from("weight_logs")
      .insert({
        weight_kg: dto.weight_kg,
        taken_at: dto.taken_at,
        // user_id để RLS tự điền theo session; không gửi từ UI
      })
      .select("id")
      .single();

    if (error) throw error;
    return { id: data.id, status: 201 as const };
  },
};
