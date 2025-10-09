import { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}

type UseAuthState = {
  user: User | null;
  loading: boolean;
  error?: string;
};

export function useAuth(): UseAuthState {
  const [state, setState] = useState<UseAuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (!mounted) return;

        if (response.ok) {
          const data = await response.json();
          setState({
            user: data.user,
            loading: false,
          });
        } else {
          setState({
            user: null,
            loading: false,
          });
        }
      } catch (error) {
        if (!mounted) return;
        setState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication check failed',
        });
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return state;
}
