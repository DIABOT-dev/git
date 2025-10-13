import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query } from '@/lib/db_client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

const profileIdSchema = z.string().uuid()

export async function GET(request: NextRequest) {
  // 1) Header APP_KEY
  const expected = process.env.APP_KEY
  if (expected && request.headers.get('x-app-key') !== expected) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  // 2) Read & validate profile_id
  const pidRaw = request.nextUrl.searchParams.get('profile_id') ?? ''
  const pidParsed = profileIdSchema.safeParse(pidRaw)
  if (!pidParsed.success) {
    return NextResponse.json({ error: 'invalid_profile_id' }, { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
  const pid = pidParsed.data

  // 3) Allowlist MVP
  const allow = new Set(
    (process.env.PROFILE_ID_ALLOWLIST || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
  )
  if (allow.size === 0) allow.add('9c913921-9fc6-41cc-a45f-ea05a0f34f2a')
  if (!allow.has(pid)) {
    return NextResponse.json({ ok: false, error: 'forbidden_profile' }, { status: 403 })
  }

  // 4) Query 7 ngày
  const result = await query<{ day: Date; avg_bg: number | null }>(
    `
    SELECT
      date_trunc('day', ts)::date AS day,
      AVG(value)::float AS avg_bg
    FROM bg_logs
    WHERE profile_id = $1 AND ts >= now() - interval '7 days'
    GROUP BY 1
    ORDER BY 1 ASC
    `,
    [pid],
  )

  const days = result.rows.map(row => ({
    day: row.day instanceof Date ? row.day.toISOString().slice(0, 10) : String(row.day),
    avg_bg: row.avg_bg == null ? null : Number(row.avg_bg),
  }))

  return NextResponse.json({ ok: true, days })
}
