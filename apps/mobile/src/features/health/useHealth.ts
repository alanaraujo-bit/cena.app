import { useQuery } from '@tanstack/react-query';
import type { HealthResponse } from '@cena/shared';
import { api } from '@/lib/api';

/** Pings the API /health endpoint — proves the client↔server wiring works. */
export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.get<HealthResponse>('/health', { auth: false }),
    retry: 1,
    staleTime: 10_000,
  });
}
