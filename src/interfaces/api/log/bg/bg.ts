import { NextResponse } from "next/server";
import { LogBG } from "@/application/usecases/LogBG";
import { GlucoseLogsRepo } from "@/infrastructure/repositories/GlucoseLogsRepo";
import { LogBGInput } from "@/interfaces/api/validators";
import { requireAuth } from "@/lib/auth/getUserId";

export async function handlePost(req: Request) {
  try {
    const userId = await requireAuth();
    const body = await req.json();
    const input = LogBGInput.parse(body);
    
    const uc = new LogBG(new GlucoseLogsRepo());
    const result = await uc.execute(userId, input);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error logging BG:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to log blood glucose' },
      { status: error.message?.includes('Authentication') ? 401 : 400 }
    );
  }
}
