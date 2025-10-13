import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const expected = process.env.APP_KEY
  // Dev/CI: nếu chưa đặt APP_KEY thì cho qua (prod phải đặt)
  if (!expected) return NextResponse.next()

  const key = req.headers.get('x-app-key')
  if (key !== expected) return new NextResponse('Forbidden', { status: 403 })
  return NextResponse.next()
}


// Chỉ chặn các API MVP
export const config = { matcher: ['/api/log/:path*', '/api/chart/:path*'] }
