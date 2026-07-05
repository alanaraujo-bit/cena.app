import { useQuery } from '@tanstack/react-query';
import { premiumApi } from './api';

export const PREMIUM_STATUS_KEY = ['premium', 'status'] as const;

export function usePremiumStatus() {
  return useQuery({
    queryKey: PREMIUM_STATUS_KEY,
    queryFn: () => premiumApi.status(),
    staleTime: 15_000,
  });
}

/** 403 (`premium_required`) is an expected, non-error state here — the query just stays empty. */
export function useAdvancedStats(enabled: boolean) {
  return useQuery({
    queryKey: ['premium', 'stats', 'advanced'],
    queryFn: () => premiumApi.advancedStats(),
    enabled,
    retry: false,
  });
}
