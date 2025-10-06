export type InsulinType = "am" | "pm";
export type InsulinContext = "before" | "after2h" | "random";

export interface SaveInsulinLogDTO {
  dose: number;               // > 0
  type: InsulinType;          // 'am' | 'pm'
  context: InsulinContext;    // 'before' | 'after2h' | 'random'
  taken_at: string;           // ISO 8601
}

export interface SaveResult {
  ok: boolean;
  status: number;             // 201 | 4xx | 5xx
  id?: string;
  error?: string;
}
