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

    const group = segments[0]; // '(auth)' | '(onboarding)' | '(tabs)' | 'log' | undefined
    const inAuth = group === '(auth)';
    const inOnboarding = group === '(onboarding)';
    const inTabs = group === '(tabs)';
    const inModal = group === 'log';

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

    // Fully set up: allowed in the tabs and the root Log modal. Anything else
    // (auth, onboarding, or the bare index) bounces to the tabs.
    if (!inTabs && !inModal) {
      router.replace('/(tabs)');
    }
  }, [status, user, segments, router]);
}
