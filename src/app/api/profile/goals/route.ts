import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/getUserId";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { ProfileGoalsRepo } from "@/modules/profile/ProfileGoalsRepo";

const goalsSchema = z.object({
  primaryGoal: z.string(),
  targetWeight: z.number().min(1).max(300),
  targetHbA1c: z.number().min(1).max(20),
  dailySteps: z.number().min(0),
  waterCups: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const json = await req.json().catch(() => null);
    const parse = goalsSchema.safeParse(json);
    if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

    const repo = new ProfileGoalsRepo();
    // Instead of calling repo.saveGoals directly, update the profile's prefs
    const { data, error } = await supabaseAdmin // Gọi supabaseAdmin như một hàm
      .from('profiles')
      .update({ prefs: { goals: parse.data } }) // Store goals within prefs
      .eq('id', userId)
      .select('prefs')
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, data: data.prefs?.goals || parse.data }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error saving goals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    // Fetch goals from the profile's prefs
    const { data, error } = await supabaseAdmin // Gọi supabaseAdmin như một hàm
      .from('profiles')
      .select('prefs')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: "Goals not found" }, { status: 404 });
      throw error;
    }

    const goals = data.prefs?.goals;
    if (!goals) return NextResponse.json({ error: "Goals not found" }, { status: 404 }); // If prefs.goals is null/undefined
    return NextResponse.json({ ok: true, data: goals }, { status: 200 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching goals:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
