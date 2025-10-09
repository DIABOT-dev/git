import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/getUserId";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

const bodySchema = z.object({
  ml: z.number().int().positive().optional(),
  amount_ml: z.number().int().positive().optional(),
  kind: z.enum(["water","tea","coffee","milk","other"]).default("water"),
  taken_at: z.string().datetime().optional(),
}).refine(
  (data) => data.ml !== undefined || data.amount_ml !== undefined,
  {
    message: "At least one of 'ml' or 'amount_ml' must be provided",
    path: ["ml", "amount_ml"],
  }
);

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const raw = await req.json();
    const parsed = bodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const waterAmount = parsed.data.ml ?? parsed.data.amount_ml;
    if (waterAmount === undefined) {
      return NextResponse.json({ ok: false, error: "Missing 'ml' or 'amount_ml' in request body" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const taken = parsed.data.taken_at ?? now;

    const sb = supabaseAdmin; // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb
      .from("water_logs")
      .insert({
        user_id: userId,
        ml: waterAmount, // Chèn vào cột 'ml'
        amount_ml: waterAmount, // Chèn vào cột 'amount_ml'
        kind: parsed.data.kind,
        taken_at: taken,
      })
      .select()
      .single();

    if (error) {
      console.error("Database insert error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (e: any) {
    if (e.message === "Authentication required") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/log/water:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
