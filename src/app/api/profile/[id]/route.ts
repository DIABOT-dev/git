import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/getUserId";

export async function GET(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const uid = await requireAuth(req);
    if (uid !== params.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const sb = supabaseAdmin(); // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb.from("profiles").select("*").eq("id", uid).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/profile/[id] GET:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string }}) {
  try {
    const uid = await requireAuth(req);
    if (uid !== params.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const payload = await req.json();
    const sb = supabaseAdmin(); // Gọi supabaseAdmin như một hàm
    const { data, error } = await sb.from("profiles").update(payload).eq("id", uid).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/profile/[id] PUT:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}
