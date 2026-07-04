import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './AuthProvider';

/**
 * Declarative route guard. Redirects based on auth + onboarding state:
 * - unauthenticated → (auth)
 * - authenticated but onboarding incomplete → (onboarding)
 * - fully set up → (tabs)
 */
export function useAuthGate() {
  const { status, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    const group = segments[0]; // '(auth)' | '(onboarding)' | '(tabs)' | 'title' | 'log' | undefined
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';

    if (status === 'unauthenticated') {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    // Authenticated from here on.
    const needsOnboarding = user ? !user.onboardingCompleted : false;

    if (needsOnboarding) {
      if (!inOnboarding) router.replace('/(onboarding)/welcome');
      return;
    }

    // Fully set up: only the auth/onboarding groups (or the bare index) bounce
    // to the tabs. Everything else — (tabs), the Log modal, and pushed app
    // stacks like /title/[key], /user/[username] — is allowed through.
    if (inAuth || inOnboarding || group === undefined) {
      router.replace('/(tabs)');
    }
  }, [status, user, segments, router]);
}
