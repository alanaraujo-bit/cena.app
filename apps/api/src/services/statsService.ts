import type { AdvancedStats } from '@cena/shared';
import { prisma } from '../db';
import { computeIsPremium } from '../lib/entitlement';
import { AppError } from '../lib/errors';

function sortDesc<K>(map: Map<K, number>): [K, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

/** "Sua Jornada Cinéfila" — Premium-only deeper breakdown of watch history. */
export async function getAdvancedStats(userId: string): Promise<AdvancedStats> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, entitlement: true },
  });
  if (!computeIsPremium(user)) {
    throw new AppError(403, 'premium_required', 'Estatísticas avançadas são exclusivas de assinantes Premium.');
  }

  const entries = await prisma.watchEntry.findMany({
    where: { userId, state: 'assistido' },
    select: {
      watchedAt: true,
      title: { select: { genreIds: true, year: true, director: true, runtimeMinutes: true } },
    },
  });

  const genreCounts = new Map<number, number>();
  const decadeCounts = new Map<number, number>();
  const directorCounts = new Map<string, number>();
  const monthMinutes = new Map<string, number>();

  for (const entry of entries) {
    for (const genreId of entry.title.genreIds) {
      genreCounts.set(genreId, (genreCounts.get(genreId) ?? 0) + 1);
    }
    if (entry.title.year) {
      const decade = Math.floor(entry.title.year / 10) * 10;
      decadeCounts.set(decade, (decadeCounts.get(decade) ?? 0) + 1);
    }
    if (entry.title.director) {
      directorCounts.set(entry.title.director, (directorCounts.get(entry.title.director) ?? 0) + 1);
    }
    if (entry.watchedAt) {
      const month = entry.watchedAt.toISOString().slice(0, 7);
      monthMinutes.set(month, (monthMinutes.get(month) ?? 0) + (entry.title.runtimeMinutes ?? 0));
    }
  }

  return {
    genreBreakdown: sortDesc(genreCounts)
      .slice(0, 8)
      .map(([genreId, count]) => ({ genreId, count })),
    decadeBreakdown: [...decadeCounts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([decade, count]) => ({ decade, count })),
    topDirectors: sortDesc(directorCounts)
      .slice(0, 5)
      .map(([director, count]) => ({ director, count })),
    monthlyMinutes: [...monthMinutes.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, minutes]) => ({ month, minutes })),
  };
}
