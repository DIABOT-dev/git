import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/getUserId";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type Ctx = { params?: { metric?: string } };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    await requireAuth(req);

  const metric = ctx?.params?.metric; // <--- SỬ DỤNG OPTIONAL CHAINING Ở ĐÂY để truy cập an toàn
  const ALLOWED = new Set(["bg","bp","weight","water","insulin"]);

  // Special handling for meal metric - redirect to dedicated endpoint
  if (metric === "meal") {
    const url = new URL(req.url);
    const mealUrl = url.origin + "/api/charts/meal" + url.search;
    return NextResponse.redirect(mealUrl);
  }

  if (!metric || !ALLOWED.has(metric)) {
    return NextResponse.json({ ok:false, error:"invalid metric" }, { status:400 });
  }
  return NextResponse.json({ ok:true, metric, data:[] }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/charts/[metric]:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}

