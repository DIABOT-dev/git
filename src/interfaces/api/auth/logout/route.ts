import { NextResponse } from "next/server";
import { clearSession } from "@/infrastructure/auth/session";

export async function POST() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  clearSession(res);
  return res;
}