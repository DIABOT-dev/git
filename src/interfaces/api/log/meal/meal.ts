import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/db";

const MealInput = z.object({
  userId: z.string().uuid(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  foodsText: z.string().min(1),
  portion: z.enum(["low", "medium", "high"]),
  at: z.string().datetime(),
});

export async function handlePost(req: Request) {
  const body = await req.json();
  const input = MealInput.parse(body);

  const sb = supabaseAdmin;
  const { data, error } = await sb
    .from("meal_logs")
    .insert({
      user_id: input.userId,
      meal_type: input.mealType,
      foods_text: input.foodsText,
      portion: input.portion,
      at: input.at,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
