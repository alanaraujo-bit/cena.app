import { API_VERSION, type AuthTokens } from '@cena/shared';
import { config } from './config';
import { tokenStore } from './secureStore';

/**
 * Low-level session helpers, deliberately independent of the auth feature and
 * the main api client so the client can call `refreshSession()` on a 401
 * without an import cycle.
 */

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Exchange the stored refresh token for a fresh token pair (rotation).
 * Concurrent callers share a single in-flight request. Returns the new access
 * token, or null if refresh failed (caller should sign the user out).
 */
export async function refreshSession(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const tokens = await tokenStore.get();
      if (!tokens) return null;

      const res = await fetch(`${config.apiUrl}/${API_VERSION}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!res.ok) {
        await tokenStore.clear();
        return null;
      }

      const next = (await res.json()) as AuthTokens;
      await tokenStore.set({ accessToken: next.accessToken, refreshToken: next.refreshToken });
      return next.accessToken;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
