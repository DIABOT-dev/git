export interface BloodGlucose {
  id?: string;
  userId: string;
  mgdl: number;
  context?: "fasting" | "pre" | "post" | "random";
  at: string;
}
