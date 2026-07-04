import { z } from 'zod';
import { ACTIVITY_TYPES, PRIVACY_MODES } from '../constants/enums';
import { idSchema, paginatedSchema } from './common';
import { titleSummarySchema } from './titles';

export const activityTypeSchema = z.enum(ACTIVITY_TYPES);

/** Only these are actually produced today; the rest of the enum is reserved. */
export const supportedActivityTypeSchema = z.enum(['watched', 'want_to_watch', 'rating']);

export const activityAuthorSchema = z.object({
  username: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
});

export const activityItemSchema = z.object({
  id: idSchema,
  type: activityTypeSchema,
  createdAt: z.string(),
  user: activityAuthorSchema,
  title: titleSummarySchema.nullable(),
  rating: z.number().nullable(),
  likeCount: z.number().int(),
  commentCount: z.number().int(),
  likedByMe: z.boolean(),
});
export type ActivityItem = z.infer<typeof activityItemSchema>;

export const feedResponseSchema = paginatedSchema(activityItemSchema);
export type FeedResponse = z.infer<typeof feedResponseSchema>;

export const commentSchema = z.object({
  id: idSchema,
  body: z.string(),
  createdAt: z.string(),
  user: activityAuthorSchema,
});
export type Comment = z.infer<typeof commentSchema>;

export const createCommentSchema = z.object({
  body: z.string().min(1, 'Escreva algo.').max(500, 'Comentário muito longo.'),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// --- Follow -----------------------------------------------------------------

export const privacyModeSchema = z.enum(PRIVACY_MODES);

/** The viewer's follow relationship toward a profile — not the reverse. */
export const followRelationshipSchema = z.enum(['self', 'none', 'pending', 'accepted']);
export type FollowRelationship = z.infer<typeof followRelationshipSchema>;

export const followRequestSchema = z.object({
  username: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
  requestedAt: z.string(),
});
export type FollowRequest = z.infer<typeof followRequestSchema>;
