import { z } from 'zod';
import { displayNameSchema, usernameSchema } from './common';
import { activeFrameSummarySchema } from './frames';
import { cinephileOrderSchema } from './ranking';
import { followRelationshipSchema, privacyModeSchema } from './social';
import { titleKeySchema, titleSummarySchema } from './titles';

export const updateProfileSchema = z.object({
  name: displayNameSchema.optional(),
  bio: z.string().max(280, 'Bio muito longa (máximo 280 caracteres).').nullable().optional(),
  privacyMode: privacyModeSchema.optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const watchStatsSchema = z.object({
  watchedCount: z.number().int(),
  watchingCount: z.number().int(),
  wantToWatchCount: z.number().int(),
  totalMinutes: z.number().int(),
  moviesWatched: z.number().int(),
  episodesWatched: z.number().int(),
});
export type WatchStats = z.infer<typeof watchStatsSchema>;

export const publicProfileSchema = z.object({
  username: usernameSchema,
  name: z.string(),
  bio: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  activeFrame: activeFrameSummarySchema.nullable(),
  /** Derived from lastActiveAt — a heartbeat, not a live socket. */
  online: z.boolean(),
  privacyMode: privacyModeSchema,
  followersCount: z.number().int(),
  followingCount: z.number().int(),
  /** The viewer's own follow relationship toward this profile. */
  relationship: followRelationshipSchema,
  stats: watchStatsSchema,
  cinephileOrder: cinephileOrderSchema,
  favorites: z.array(titleSummarySchema),
  /** True only for the profile owner viewing their own page. */
  isOwnProfile: z.boolean(),
  /** True if the viewer cannot see full details (private profile, not owner/friend). */
  isRestricted: z.boolean(),
});
export type PublicProfile = z.infer<typeof publicProfileSchema>;

export const favoritesListSchema = z.array(titleSummarySchema);

export const addFavoriteSchema = z.object({
  key: titleKeySchema,
});
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
