// src/lib/supabase/server.ts
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr'; // Import type CookieOptions

export function getServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { // Thay đổi sang cú pháp phương thức
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) { // Thay đổi sang cú pháp phương thức và thêm CookieOptions
          cookieStore.set(name, value, options); // Sửa cách truyền tham số
        },
        remove(name: string, options: CookieOptions) { // Thay đổi sang cú pháp phương thức và thêm CookieOptions
          cookieStore.set(name, '', options); // Sửa cách truyền tham số
        },
      },
    }
  );
}
