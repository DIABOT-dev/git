import { z } from "zod";

// Common validators
const isoDatetime = z.string().datetime();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

// Glucose logging
export const LogBGInput = z.object({
  value_mgdl: z.number().int().min(20).max(600),
  tag: z.enum(['fasting', 'before_meal', 'after_meal', 'bedtime', 'random']).optional(),
  taken_at: isoDatetime
});
export type LogBGInput = z.infer<typeof LogBGInput>;

// Meal logging
export const LogMealInput = z.object({
  items: z.array(z.any()).min(1),
  carbs_g: z.number().min(0).max(500).optional(),
  calories_kcal: z.number().min(0).max(5000).optional(),
  taken_at: isoDatetime
});
export type LogMealInput = z.infer<typeof LogMealInput>;

// Water logging
export const LogWaterInput = z.object({
  amount_ml: z.number().int().min(1).max(5000),
  kind: z.enum(['water', 'tea', 'coffee', 'milk', 'other']).default('water'),
  taken_at: isoDatetime
});
export type LogWaterInput = z.infer<typeof LogWaterInput>;

// Insulin logging
export const LogInsulinInput = z.object({
  dose_units: z.number().min(0.1).max(100),
  type: z.enum(['bolus', 'basal', 'mixed', 'correction']).optional(),
  taken_at: isoDatetime
});
export type LogInsulinInput = z.infer<typeof LogInsulinInput>;

// Weight logging
export const LogWeightInput = z.object({
  weight_kg: z.number().min(20).max(300),
  taken_at: isoDatetime
});
export type LogWeightInput = z.infer<typeof LogWeightInput>;

// Blood pressure logging
export const LogBPInput = z.object({
  systolic: z.number().int().min(50).max(250),
  diastolic: z.number().int().min(30).max(150),
  pulse: z.number().int().min(30).max(200).optional(),
  taken_at: isoDatetime
});
export type LogBPInput = z.infer<typeof LogBPInput>;

// Chart queries
export const ChartQueryInput = z.object({
  metric: z.string().min(1),
  range: z.enum(['7d', '30d']).default('7d'),
  userId: z.string().uuid().optional()
});
export type ChartQueryInput = z.infer<typeof ChartQueryInput>;

// ETL queries
export const ETLDailyInput = z.object({
  day: isoDate.optional(),
  userId: z.string().uuid().optional()
});
export type ETLDailyInput = z.infer<typeof ETLDailyInput>;