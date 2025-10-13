import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPool } from '@/lib/db_client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

const BodySchema = z.object({
  profile_id: z.string().uuid(),
  value: z.number(),
  unit: z.string().min(1),
  ts: z.string().datetime({ offset: true }),
  context: z.string().optional(),
  note: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // 1) Header APP_KEY (double-guard, phòng middleware bị bỏ qua)
  const expected = process.env.APP_KEY
  if (expected && request.headers.get('x-app-key') !== expected) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  // 2) Parse body
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
  const parsed = BodySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
  const { profile_id, value, unit, ts, context, note } = parsed.data

  // 3) Allowlist profile_id (MVP)
  const allow = new Set(
    (process.env.PROFILE_ID_ALLOWLIST || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
  )
  if (allow.size === 0) allow.add('9c913921-9fc6-41cc-a45f-ea05a0f34f2a')
  if (!allow.has(profile_id)) {
    return NextResponse.json({ ok: false, error: 'forbidden_profile' }, { status: 403 })
  }

  // 4) Ghi DB (khởi tạo pool TRONG handler)
  const db = getPool()
  const tsDate = new Date(ts)
  const res = await db.query<{ id: string }>(
    `INSERT INTO bg_logs (profile_id, value, unit, context, note, ts, created_at)
     VALUES ($1,$2,$3,$4,$5,$6, now())
     RETURNING id`,
    [profile_id, value, unit, context ?? null, note ?? null, tsDate.toISOString()],
  )

  return NextResponse.json({ ok: true, id: res.rows[0]?.id ?? null }, { status: 201 })
}
