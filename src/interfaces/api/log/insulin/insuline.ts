import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/db";

const InsulinInput = z.object({
  userId: z.string().uuid(),
  units: z.number().positive(),
  insulinType: z.string().optional(), // ví dụ: basal/bolus
  at: z.string().datetime(),
});

export async function handlePost(req: Request) {
  const body = await req.json();
  const input = InsulinInput.parse(body);

  const sb = supabaseAdmin;
  const { data, error } = await sb
    .from("insulin_logs")
    .insert({
      user_id: input.userId,
      units: input.units,
      insulin_type: input.insulinType ?? null,
      at: input.at,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
