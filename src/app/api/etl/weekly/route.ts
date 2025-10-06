import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ 
    ok: true, 
    service: "etl-weekly",
    status: "ready",
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}

export async function POST() {
  try {
    // ETL weekly stub - không đụng OLAP/SQL theo yêu cầu
    return NextResponse.json({ 
      ok: true, 
      job: "etl-weekly-triggered",
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      ok: false, 
      error: error.message || "ETL processing failed" 
    }, { status: 500 });
  }
}