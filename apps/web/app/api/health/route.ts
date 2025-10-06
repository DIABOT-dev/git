import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/url";

export async function GET(req: Request) {
  const base = getBaseUrl(req);
  return NextResponse.json(
    { ok: true, status: "healthy", base },
    { headers: { "Cache-Control": "no-store" } }
  );
}
