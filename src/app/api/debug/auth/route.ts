import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/lib/auth/getUserId";
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;


export async function GET(req: NextRequest) {
  const uid = await getUserId(req);
  return NextResponse.json({
    devMode: process.env.AUTH_DEV_MODE === "true",
    headerUid: req.headers.get("x-debug-user-id") || null,
    resolvedUid: uid,
  }, { status: 200 });
}