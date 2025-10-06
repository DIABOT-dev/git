// apps/web/app/api/qa/selftest/route.ts
import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/url"; // Đã sửa

export async function GET(req: Request) {
  return NextResponse.json(
    { ok: true, base: getBaseUrl(req), selftest: "ready" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
