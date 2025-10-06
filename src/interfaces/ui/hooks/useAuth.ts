import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Session, User } from "@supabase/supabase-js";

type UseAuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error?: string;
};

export function useAuth(): UseAuthState {
  const supabase = createClientComponentClient();
  const [state, setState] = useState<UseAuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setState({
        user: data?.session?.user ?? null,
        session: data?.session ?? null,
        loading: false,
        error: error?.message,
      });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false,
        error: undefined,
      });
    });

    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [supabase]);

  return state;
}