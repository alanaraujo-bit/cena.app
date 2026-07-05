import type {
  AddFavoriteInput,
  CinephileOrder,
  PublicProfile,
  TitleSummary,
  UpdateProfileInput,
  WatchStats,
} from '@cena/shared';
import { prisma } from '../db';
import { computeIsPremium } from '../lib/entitlement';
import { AppError } from '../lib/errors';
import { getFollowCounts, getRelationship, isMutual } from './followService';
import { getCinephileOrder } from './icgService';
import { ensureTitleCached } from './watchService';

/** A user is considered "online" if active within this window. */
const PRESENCE_WINDOW_MS = 5 * 60_000;

function titleToSummary(title: {
  key: string;
  tmdbId: number;
  mediaType: string;
  title: string;
  year: number | null;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  voteAverage: number;
  popularity: number;
}): TitleSummary {
  return {
    key: title.key,
    tmdbId: title.tmdbId,
    mediaType: title.mediaType as 'movie' | 'tv',
    title: title.title,
    year: title.year,
    overview: title.overview,
    posterUrl: title.posterUrl,
    backdropUrl: title.backdropUrl,
    voteAverage: title.voteAverage,
    popularity: title.popularity,
  };
}

export async function getWatchStats(userId: string): Promise<WatchStats> {
  const entries = await prisma.watchEntry.findMany({
    where: { userId },
    select: { state: true, title: { select: { mediaType: true, runtimeMinutes: true } } },
  });

  const stats: WatchStats = {
    watchedCount: 0,
    watchingCount: 0,
    wantToWatchCount: 0,
    totalMinutes: 0,
    moviesWatched: 0,
    episodesWatched: 0,
  };

  for (const entry of entries) {
    if (entry.state === 'assistido') {
      stats.watchedCount += 1;
      stats.totalMinutes += entry.title.runtimeMinutes ?? 0;
      if (entry.title.mediaType === 'movie') stats.moviesWatched += 1;
      else stats.episodesWatched += 1;
    } else if (entry.state === 'assistindo') {
      stats.watchingCount += 1;
    } else if (entry.state === 'para_assistir') {
      stats.wantToWatchCount += 1;
    }
  }

  return stats;
}

export async function listFavorites(userId: string): Promise<TitleSummary[]> {
  const rows = await prisma.favoriteTitle.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
    include: { title: true },
  });
  return rows.map((r) => titleToSummary(r.title));
}

export async function addFavorite(userId: string, input: AddFavoriteInput): Promise<TitleSummary[]> {
  const title = await ensureTitleCached(input.key);

  const existing = await prisma.favoriteTitle.findUnique({
    where: { userId_titleId: { userId, titleId: title.id } },
  });
  if (!existing) {
    const last = await prisma.favoriteTitle.findFirst({
      where: { userId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });
    await prisma.favoriteTitle.create({
      data: { userId, titleId: title.id, order: (last?.order ?? -1) + 1 },
    });
  }
  return listFavorites(userId);
}

export async function removeFavorite(userId: string, key: string): Promise<TitleSummary[]> {
  const title = await prisma.title.findUnique({ where: { key }, select: { id: true } });
  if (title) {
    await prisma.favoriteTitle.deleteMany({ where: { userId, titleId: title.id } });
  }
  return listFavorites(userId);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<{ name: string; bio: string | null; privacyMode: string }> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.bio !== undefined ? { bio: input.bio } : {}),
      ...(input.privacyMode !== undefined ? { privacyMode: input.privacyMode } : {}),
    },
    select: { name: true, bio: true, privacyMode: true },
  });
  return user;
}

/** Empty stats used for restricted/private profiles. */
const EMPTY_STATS: WatchStats = {
  watchedCount: 0,
  watchingCount: 0,
  wantToWatchCount: 0,
  totalMinutes: 0,
  moviesWatched: 0,
  episodesWatched: 0,
};

const EMPTY_CINEPHILE_ORDER: CinephileOrder = {
  rank: 'espectador',
  icg: 0,
  axes: { volume: 0, diversidade: 0, profundidade: 0, consistencia: 0 },
  weakestAxis: 'volume',
  nextStepHint: '',
  calculatedAt: new Date(0).toISOString(),
};

export async function getPublicProfile(
  username: string,
  viewerId: string,
): Promise<PublicProfile> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    include: { activeFrame: { select: { key: true, effect: true, colors: true } } },
  });
  if (!user) throw AppError.notFound('Perfil não encontrado.');
  const isPremium = computeIsPremium(user);

  const isOwnProfile = user.id === viewerId;
  const [relationship, counts] = await Promise.all([
    getRelationship(viewerId, user.id),
    getFollowCounts(user.id),
  ]);

  // Público: always visible. Apenas-amigos: visible only to mutual followers.
  // Privado: visible only once the owner has accepted the viewer's request.
  const isRestricted =
    !isOwnProfile &&
    user.privacyMode !== 'publico' &&
    !(user.privacyMode === 'apenas_amigos' && (await isMutual(viewerId, user.id))) &&
    !(user.privacyMode === 'privado' && relationship === 'accepted');

  const online = Date.now() - user.lastActiveAt.getTime() < PRESENCE_WINDOW_MS;

  const base = {
    username: user.username,
    avatarUrl: user.avatarUrl,
    activeFrame: user.activeFrame,
    isPremium,
    online,
    privacyMode: user.privacyMode,
    followersCount: counts.followers,
    followingCount: counts.following,
    relationship,
    isOwnProfile,
  };

  if (isRestricted) {
    return {
      ...base,
      name: user.name,
      bio: null,
      stats: EMPTY_STATS,
      cinephileOrder: EMPTY_CINEPHILE_ORDER,
      favorites: [],
      isRestricted: true,
    };
  }

  const [stats, favorites, cinephileOrder] = await Promise.all([
    getWatchStats(user.id),
    listFavorites(user.id),
    getCinephileOrder(user.id),
  ]);

  return {
    ...base,
    name: user.name,
    bio: user.bio,
    stats,
    cinephileOrder,
    favorites,
    isRestricted: false,
  };
}
