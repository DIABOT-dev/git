import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    service: "ai-demo",
    status: "healthy",
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({ 
      ok: true, 
      service: "ai-demo",
      received: body,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message || "Unknown error" 
    }, { status: 500 });
  }
}