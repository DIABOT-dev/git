import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.delete(process.env.SESSION_COOKIE_NAME || 'diabot_session');

  return response;
}
