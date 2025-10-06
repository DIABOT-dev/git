export type BPLog = {
  systolic: number;
  diastolic: number;
  pulse?: number;     // tùy chọn theo schema
  taken_at: string;   // ISO
};
