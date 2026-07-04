import type { Title } from '@prisma/client';
import {
  parseTitleKey,
  type SetWatchStateInput,
  type TitleSocialStatus,
} from '@cena/shared';
import { prisma } from '../db';
import { AppError } from '../lib/errors';
import { createActivity } from './activityService';
import { recordRankingEvent } from './rankingService';
import { titleDetail } from './titleService';

/** Days before a cached Title is considered stale and refetched from TMDB. */
const CACHE_TTL_DAYS = 7;

/** Ensure a Title row exists (and is reasonably fresh), fetching TMDB if not. */
export async function ensureTitleCached(key: string): Promise<Title> {
  const { mediaType, tmdbId } = parseTitleKey(key);
  const existing = await prisma.title.findUnique({ where: { key } });

  const fresh =
    existing &&
    Date.now() - existing.cachedAt.getTime() < CACHE_TTL_DAYS * 86_400_000;
  if (fresh) return existing;

  const detail = await titleDetail(mediaType, tmdbId);
  const data = {
    tmdbId,
    mediaType,
    title: detail.title,
    year: detail.year,
    overview: detail.overview,
    posterUrl: detail.posterUrl,
    backdropUrl: detail.backdropUrl,
    voteAverage: detail.voteAverage,
    popularity: detail.popularity,
    runtimeMinutes: detail.runtimeMinutes,
    genreIds: detail.genres.map((g) => g.id),
    countries: detail.countries,
    director: detail.director,
    cachedAt: new Date(),
  };

  return prisma.title.upsert({
    where: { key },
    create: { key, ...data },
    update: data,
  });
}

function toStatus(entry: { state: string; rating: number | null; watchedAt: Date | null } | null): TitleSocialStatus {
  if (!entry) return { watchState: null, rating: null, watchedAt: null };
  return {
    watchState: entry.state as TitleSocialStatus['watchState'],
    rating: entry.rating,
    watchedAt: entry.watchedAt ? entry.watchedAt.toISOString() : null,
  };
}

export async function getTitleStatus(userId: string, key: string): Promise<TitleSocialStatus> {
  const title = await prisma.title.findUnique({ where: { key }, select: { id: true } });
  if (!title) return { watchState: null, rating: null, watchedAt: null };
  const entry = await prisma.watchEntry.findUnique({
    where: { userId_titleId: { userId, titleId: title.id } },
    select: { state: true, rating: true, watchedAt: true },
  });
  return toStatus(entry);
}

export async function setWatchState(
  userId: string,
  input: SetWatchStateInput,
): Promise<TitleSocialStatus> {
  if (input.rating !== undefined && input.state !== 'assistido') {
    throw AppError.badRequest('Só é possível avaliar títulos marcados como assistidos.');
  }

  const title = await ensureTitleCached(input.key);
  const titleId = title.id;

  // Clearing state removes the entry entirely.
  if (input.state === null) {
    const removed = await prisma.watchEntry.findUnique({
      where: { userId_titleId: { userId, titleId } },
      select: { state: true },
    });
    await prisma.watchEntry.deleteMany({ where: { userId, titleId } });
    if (removed?.state === 'assistido') {
      await recordRankingEvent(userId, 'remove', title);
    }
    return { watchState: null, rating: null, watchedAt: null };
  }

  const existing = await prisma.watchEntry.findUnique({
    where: { userId_titleId: { userId, titleId } },
  });

  const isWatched = input.state === 'assistido';
  // Keep the original watched date across edits; only watched entries carry a
  // date/rating.
  const watchedAt = isWatched ? (existing?.watchedAt ?? new Date()) : null;
  const rating = isWatched ? (input.rating ?? existing?.rating ?? null) : null;

  const entry = await prisma.watchEntry.upsert({
    where: { userId_titleId: { userId, titleId } },
    create: { userId, titleId, state: input.state, rating, watchedAt },
    update: { state: input.state, rating, watchedAt },
    select: { state: true, rating: true, watchedAt: true },
  });

  // Feed activity + ranking ledger: only on meaningful transitions, never on a
  // no-op re-save.
  const previousState = existing?.state ?? null;
  if (isWatched && previousState !== 'assistido') {
    await createActivity(userId, 'watched', titleId);
    await recordRankingEvent(userId, 'add', title);
  }
  if (!isWatched && previousState === 'assistido') {
    // Left the watched state for assistindo/para_assistir — reverse the ledger.
    await recordRankingEvent(userId, 'remove', title);
  }
  if (input.state === 'para_assistir' && previousState !== 'para_assistir') {
    await createActivity(userId, 'want_to_watch', titleId);
  }
  if (isWatched && rating !== null && rating !== (existing?.rating ?? null)) {
    await createActivity(userId, 'rating', titleId, rating);
  }

  return toStatus(entry);
}

export async function getWatchCounts(
  userId: string,
): Promise<{ assistido: number; assistindo: number; para_assistir: number }> {
  const grouped = await prisma.watchEntry.groupBy({
    by: ['state'],
    where: { userId },
    _count: { _all: true },
  });
  const counts = { assistido: 0, assistindo: 0, para_assistir: 0 };
  for (const g of grouped) {
    counts[g.state as keyof typeof counts] = g._count._all;
  }
  return counts;
}
