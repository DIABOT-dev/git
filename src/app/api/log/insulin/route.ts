import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/getUserId";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const bodySchema = z.object({
  dose_units: z.number().min(0.1).max(100),
  type: z.enum(["bolus","basal","mixed","correction"]).optional(),
  taken_at: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const json = await req.json().catch(() => null);
    const parse = bodySchema.safeParse(json);
    if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

    const { dose_units, type, taken_at } = parse.data;
    const taken = taken_at ? new Date(taken_at).toISOString() : new Date().toISOString();

    const sb = supabaseAdmin(); // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb
      .from("insulin_logs")
      .insert({ user_id: userId, dose_units, type, taken_at: taken })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/log/insulin:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}
