import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { Profile } from "@/domain/types";

export class ProfilesRepo {
  async create(profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Promise<Profile> {
    const { data, error } = await supabaseAdmin // Gọi supabaseAdmin như một hàm
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw new Error(`Failed to create profile: ${error.message}`);
    return data;
  }

  async getById(id: string): Promise<Profile | null> {
    const { data, error } = await supabaseAdmin // Gọi supabaseAdmin như một hàm
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to get profile: ${error.message}`);
    }
    return data;
  }

  async update(id: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabaseAdmin // Gọi supabaseAdmin như một hàm
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update profile: ${error.message}`);
    return data;
  }
}
