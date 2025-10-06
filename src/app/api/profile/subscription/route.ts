// src/app/api/profile/subscription/route.ts
import { NextRequest, NextResponse } from "next/server"; // Thêm NextRequest vào đây
import { requireAuth } from "@/lib/auth/getUserId";

// Mock subscription data
const MOCK_SUBSCRIPTIONS = new Map<string, any>();

export async function GET(request: NextRequest) { // Thay Request bằng NextRequest
  try {
    const userId = await requireAuth(request);

    // Get or create mock subscription
    let subscription = MOCK_SUBSCRIPTIONS.get(userId);
    if (!subscription) {
      subscription = {
        status: "trial",
        plan: "free",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        features: {
          ai_agent: true,
          charts: true,
          export: true,
          reminders: true,
          family_sharing: false,
          premium_insights: false
        },
        usage: {
          ai_requests_today: 5,
          ai_requests_limit: 50,
          storage_used_mb: 12.5,
          storage_limit_mb: 100
        }
      };
      MOCK_SUBSCRIPTIONS.set(userId, subscription);
    }

    return NextResponse.json({
      ok: true,
      data: subscription
    });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/profile/subscription GET:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) { // Thay Request bằng NextRequest
  try {
    const userId = await requireAuth(request);

    const body = await request.json();
    const { action, plan } = body;

    let subscription = MOCK_SUBSCRIPTIONS.get(userId) || {};

    if (action === "upgrade") {
      subscription = {
        ...subscription,
        status: "active",
        plan: plan || "premium",
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        features: {
          ...subscription.features,
          family_sharing: true,
          premium_insights: true
        }
      };
    } else if (action === "cancel") {
      subscription = {
        ...subscription,
        status: "cancelled",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days grace
      };
    }

    MOCK_SUBSCRIPTIONS.set(userId, subscription);

    return NextResponse.json({
      ok: true,
      data: subscription
    });
  } catch (error: any) {
    if (error.message === "Authentication required") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error in /api/profile/subscription POST:", error);
    return NextResponse.json({ error: error.message || "unknown" }, { status: 500 });
  }
}
