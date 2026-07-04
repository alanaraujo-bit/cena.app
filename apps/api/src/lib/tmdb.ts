import { env } from '../env';
import { AppError } from './errors';

/**
 * Thin TMDB v3 client. Prefers the v4 read access token (Bearer); falls back to
 * the v3 api_key query param. All content is requested in pt-BR.
 */
const BASE = 'https://api.themoviedb.org/3';
const LANG = 'pt-BR';
const REGION = 'BR';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

function authHeaders(): Record<string, string> {
  if (env.TMDB_ACCESS_TOKEN) {
    return { Authorization: `Bearer ${env.TMDB_ACCESS_TOKEN}` };
  }
  return {};
}

async function tmdbGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!env.TMDB_ACCESS_TOKEN && !env.TMDB_API_KEY) {
    throw new AppError(503, 'tmdb_unconfigured', 'Catálogo indisponível no momento.');
  }

  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('language', LANG);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  if (!env.TMDB_ACCESS_TOKEN && env.TMDB_API_KEY) {
    url.searchParams.set('api_key', env.TMDB_API_KEY);
  }

  const res = await fetch(url, { headers: { Accept: 'application/json', ...authHeaders() } });
  if (!res.ok) {
    if (res.status === 404) throw AppError.notFound('Título não encontrado.');
    throw new AppError(502, 'tmdb_error', 'Falha ao consultar o catálogo.');
  }
  return (await res.json()) as T;
}

// --- Raw TMDB response shapes (only the fields we use) --------------------

export interface TmdbSearchItem {
  id: number;
  media_type?: 'movie' | 'tv' | 'person';
  title?: string; // movie
  name?: string; // tv
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string; // movie
  first_air_date?: string; // tv
  vote_average?: number;
  popularity?: number;
  genre_ids?: number[];
}

interface TmdbPaged<T> {
  page: number;
  total_pages: number;
  results: T[];
}

export interface TmdbDetail extends TmdbSearchItem {
  runtime?: number; // movie
  episode_run_time?: number[]; // tv
  genres?: { id: number; name: string }[];
  tagline?: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  production_countries?: { iso_3166_1: string; name: string }[];
  credits?: {
    cast?: { id: number; name: string; character?: string; profile_path?: string | null }[];
    crew?: { id: number; name: string; job?: string }[];
  };
  videos?: { results?: { key: string; site: string; type: string; official?: boolean }[] };
}

export const tmdb = {
  searchMulti: (query: string, page = 1) =>
    tmdbGet<TmdbPaged<TmdbSearchItem>>('/search/multi', {
      query,
      page,
      include_adult: 'false',
      region: REGION,
    }),

  trending: () => tmdbGet<TmdbPaged<TmdbSearchItem>>('/trending/all/week'),

  movieDetail: (id: number) =>
    tmdbGet<TmdbDetail>(`/movie/${id}`, { append_to_response: 'credits,videos' }),

  tvDetail: (id: number) =>
    tmdbGet<TmdbDetail>(`/tv/${id}`, { append_to_response: 'credits,videos' }),
};
