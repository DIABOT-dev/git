export type WaterKind = "water" | "tea" | "other";

export interface SaveWaterLogDTO {
  amount_ml: number; // >0
  kind?: WaterKind;  // optional
  taken_at: string;  // ISOString, <= now
}
