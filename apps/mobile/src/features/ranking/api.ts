import type { LeaderboardResponse, RankingWindow } from '@cena/shared';
import { api } from '@/lib/api';

export const rankingApi = {
  leaderboard: (window: RankingWindow) => api.get<LeaderboardResponse>(`/ranking?window=${window}`),
};
