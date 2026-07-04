import { z } from 'zod';
import { CINEPHILE_RANKS } from '../constants/ranks';
import { FRAME_EFFECTS, FRAME_RARITIES, FRAME_SOURCES } from '../constants/enums';
import { idSchema, usernameSchema } from './common';

export const frameRaritySchema = z.enum(FRAME_RARITIES);
export const frameEffectSchema = z.enum(FRAME_EFFECTS);
export const frameSourceSchema = z.enum(FRAME_SOURCES);
export const frameUnlockRankSchema = z.enum(CINEPHILE_RANKS);

/** Minimal shape needed to render an equipped frame anywhere an avatar appears. */
export const activeFrameSummarySchema = z.object({
  key: z.string(),
  effect: frameEffectSchema,
  colors: z.array(z.string()),
});
export type ActiveFrameSummary = z.infer<typeof activeFrameSummarySchema>;

export const frameCatalogItemSchema = z.object({
  id: idSchema,
  key: z.string(),
  name: z.string(),
  description: z.string(),
  rarity: frameRaritySchema,
  effect: frameEffectSchema,
  colors: z.array(z.string()),
  unlockRank: frameUnlockRankSchema.nullable(),
  owned: z.boolean(),
  active: z.boolean(),
  source: frameSourceSchema.nullable(),
});
export type FrameCatalogItem = z.infer<typeof frameCatalogItemSchema>;

export const frameLibraryResponseSchema = z.object({
  frames: z.array(frameCatalogItemSchema),
  /** True only for the founder account — gates the gifting UI. */
  canGift: z.boolean(),
});
export type FrameLibraryResponse = z.infer<typeof frameLibraryResponseSchema>;

export const equipFrameSchema = z.object({ frameId: idSchema });
export type EquipFrameInput = z.infer<typeof equipFrameSchema>;

export const giftFrameSchema = z.object({ frameId: idSchema, username: usernameSchema });
export type GiftFrameInput = z.infer<typeof giftFrameSchema>;
