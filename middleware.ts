import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Các path public (không yêu cầu đăng nhập)
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/callback',
  '/auth/forgot-password',
  '/privacy',
  '/terms',
  '/medical-disclaimer',
  '/about',
  '/api/qa/selftest',
  '/healthz',
]

const STATIC_PREFIXES = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/icon.png',
  '/apple-icon.png',
  '/assets',
]

// Kiểm tra route public
function isPublic(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (STATIC_PREFIXES.some((p) => pathname.startsWith(p))) return true
  return false
}

// Cho phép bypass khi chạy local dev
function isDevBypass(req: NextRequest) {
  const bypass = process.env.AUTH_DEV_MODE === 'true'
  if (!bypass) return false
  const host = req.headers.get('host') || ''
  return host.includes('localhost') || host.startsWith('127.0.0.1')
}

export function middleware(req: NextRequest) {
  if (isPublic(req) || isDevBypass(req)) {
    return NextResponse.next()
  }

  const sessionCookie = process.env.SESSION_COOKIE_NAME || 'diabot_session'
  const hasAccess = req.cookies.has(sessionCookie)

  if (!hasAccess) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(url, { status: 302 })
  }

  return NextResponse.next()
}

// Config matcher: exclude static assets, images, and public files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|icon.png|apple-icon.png|assets|images|public|static|api/qa/selftest|healthz).*)',
  ],
}
