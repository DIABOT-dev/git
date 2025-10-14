import { NextResponse } from "next/server";
import pkg from "../../../../../../package.json";

export async function GET() {
  const uptime_s = Math.floor(process.uptime());
  const timestamp = new Date().toISOString();
  return NextResponse.json({
    version: pkg.version || "unknown",
    uptime_s,
    timestamp,
  }, { status: 200 });
}