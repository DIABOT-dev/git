import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/getUserId";
import { ProfilesRepo } from "@/infrastructure/repositories/ProfilesRepo";
import { z } from "zod";

// Define a schema for the incoming setupData
const setupDataSchema = z.object({
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  conditions: z.array(z.string()).optional(),
  goals: z.object({
    primaryGoal: z.string(),
    targetWeight: z.number(),
    targetHbA1c: z.number(),
    dailySteps: z.number(),
    waterCups: z.number(),
  }).optional(),
  preferences: z.object({
    reminderTimes: z.array(z.string()).optional(),
    shareWithFamily: z.boolean().optional(),
    notifications: z.boolean().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);
    const repo = new ProfilesRepo();
    const body = await req.json();
    const setupData = setupDataSchema.parse(body.setupData); // Validate incoming setupData

    // Update the user's profile with the setup data and mark onboarding as complete
    const updatedProfile = await repo.update(userId, {
      dob: setupData.birthDate,
      sex: setupData.gender?.toLowerCase() as any, // Assuming gender maps to 'sex' enum
      height_cm: setupData.height,
      weight_kg: setupData.weight,
      conditions: setupData.conditions,
      prefs: {
        onboarded: true,
        goals: setupData.goals,
        preferences: setupData.preferences,
      },
    });

    return NextResponse.json({ ok: true, data: updatedProfile }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error completing onboarding:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
