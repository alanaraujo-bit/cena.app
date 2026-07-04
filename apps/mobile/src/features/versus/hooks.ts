import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateVersusInput, VersusSummary, VoteVersusInput } from '@cena/shared';
import { versusApi } from './api';

export function useVersus(id: string) {
  return useQuery({
    queryKey: ['versus', id],
    queryFn: () => versusApi.get(id),
    staleTime: 15_000,
  });
}

export function useCreateVersus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVersusInput) => versusApi.create(input),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useVoteVersus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: VoteVersusInput) => versusApi.vote(id, input),
    onSuccess: (data: VersusSummary) => {
      qc.setQueryData(['versus', id], data);
      void qc.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
