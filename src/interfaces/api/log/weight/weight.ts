import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/db";

const WeightInput = z.object({
  userId: z.string().uuid(),
  kg: z.number().positive(),
  at: z.string().datetime(),
});

export async function handlePost(req: Request) {
  const body = await req.json();
  const input = WeightInput.parse(body);

  const sb = supabaseAdmin;
  const { data, error } = await sb
    .from("weight_logs")
    .insert({
      user_id: input.userId,
      kg: input.kg,
      at: input.at,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
