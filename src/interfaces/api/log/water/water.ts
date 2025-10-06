import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/db";

const WaterInput = z.object({
  userId: z.string().uuid(),
  ml: z.number().int().positive(),
  at: z.string().datetime(),
});

export async function handlePost(req: Request) {
  const body = await req.json();
  const input = WaterInput.parse(body);

  const sb = supabaseAdmin;
  const { data, error } = await sb
    .from("water_logs")
    .insert({
      user_id: input.userId,
      ml: input.ml,
      at: input.at,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
