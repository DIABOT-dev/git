// Profile data mappers for transforming between DB and UI formats

export type Goals = {
  primaryGoal?: string;
  targetWeight?: number;
  targetHbA1c?: number;
  dailySteps?: number;
  waterCups?: number;
};

export type PersonaPrefs = {
  ai_persona?: "friend" | "coach" | "advisor";
  guidance_level?: "minimal" | "detailed";
  low_ask_mode?: boolean;
};

export type ProfilePrefs = PersonaPrefs & {
  goals?: Goals;
  [key: string]: unknown;
};

export type HealthConditions = Record<string, boolean | string | undefined>;

const personaDefaults: Required<PersonaPrefs> = {
  ai_persona: "friend",
  guidance_level: "minimal",
  low_ask_mode: false,
};

type RawProfile = {
  id: string;
  email?: string | null;
  phone?: string | null;
  dob?: string | null;
  sex?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  waist_cm?: number | null;
  goal?: string | null;
  conditions?: HealthConditions | null;
  prefs?: unknown;
  created_at?: string;
  updated_at?: string;
};

type ProfileInput = Partial<RawProfile> & {
  goals?: unknown;
  prefs?: unknown;
};

function toOptionalString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function sanitizeGoals(raw: unknown): Goals | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const value = raw as Record<string, unknown>;
  const goals: Goals = {
    primaryGoal: toOptionalString(value.primaryGoal),
    targetWeight: toOptionalNumber(value.targetWeight),
    targetHbA1c: toOptionalNumber(value.targetHbA1c),
    dailySteps: toOptionalNumber(value.dailySteps),
    waterCups: toOptionalNumber(value.waterCups),
  };

  const hasAny = Object.values(goals).some((item) => item !== undefined);
  return hasAny ? goals : undefined;
}

function sanitizePersonaPrefs(raw: unknown): PersonaPrefs {
  if (!raw || typeof raw !== "object") {
    return { ...personaDefaults };
  }

  const value = raw as Record<string, unknown>;
  const prefs: PersonaPrefs = {};

  if (value.ai_persona === "friend" || value.ai_persona === "coach" || value.ai_persona === "advisor") {
    prefs.ai_persona = value.ai_persona;
  }

  if (value.guidance_level === "minimal" || value.guidance_level === "detailed") {
    prefs.guidance_level = value.guidance_level;
  }

  if (typeof value.low_ask_mode === "boolean") {
    prefs.low_ask_mode = value.low_ask_mode;
  }

  return { ...personaDefaults, ...prefs };
}

export function mapProfileFromDB(profile: RawProfile) {
  const safeGoals = sanitizeGoals((profile.prefs as Record<string, unknown> | undefined)?.goals);
  const personaPrefs = sanitizePersonaPrefs(profile.prefs);
  const prefs: ProfilePrefs = {
    ...personaPrefs,
    ...(safeGoals ? { goals: safeGoals } : {}),
  };

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
    conditions: (profile.conditions ?? {}) as HealthConditions,
    prefs,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export function mapProfileToDB(profile: ProfileInput) {
  const safeGoals = sanitizeGoals(
    (profile.prefs as Record<string, unknown> | undefined)?.goals ?? profile.goals,
  );
  const personaPrefs = sanitizePersonaPrefs(profile.prefs);

  const prefs: ProfilePrefs = {
    ...personaPrefs,
    ...(safeGoals ? { goals: safeGoals } : {}),
  };

  return {
    email: profile.email,
    phone: profile.phone,
    dob: profile.dob,
    sex: profile.sex,
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    waist_cm: profile.waist_cm,
    goal: profile.goal,
    conditions: (profile.conditions ?? {}) as HealthConditions,
    prefs,
  };
}

export function mergeConditions(
  existing: HealthConditions | null | undefined,
  updates: HealthConditions | null | undefined,
): HealthConditions {
  return {
    ...(existing ?? {}),
    ...(updates ?? {}),
  };
}

export function toGoalsPayload(goals: Goals) {
  return sanitizeGoals(goals) ?? {};
}

export function toPersonalityPayload(prefs: PersonaPrefs) {
  const sanitized = sanitizePersonaPrefs(prefs);
  return {
    ai_persona: sanitized.ai_persona,
    guidance_level: sanitized.guidance_level,
    low_ask_mode: sanitized.low_ask_mode,
  };
}