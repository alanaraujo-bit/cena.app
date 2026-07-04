import { z } from 'zod';
import { idSchema, usernameSchema } from './common';
import { titleKeySchema, titleSummarySchema } from './titles';

export const versusChoiceSchema = z.enum(['a', 'b']);
export type VersusChoice = z.infer<typeof versusChoiceSchema>;

/** Embedded in a feed activity or fetched standalone (brief §5.8). */
export const versusSummarySchema = z.object({
  id: idSchema,
  question: z.string().nullable(),
  creator: z.object({ username: usernameSchema, name: z.string() }),
  titleA: titleSummarySchema,
  titleB: titleSummarySchema,
  votesA: z.number().int(),
  votesB: z.number().int(),
  closesAt: z.string(),
  isClosed: z.boolean(),
  /** True only if the viewer has watched BOTH titles and hasn't voted yet, before closing. */
  canVote: z.boolean(),
  myChoice: versusChoiceSchema.nullable(),
});
export type VersusSummary = z.infer<typeof versusSummarySchema>;

export const createVersusSchema = z
  .object({
    titleAKey: titleKeySchema,
    titleBKey: titleKeySchema,
    question: z.string().max(140, 'Pergunta muito longa.').optional(),
  })
  .refine((v) => v.titleAKey !== v.titleBKey, {
    message: 'Escolha dois títulos diferentes.',
    path: ['titleBKey'],
  });
export type CreateVersusInput = z.infer<typeof createVersusSchema>;

export const voteVersusSchema = z.object({ choice: versusChoiceSchema });
export type VoteVersusInput = z.infer<typeof voteVersusSchema>;
