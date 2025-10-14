import { NextResponse } from "next/server";
import { setSession } from "@/infrastructure/auth/session";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) throw new Error("Missing email or password");
    // Mock user - real DB would lookup here
    const user_id = "mock-user-id";
    const profile_id = "mock-profile-id";
    const res = NextResponse.json({ ok: true }, { status: 200 });
    setSession(res, { user_id, profile_id });
    return res;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Invalid login" }, { status: 400 });
  }
}