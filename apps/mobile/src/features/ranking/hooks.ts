import { useQuery } from '@tanstack/react-query';
import type { RankingWindow } from '@cena/shared';
import { rankingApi } from './api';

export function useLeaderboard(window: RankingWindow) {
  return useQuery({
    queryKey: ['ranking', window],
    queryFn: () => rankingApi.leaderboard(window),
    staleTime: 60_000,
  });
}
