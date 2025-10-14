import { z } from "zod";

// Blood Glucose Log
export const bgLogSchema = z.object({
  value: z.number().min(10).max(1000),
  unit: z.enum(["mg/dL", "mmol/L"]),
  context: z.string().optional(),
  ts: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO timestamp" }),
  note: z.string().max(256).optional(),
});
export type BgLog = z.infer<typeof bgLogSchema>;

// Water Log
export const waterLogSchema = z.object({
  ml: z.number().min(0).max(10000),
  ts: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO timestamp" }),
});
export type WaterLog = z.infer<typeof waterLogSchema>;

// Weight Log
export const weightLogSchema = z.object({
  kg: z.number().min(20).max(300),
  ts: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO timestamp" }),
});
export type WeightLog = z.infer<typeof weightLogSchema>;

// Blood Pressure Log
export const bpLogSchema = z.object({
  systolic: z.number().min(60).max(260),
  diastolic: z.number().min(40).max(160),
  pulse: z.number().min(30).max(220).optional(),
  ts: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO timestamp" }),
});
export type BPLog = z.infer<typeof bpLogSchema>;

// Insulin Log
export const insulinLogSchema = z.object({
  dose: z.number().min(0).max(200),
  type: z.enum(["rapid", "basal"]),
  context: z.string().optional(),
  ts: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO timestamp" }),
  note: z.string().max(256).optional(),
});
export type InsulinLog = z.infer<typeof insulinLogSchema>;

// Meal Log
export const mealLogSchema = z.object({
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  text: z.string().min(1).max(256),
  portion: z.string().max(64).optional(),
  ts: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO timestamp" }),
  photo_url: z.string().url().max(256).optional(),
});
export type MealLog = z.infer<typeof mealLogSchema>;