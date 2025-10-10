import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { query } from "@/lib/db_client";

const profileIdSchema = z.string().uuid();

export async function GET(request: NextRequest) {
  const profileIdParam = request.nextUrl.searchParams.get("profile_id");
  const validatedProfileId = profileIdSchema.safeParse(profileIdParam);

  if (!validatedProfileId.success) {
    return NextResponse.json(
      { error: "invalid_profile_id" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    const result = await query<{ day: string | Date; avg_bg: number | null }>(
      `
        SELECT
          date_trunc('day', ts)::date AS day,
          AVG(value)::float AS avg_bg
        FROM bg_logs
        WHERE profile_id = $1 AND ts >= now() - interval '7 days'
        GROUP BY 1
        ORDER BY 1 ASC;
      `,
      [validatedProfileId.data]
    );

    const data = result.rows.map(row => ({
      day:
        row.day instanceof Date
          ? row.day.toISOString().slice(0, 10)
          : row.day,
      avg_bg:
        row.avg_bg === null || row.avg_bg === undefined
          ? null
          : Number(row.avg_bg)
    }));

    return NextResponse.json(data, {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[api/chart/7d]", err);

    return NextResponse.json(
      { error: "db_error" },
      {
        status: 400,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
