import { z } from 'zod';
import { MEDIA_TYPES, WATCH_STATES } from '../constants/enums';
import { paginatedSchema, ratingSchema } from './common';

export const mediaTypeSchema = z.enum(MEDIA_TYPES);
export const watchStateSchema = z.enum(WATCH_STATES);

/**
 * Stable cross-system key for a TMDB title: `${mediaType}-${tmdbId}`
 * (e.g. "movie-603"). URL-safe, so it doubles as the /title/[key] route param.
 */
export const titleKeySchema = z.string().regex(/^(movie|tv)-\d+$/);

export function makeTitleKey(mediaType: 'movie' | 'tv', tmdbId: number): string {
  return `${mediaType}-${tmdbId}`;
}

export function parseTitleKey(key: string): { mediaType: 'movie' | 'tv'; tmdbId: number } {
  const [mediaType, id] = key.split('-');
  return { mediaType: mediaType as 'movie' | 'tv', tmdbId: Number(id) };
}

export const titleSummarySchema = z.object({
  key: titleKeySchema,
  tmdbId: z.number().int(),
  mediaType: mediaTypeSchema,
  title: z.string(),
  year: z.number().int().nullable(),
  overview: z.string(),
  posterUrl: z.string().url().nullable(),
  backdropUrl: z.string().url().nullable(),
  voteAverage: z.number(), // TMDB 0–10
  popularity: z.number(),
});
export type TitleSummary = z.infer<typeof titleSummarySchema>;

export const castMemberSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  character: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
});

export const titleDetailSchema = titleSummarySchema.extend({
  tagline: z.string().nullable(),
  runtimeMinutes: z.number().int().nullable(),
  genres: z.array(z.object({ id: z.number().int(), name: z.string() })),
  countries: z.array(z.string()),
  director: z.string().nullable(),
  cast: z.array(castMemberSchema),
  /** YouTube key for the trailer, if any. */
  trailerKey: z.string().nullable(),
  numberOfSeasons: z.number().int().nullable(),
  /** CENA community rating average (null until we have ratings). */
  communityRating: z.number().nullable(),
});
export type TitleDetail = z.infer<typeof titleDetailSchema>;

export const searchResultsSchema = paginatedSchema(titleSummarySchema);
export type SearchResults = z.infer<typeof searchResultsSchema>;

// --- Personal tracking (watch state) --------------------------------------

/** The current user's relationship to a title. */
export const titleSocialStatusSchema = z.object({
  watchState: watchStateSchema.nullable(),
  rating: z.number().nullable(),
  watchedAt: z.string().nullable(),
});
export type TitleSocialStatus = z.infer<typeof titleSocialStatusSchema>;

export const setWatchStateSchema = z.object({
  key: titleKeySchema,
  /** null clears any state for this title. */
  state: watchStateSchema.nullable(),
  rating: ratingSchema.optional(),
});
export type SetWatchStateInput = z.infer<typeof setWatchStateSchema>;
