import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginInput, RegisterInput } from '@cena/shared';
import { notificationsApi } from '@/features/notifications/api';
import { getPushTokenIfPermitted } from '@/lib/push';
import { logOutPurchases } from '@/lib/purchases';
import { tokenStore } from '@/lib/secureStore';
import { loginRequest, logoutRequest, meRequest, registerRequest } from './api';

type Status = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: Status;
  user: AuthUser | null;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-fetch the current user (e.g. after finishing onboarding). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  // Bootstrap the session from secure storage on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const tokens = await tokenStore.get();
      if (!tokens) {
        if (!cancelled) setStatus('unauthenticated');
        return;
      }
      try {
        const me = await meRequest();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        await tokenStore.clear();
        if (!cancelled) setStatus('unauthenticated');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (input: LoginInput) => {
    const res = await loginRequest(input);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const res = await registerRequest(input);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(async () => {
    try {
      const token = await getPushTokenIfPermitted();
      if (token) await notificationsApi.unregisterPushToken(token);
    } catch {
      // best-effort — a stale token just stops receiving relevant pushes.
    }
    await logOutPurchases();
    await logoutRequest();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const refresh = useCallback(async () => {
    try {
      const me = await meRequest();
      setUser(me);
    } catch {
      // ignore — bootstrap/refresh path will handle a hard failure
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut, refresh }),
    [status, user, signIn, signUp, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
