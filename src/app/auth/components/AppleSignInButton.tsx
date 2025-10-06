'use client';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AppleSignInButton() {
  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });
  };
  return (
    <button onClick={signIn} className="px-4 py-2 rounded-2xl bg-black text-white">
       Sign in with Apple
    </button>
  );
}

