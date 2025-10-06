import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin"; // Đã sửa import
import { requireAuth } from "@/lib/auth/getUserId";

const bodySchema = z.object({
  weight_kg: z.number().min(20).max(300),
  taken_at: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth(req);

    const json = await req.json().catch(() => null);
    const parse = bodySchema.safeParse(json);
    if (!parse.success) return NextResponse.json({ error: parse.error.flatten() }, { status: 400 });

    const { weight_kg, taken_at } = parse.data;
    const taken = taken_at ? new Date(taken_at).toISOString() : new Date().toISOString();

    const sb = supabaseAdmin(); // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb
      .from("weight_logs")
      .insert({ user_id: userId, weight_kg, taken_at: taken })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/log/weight:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}
