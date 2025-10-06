export interface WeightLogDTO {
  weight_kg: number;
  taken_at: string; // ISO
}

export interface SaveResult {
  ok: boolean;
  status: number;
  id?: string;
  error?: string;
}