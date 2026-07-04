import {
  makeTitleKey,
  type SearchResults,
  type TitleDetail,
  type TitleSummary,
} from '@cena/shared';
import {
  TMDB_IMAGE_BASE,
  tmdb,
  type TmdbDetail,
  type TmdbSearchItem,
} from '../lib/tmdb';

function img(path: string | null | undefined, size: string): string | null {
  return path ? `${TMDB_IMAGE_BASE}/${size}${path}` : null;
}

function yearOf(date: string | undefined): number | null {
  if (!date) return null;
  const y = Number(date.slice(0, 4));
  return Number.isFinite(y) && y > 0 ? y : null;
}

/** Narrow a multi-search item to a supported media type, or null to drop it. */
function resolveMediaType(item: TmdbSearchItem): 'movie' | 'tv' | null {
  if (item.media_type === 'movie' || item.media_type === 'tv') return item.media_type;
  if (item.media_type === 'person') return null;
  // Detail endpoints omit media_type; infer from which title field is present.
  if (item.title) return 'movie';
  if (item.name) return 'tv';
  return null;
}

function toSummary(item: TmdbSearchItem, mediaType: 'movie' | 'tv'): TitleSummary {
  const title = item.title ?? item.name ?? item.original_title ?? item.original_name ?? 'Sem título';
  const date = item.release_date ?? item.first_air_date;
  return {
    key: makeTitleKey(mediaType, item.id),
    tmdbId: item.id,
    mediaType,
    title,
    year: yearOf(date),
    overview: item.overview ?? '',
    posterUrl: img(item.poster_path, 'w500'),
    backdropUrl: img(item.backdrop_path, 'w780'),
    voteAverage: item.vote_average ?? 0,
    popularity: item.popularity ?? 0,
  };
}

export async function searchTitles(query: string, page = 1): Promise<SearchResults> {
  const trimmed = query.trim();
  if (!trimmed) return { items: [], nextCursor: null };

  const res = await tmdb.searchMulti(trimmed, page);
  const items: TitleSummary[] = [];
  for (const raw of res.results) {
    const mediaType = resolveMediaType(raw);
    if (mediaType) items.push(toSummary(raw, mediaType));
  }
  const nextCursor = res.page < res.total_pages ? String(res.page + 1) : null;
  return { items, nextCursor };
}

export async function trendingTitles(): Promise<TitleSummary[]> {
  const res = await tmdb.trending();
  const items: TitleSummary[] = [];
  for (const raw of res.results) {
    const mediaType = resolveMediaType(raw);
    if (mediaType) items.push(toSummary(raw, mediaType));
  }
  return items;
}

export async function titleDetail(
  mediaType: 'movie' | 'tv',
  tmdbId: number,
): Promise<TitleDetail> {
  const raw: TmdbDetail = mediaType === 'movie' ? await tmdb.movieDetail(tmdbId) : await tmdb.tvDetail(tmdbId);
  const summary = toSummary(raw, mediaType);

  const runtime =
    mediaType === 'movie'
      ? (raw.runtime ?? null)
      : (raw.episode_run_time?.[0] ?? null);

  const director =
    mediaType === 'movie'
      ? (raw.credits?.crew?.find((c) => c.job === 'Director')?.name ?? null)
      : null;

  const trailer =
    raw.videos?.results?.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official,
    ) ?? raw.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer');

  return {
    ...summary,
    tagline: raw.tagline?.trim() ? raw.tagline : null,
    runtimeMinutes: runtime,
    genres: raw.genres ?? [],
    countries: (raw.production_countries ?? []).map((c) => c.name),
    director,
    cast: (raw.credits?.cast ?? []).slice(0, 12).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character ?? null,
      photoUrl: img(c.profile_path, 'w185'),
    })),
    trailerKey: trailer?.key ?? null,
    numberOfSeasons: raw.number_of_seasons ?? null,
    communityRating: null,
  };
}
