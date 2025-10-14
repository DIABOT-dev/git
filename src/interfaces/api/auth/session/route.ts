import { NextResponse } from "next/server";
import { getSession } from "@/infrastructure/auth/session";

export async function GET(req: Request) {
  const session = getSession(req);
  if (session?.profile_id) {
    return NextResponse.json({ authenticated: true, profile_id: session.profile_id }, { status: 200 });
  }
  return NextResponse.json({ authenticated: false }, { status: 200 });
}