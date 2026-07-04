import type { LeaderboardEntry, LeaderboardResponse, RankingWindow } from '@cena/shared';
import { prisma } from '../db';

interface TitleDelta {
  mediaType: string;
  runtimeMinutes: number | null;
}

/** Emit a signed consumption event for the append-only ranking ledger (§5.7). */
export async function recordRankingEvent(
  userId: string,
  type: 'add' | 'remove',
  title: TitleDelta,
): Promise<void> {
  await prisma.rankingEvent.create({
    data: {
      userId,
      type,
      minutesDelta: title.runtimeMinutes ?? 0,
      moviesDelta: title.mediaType === 'movie' ? 1 : 0,
      episodesDelta: title.mediaType === 'tv' ? 1 : 0,
    },
  });
}

function windowStart(window: RankingWindow): Date | undefined {
  const now = new Date();
  if (window === 'semana') return new Date(now.getTime() - 7 * 86_400_000);
  if (window === 'mes') return new Date(now.getTime() - 30 * 86_400_000);
  return undefined; // 'todos'
}

const LEADERBOARD_SIZE = 20;

export async function getLeaderboard(
  viewerId: string,
  window: RankingWindow,
): Promise<LeaderboardResponse> {
  const since = windowStart(window);

  const grouped = await prisma.rankingEvent.groupBy({
    by: ['userId', 'type'],
    where: since ? { createdAt: { gte: since } } : {},
    _sum: { minutesDelta: true, moviesDelta: true, episodesDelta: true },
  });

  const totals = new Map<string, { minutes: number; movies: number; episodes: number }>();
  for (const row of grouped) {
    const sign = row.type === 'add' ? 1 : -1;
    const current = totals.get(row.userId) ?? { minutes: 0, movies: 0, episodes: 0 };
    current.minutes += sign * (row._sum.minutesDelta ?? 0);
    current.movies += sign * (row._sum.moviesDelta ?? 0);
    current.episodes += sign * (row._sum.episodesDelta ?? 0);
    totals.set(row.userId, current);
  }

  const ranked = [...totals.entries()]
    .filter(([, t]) => t.minutes > 0 || t.movies > 0 || t.episodes > 0)
    .sort((a, b) => b[1].minutes - a[1].minutes);

  const topIds = ranked.slice(0, LEADERBOARD_SIZE).map(([id]) => id);
  const viewerInTop = ranked.slice(0, LEADERBOARD_SIZE).some(([id]) => id === viewerId);
  const viewerRankIdx = ranked.findIndex(([id]) => id === viewerId);

  const neededIds = new Set(topIds);
  if (!viewerInTop && viewerRankIdx >= 0) neededIds.add(viewerId);

  const users = await prisma.user.findMany({
    where: { id: { in: [...neededIds] } },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      activeFrame: { select: { key: true, effect: true, colors: true } },
      cinephileOrder: { select: { rank: true } },
    },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  function toEntry(userId: string, position: number): LeaderboardEntry | null {
    const user = userMap.get(userId);
    const totalsForUser = totals.get(userId);
    if (!user || !totalsForUser) return null;
    return {
      position,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      activeFrame: user.activeFrame,
      rank: (user.cinephileOrder?.rank ?? 'espectador') as LeaderboardEntry['rank'],
      totalMinutes: Math.max(0, totalsForUser.minutes),
      moviesWatched: Math.max(0, totalsForUser.movies),
      episodesWatched: Math.max(0, totalsForUser.episodes),
      isViewer: userId === viewerId,
    };
  }

  const entries = topIds
    .map((id, i) => toEntry(id, i + 1))
    .filter((e): e is LeaderboardEntry => e !== null);

  const viewerEntry =
    !viewerInTop && viewerRankIdx >= 0 ? toEntry(viewerId, viewerRankIdx + 1) : null;

  return { window, entries, viewerEntry };
}
