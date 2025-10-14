import { NextResponse } from "next/server";
import { bpLogSchema } from "@/domain/schemas";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const parsed = bpLogSchema.parse(data);
    return NextResponse.json({ ok: true, id: "mock-bp-id", ...parsed }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || "Invalid payload" }, { status: 400 });
  }
}