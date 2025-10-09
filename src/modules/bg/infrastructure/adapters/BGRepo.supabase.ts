import type { BGLogDTO, SaveResult } from "../../domain/types";
import type { BGRepo } from "../../application/ports/BGRepo";

// Convert mmol/L -> mg/dL (rounded)
function mmolToMgdl(v: number) {
  return Math.round(v * 18);
}

// DEV helper: if no session, keep a local user_id to satisfy RLS in non-auth demos
function getDevUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = "user_id";
    let id = window.localStorage.getItem(key);
    if (!id) {
      // best-effort UUID
      const uuid = (typeof crypto !== "undefined" && "randomUUID" in crypto) ? (crypto as any).randomUUID() : `dev_${Math.random().toString(36).slice(2)}`;
      id = uuid;
      window.localStorage.setItem(key, id || "");
    }
    return id;
  } catch {
    return null;
  }
}

// tag mapping for legacy schema (glucose_logs.tag)
const TAG_MAP: Record<BGLogDTO["context"], string> = {
  before: "before_meal",
  after2h: "after_meal",
  random: "random",
};

export class BGRepoSupabase implements BGRepo {
  async save(dto: BGLogDTO): Promise<SaveResult> {
    const user_id = dto.profile_id ?? getDevUserId();
    if (!user_id) {
      return { ok: false, status: 401, error: "Missing user session (user_id). Vui lòng đăng nhập lại." };
    }

    const value_mgdl = dto.unit === "mmol/L" ? mmolToMgdl(dto.value) : Math.round(dto.value);
    const tag = TAG_MAP[dto.context];

    try {
      // Call API instead of direct DB access (client-safe)
      const response = await fetch('/api/log/bg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          value_mgdl,
          tag,
          taken_at: dto.taken_at
        })
      });

      if (!response.ok) {
        const error = await response.json();
        return { ok: false, status: response.status, error: error.error || 'API error' };
      }

      const result = await response.json();
      return { ok: true, status: 201, id: result.id };
    } catch (error: any) {
      console.error('[BGRepo] Save error:', error);
      return { ok: false, status: 500, error: error.message || 'Network error' };
    }
  }
}