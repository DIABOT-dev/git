import { BPLog } from "./types"

export function validateBP(log: { taken_at: string | Date; systolic: number; diastolic: number }): string | null {
  const taken = typeof log.taken_at === "string" ? new Date(log.taken_at) : log.taken_at;
  if (taken > new Date()) return "Thời gian không hợp lệ";
  if (log.systolic <= 50) return "Systolic phải > 50"
  if (log.diastolic <= 30) return "Diastolic phải > 30"
  if (log.systolic <= log.diastolic) return "Systolic phải > Diastolic"
  return null
}
