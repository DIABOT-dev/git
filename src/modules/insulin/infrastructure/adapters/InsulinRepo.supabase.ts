import { SaveInsulinLogDTO, SaveResult } from "../../domain/types";
// Import client Supabase theo dự án của bạn:
import { createClient, SupabaseClient } from "@supabase/supabase-js";
// Nếu đã có client chung, thay thế các hàm khởi tạo bên dưới bằng client đó.

export interface InsulinRepo {
  save(dto: SaveInsulinLogDTO): Promise<SaveResult>;
}

export class InsulinRepoSupabase implements InsulinRepo {
  private sb: SupabaseClient;

  constructor(sb?: SupabaseClient) {
    // Ưu tiên DI từ ngoài vào; nếu không, tự tạo từ env (Next public url/anon key).
    this.sb =
      sb ??
      createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
  }

  async save(dto: SaveInsulinLogDTO): Promise<SaveResult> {
    // --- Mapping layer ---
    // UI/DTO gửi taken_at → DB có thể là 'ts' (ví dụ)
    const payload = {
  type: dto.type,             // enum 'am' | 'pm'
  dose_units: dto.dose,       // map dose -> dose_units
  context: dto.context,       // 'before' | 'after2h' | 'random'
  taken_at: dto.taken_at,     // ISO
      // profile_id: rely on RLS + auth trigger hoặc gắn từ auth context (Edge function) nếu đã thiết kế.
    };

const { data, error, status } = await this.sb
  .from("insulin_logs")
  .insert(payload)
  .select("id")
  .single();

    if (error) {
      return { ok: false, status: status || 500, error: error.message };
    }
    // Tiêu chí trả 201: Supabase trả 201 khi insert thành công
    return { ok: true, status: 201, id: data?.id };
  }
}
