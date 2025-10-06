import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/db";

const BPInput = z.object({
  userId: z.string().uuid(),
  systolic: z.number().int().positive(),
  diastolic: z.number().int().positive(),
  pulse: z.number().int().optional(),
  at: z.string().datetime(),
});

export async function handlePost(req: Request) {
  const body = await req.json();
  const input = BPInput.parse(body);

  const sb = supabaseAdmin;
  const { data, error } = await sb
    .from("bp_logs")
    .insert({
      user_id: input.userId,
      systolic: input.systolic,
      diastolic: input.diastolic,
      pulse: input.pulse ?? null,
      at: input.at,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
