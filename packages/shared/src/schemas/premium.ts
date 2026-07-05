import { z } from 'zod';
import { ENTITLEMENT_TIERS } from '../constants/enums';

export const entitlementTierSchema = z.enum(ENTITLEMENT_TIERS);

export const premiumStatusSchema = z.object({
  isPremium: z.boolean(),
  tier: entitlementTierSchema,
  expiresAt: z.string().nullable(),
  willRenew: z.boolean(),
  productId: z.string().nullable(),
});
export type PremiumStatus = z.infer<typeof premiumStatusSchema>;

/** Optimistic client-side nudge right after a purchase/restore completes —
 * the RevenueCat webhook remains the authoritative source of truth. */
export const syncPurchaseSchema = z.object({
  active: z.boolean(),
  productId: z.string().optional(),
  store: z.enum(['app_store', 'play_store']).optional(),
  expiresAtMs: z.number().int().nullable().optional(),
  willRenew: z.boolean().optional(),
});
export type SyncPurchaseInput = z.infer<typeof syncPurchaseSchema>;

/** "Sua Jornada Cinéfila" — Premium-only deeper breakdown of watch history. */
export const advancedStatsSchema = z.object({
  genreBreakdown: z.array(z.object({ genreId: z.number().int(), count: z.number().int() })),
  decadeBreakdown: z.array(z.object({ decade: z.number().int(), count: z.number().int() })),
  topDirectors: z.array(z.object({ director: z.string(), count: z.number().int() })),
  /** Last up-to-6 months, ascending, "YYYY-MM". */
  monthlyMinutes: z.array(z.object({ month: z.string(), minutes: z.number().int() })),
});
export type AdvancedStats = z.infer<typeof advancedStatsSchema>;
