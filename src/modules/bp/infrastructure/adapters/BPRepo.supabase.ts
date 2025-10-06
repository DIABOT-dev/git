import { BPLog } from '../../domain/types';
import { client as supabase } from '@/lib/supabase/client';

export const BPRepo = {
  async insert(dto: BPLog) {
    const { data, error } = await supabase
      .from("bp_logs")
      .insert({
        systolic: dto.systolic,
        diastolic: dto.diastolic,
        pulse: dto.pulse ?? null,
        taken_at: dto.taken_at,
        // user_id để RLS tự điền theo session; không gửi từ UI
      })
      .select("id")
      .single();
    if (error) throw error;
    return { id: data.id, status: 201 as const };
  },

};