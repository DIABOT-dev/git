import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 300000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 60);

const X_APP_KEY_ALLOWLIST = (process.env.X_APP_KEY_ALLOWLIST || "PLEASE_SET").split(",");

const rateLimitMap = new Map<string, { count: number, reset: number }>();

function checkRateLimit(token: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(token);
  if (!entry || entry.reset < now) {
    rateLimitMap.set(token, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count < RATE_LIMIT_MAX) {
    entry.count += 1;
    return true;
  }
  return false;
}

// Only protect /api/log/* and /api/chart/*
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/log/") || pathname.startsWith("/api/chart/")) {
    // X-App-Key bypass
    const appKey = req.headers.get("x-app-key");
    if (appKey && X_APP_KEY_ALLOWLIST.includes(appKey)) {
      if (!checkRateLimit(appKey)) {
        return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
      }
      return NextResponse.next();
    }
    // Session required
    const sess = req.cookies.get(process.env.SESSION_COOKIE_NAME || "diabot_sess");
    if (!sess) {
      return NextResponse.json({ ok: false, error: "Auth required" }, { status: 401 });
    }
    // Rate limit by IP
    const ip = req.ip || req.headers.get("x-forwarded-for") || "";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: "Rate limit exceeded" }, { status: 429 });
    }
    return NextResponse.next();
  }
  // Allow /api/qa/selftest and /api/auth/*
  if (pathname.startsWith("/api/qa/selftest") || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }
  // Default: allow
  return NextResponse.next();
}