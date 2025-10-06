import { NextResponse } from "next/server";
import { handleAiGateway } from "@/packages/ai";

export async function GET() {
  return NextResponse.json({ ok: true, status: "healthy" }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  return handleAiGateway(req);
}
