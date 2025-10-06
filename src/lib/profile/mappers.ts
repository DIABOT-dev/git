// Profile data mappers for transforming between DB and UI formats

export type Goals = {
  target_bg_min?: number;
  target_bg_max?: number;
  target_weight?: number;
  daily_water_ml?: number;
};

export type PersonaPrefs = {
  tone?: string;
  motivation_style?: string;
  reminder_frequency?: string;
};

export function mapProfileFromDB(profile: any) {
  return {
    id: profile.id,
    email: profile.email,
    phone: profile.phone,
    dob: profile.dob,
    sex: profile.sex,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    waist_cm: profile.waist_cm,
    goal: profile.goal,
    conditions: profile.conditions || [],
    prefs: profile.prefs || {},
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export function mapProfileToDB(profile: any) {
  return {
    email: profile.email,
    phone: profile.phone,
    dob: profile.dob,
    sex: profile.sex,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    waist_cm: profile.waist_cm,
    goal: profile.goal,
    conditions: profile.conditions || [],
    prefs: profile.prefs || {},
  };
}

export function mergeConditions(existing: string[], updates: string[]): string[] {
  const merged = new Set([...existing, ...updates]);
  return Array.from(merged);
}

export function toGoalsPayload(goals: Goals) {
  return {
    target_bg_min: goals.target_bg_min,
    target_bg_max: goals.target_bg_max,
    target_weight: goals.target_weight,
    daily_water_ml: goals.daily_water_ml,
  };
}

export function toPersonalityPayload(prefs: PersonaPrefs) {
  return {
    tone: prefs.tone,
    motivation_style: prefs.motivation_style,
    reminder_frequency: prefs.reminder_frequency,
  };
}