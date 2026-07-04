import { z } from 'zod';
import { CINEPHILE_LEVELS } from '../constants/enums';

export const cinephileLevelSchema = z.enum(CINEPHILE_LEVELS);

export const updateLevelSchema = z.object({
  level: cinephileLevelSchema,
});
export type UpdateLevelInput = z.infer<typeof updateLevelSchema>;

export const updateGenresSchema = z.object({
  /** TMDB genre ids. */
  genres: z.array(z.number().int().positive()).max(20),
});
export type UpdateGenresInput = z.infer<typeof updateGenresSchema>;

/** Which onboarding step to flag as done via the generic step endpoint. */
export const onboardingStepSchema = z.object({
  step: z.enum(['notificationsPrimed', 'seededTitles', 'followedFounder']),
  value: z.boolean().default(true),
});
export type OnboardingStepInput = z.infer<typeof onboardingStepSchema>;

export const onboardingStatusSchema = z.object({
  level: cinephileLevelSchema.nullable(),
  favoriteGenres: z.array(z.number().int()),
  notificationsPrimed: z.boolean(),
  seededTitles: z.boolean(),
  followedFounder: z.boolean(),
  completed: z.boolean(),
});
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;
