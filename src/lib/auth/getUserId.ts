import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/local";

export async function getUserId(req?: NextRequest): Promise<string | null> {
  if (process.env.AUTH_DEV_MODE === "true") {
    return req?.headers.get("x-debug-user-id") ?? null;
  }

  try {
    const cookieStore = cookies();
    const token = cookieStore.get(process.env.SESSION_COOKIE_NAME || 'diabot_session')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    return payload?.userId ?? null;
  } catch (error) {
    console.error("Error getting user from JWT:", error);
    return null;
  }
}

/** Require authentication - throw if not authenticated */
export async function requireAuth(req?: NextRequest): Promise<string> {
  const userId = await getUserId(req);
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}