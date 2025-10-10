import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const token = process.env.DIABOT_ADMIN_TOKEN
  const got = req.headers.get('x-admin-token')
  if (!token || got !== token) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }
  return NextResponse.json({ ok: true, msg: 'db-inspect stub' }, { status: 200 })
}
