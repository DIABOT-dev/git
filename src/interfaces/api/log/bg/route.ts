import { NextResponse } from "next/server";
import { bgLogSchema } from "@/domain/schemas";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = bgLogSchema.parse(data);
    // Stub DB insert, return id: "mock-bg-id"
    return NextResponse.json({ ok: true, id: "mock-bg-id", ...parsed }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Invalid payload" }, { status: 400 });
  }
}