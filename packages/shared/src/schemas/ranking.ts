import { z } from 'zod';
import { CINEPHILE_RANKS, ICG_AXES } from '../constants/ranks';
import { usernameSchema } from './common';
import { activeFrameSummarySchema } from './frames';

export const cinephileRankSchema = z.enum(CINEPHILE_RANKS);
export const icgAxisSchema = z.enum(ICG_AXES);

export const icgAxisScoresSchema = z.object({
  volume: z.number(),
  diversidade: z.number(),
  profundidade: z.number(),
  consistencia: z.number(),
});
export type IcgAxisScores = z.infer<typeof icgAxisScoresSchema>;

export const cinephileOrderSchema = z.object({
  rank: cinephileRankSchema,
  /** Índice Cinéfilo Global, 0–1. */
  icg: z.number(),
  axes: icgAxisScoresSchema,
  /** The currently weakest axis — drives the actionable next-step hint. */
  weakestAxis: icgAxisSchema,
  nextStepHint: z.string(),
  calculatedAt: z.string(),
});
export type CinephileOrder = z.infer<typeof cinephileOrderSchema>;

export const rankingWindowSchema = z.enum(['semana', 'mes', 'todos']);
export type RankingWindow = z.infer<typeof rankingWindowSchema>;

export const leaderboardEntrySchema = z.object({
  position: z.number().int(),
  username: usernameSchema,
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
  activeFrame: activeFrameSummarySchema.nullable(),
  rank: cinephileRankSchema,
  totalMinutes: z.number().int(),
  moviesWatched: z.number().int(),
  episodesWatched: z.number().int(),
  isViewer: z.boolean(),
});
export type LeaderboardEntry = z.infer<typeof leaderboardEntrySchema>;

export const leaderboardResponseSchema = z.object({
  window: rankingWindowSchema,
  entries: z.array(leaderboardEntrySchema),
  /** The viewer's own row, included even when outside the top N. */
  viewerEntry: leaderboardEntrySchema.nullable(),
});
export type LeaderboardResponse = z.infer<typeof leaderboardResponseSchema>;
