// Domain types matching Supabase schema

export type Sex = 'male' | 'female' | 'other';
export type Goal = 'lose_weight' | 'build_muscle' | 'stabilize_glucose';
export type GlucoseTag = 'fasting' | 'before_meal' | 'after_meal' | 'bedtime' | 'random';
export type InsulinType = 'bolus' | 'basal' | 'mixed' | 'correction';
export type DrinkKind = 'water' | 'tea' | 'coffee' | 'milk' | 'other';

export interface Profile {
  id: string;
  email?: string;
  phone?: string;
  dob?: string; // ISO date
  sex?: Sex;
  height_cm?: number;
  weight_kg?: number;
  waist_cm?: number;
  goal?: Goal;
  conditions?: Record<string, any>;
  prefs?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface GlucoseLog {
  id: string;
  user_id: string;
  value_mgdl: number;
  tag?: GlucoseTag;
  taken_at: string; // ISO datetime
  created_at: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  items: any[]; // JSON array of food items
  carbs_g?: number;
  calories_kcal?: number;
  taken_at: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  kind: DrinkKind;
  taken_at: string;
  created_at: string;
}

export interface InsulinLog {
  id: string;
  user_id: string;
  dose_units: number;
  type?: InsulinType;
  taken_at: string;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_kg: number;
  taken_at: string;
  created_at: string;
}

export interface BpLog {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  pulse?: number;
  taken_at: string;
  created_at: string;
}

export interface MetricDay {
  user_id: string;
  day: string; // ISO date
  metric: string;
  value: Record<string, any>;
  updated_at: string;
}

export interface MetricWeek {
  user_id: string;
  week: number; // YYYYWW format
  metric: string;
  value: Record<string, any>;
  updated_at: string;
}