import type { SaveWaterLogDTO } from "./types";

export function validateWater(dto: SaveWaterLogDTO) {
  const errors: string[] = [];
  if (!Number.isFinite(dto.amount_ml) || dto.amount_ml <= 0) errors.push("amount_ml>0");
  const t = Date.parse(dto.taken_at);
  if (Number.isNaN(t)) errors.push("taken_at:invalid");
  else if (t > Date.now()) errors.push("taken_at<=now");
  return { ok: errors.length === 0, errors };
}
