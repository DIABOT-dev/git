import { supabase } from "@/lib/supabase/client";
import type { SaveWaterLogDTO } from "../../domain/types";

export const WaterRepo = {
  async create(dto: SaveWaterLogDTO) {
    const payload: Record<string, any> = {
      ml: dto.amount_ml,          // map UI -> DB
      kind: dto.kind ?? null,
      at: dto.taken_at,           // map UI -> DB
      // profile_id: để RLS tự gán theo session
    };

    const { data, error } = await supabase
      .from("water_logs")
      .insert(payload)
      .select("id")
      .single();

    if (error) throw new Error(`REPO_ERROR:${error.message}`);
    return { id: data?.id ?? null };
  },
};
