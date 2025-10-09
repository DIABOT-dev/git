import { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** DEV: chỉ lấy từ header; PROD: mới đọc Supabase (import động) */
export async function getUserId(req?: NextRequest): Promise<string | null> {
  if (process.env.AUTH_DEV_MODE === "true") {
    return req?.headers.get("x-debug-user-id") ?? null;
  }
  
  // Production mode: Get user ID from Supabase session
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', options);
          },
        },
      }
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id ?? null;
  } catch (error) {
    console.error("Error getting user session:", error);
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