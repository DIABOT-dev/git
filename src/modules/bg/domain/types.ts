// src/modules/bg/domain/types.ts
export type BGUnit = "mg/dL" | "mmol/L";
export type BGContext = "before" | "after2h" | "random";

export interface BGLogDTO {
  value: number;          // required, > 0
  unit: BGUnit;           // "mg/dL" | "mmol/L"
  context: BGContext;     // "before" | "after2h" | "random"
  taken_at: string;       // ISO 8601
  // profile_id optional: repo will resolve from session/user
  profile_id?: string;
}

export interface SaveBGLogDTO extends BGLogDTO {}

export interface SaveResult {
  ok: boolean;
  status: number; // 201 | 4xx | 5xx
  id?: string;
  error?: string;
}