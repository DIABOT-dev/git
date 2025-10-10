import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { query } from "@/lib/db_client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

const BodySchema = z.object({
  profile_id: z.string().uuid(),
  value: z.number(),
  unit: z.string().min(1),
  ts: z.string().datetime({ offset: true }),
  context: z.string().optional(),
  note: z.string().optional()
});

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_body" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const parsed = BodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const { profile_id, value, unit, ts, context, note } = parsed.data;
  const timestamp = new Date(ts);

  if (Number.isNaN(timestamp.getTime())) {
    return NextResponse.json(
      { error: "invalid_body" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const result = await query<{ id: string }>(
      `
        INSERT INTO bg_logs (id, profile_id, value, unit, context, ts, note)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)
        RETURNING id;
      `,
      [profile_id, value, unit, context ?? null, timestamp.toISOString(), note ?? null]
    );

    const id = result.rows[0]?.id;

    if (!id) {
      console.error("[api/log/bg] missing id from insert result", result.rows);

      return NextResponse.json(
        { error: "db_error" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" }
        }
      );
    }

    return NextResponse.json(
      { id },
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error("[api/log/bg]", err);

    return NextResponse.json(
      { error: "db_error" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
