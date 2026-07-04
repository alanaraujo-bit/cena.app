import type { CreateVersusInput, VersusSummary, VoteVersusInput } from '@cena/shared';
import { api } from '@/lib/api';

export const versusApi = {
  create: (input: CreateVersusInput) => api.post<VersusSummary>('/versus', input),
  get: (id: string) => api.get<VersusSummary>(`/versus/${id}`),
  vote: (id: string, input: VoteVersusInput) => api.post<VersusSummary>(`/versus/${id}/vote`, input),
};
