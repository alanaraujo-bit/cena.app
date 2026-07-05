import type { PremiumStatus, SyncPurchaseInput } from '@cena/shared';
import { prisma } from '../db';
import { computeIsPremium } from '../lib/entitlement';

/** RevenueCat event types that mean "the entitlement is active right now". */
const ACTIVE_EVENT_TYPES = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
]);

interface RevenueCatEventInput {
  id: string;
  type: string;
  appUserId: string;
  productId?: string;
  store?: string;
  environment?: string;
  expiresAtMs?: number | null;
}

/** If the equipped frame is Premium-exclusive and the user no longer qualifies, fall back to no frame. */
async function unequipIfNoLongerEntitled(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeFrameId: true, activeFrame: { select: { unlockEntitlement: true } } },
  });
  if (user?.activeFrameId && user.activeFrame?.unlockEntitlement === 'premium') {
    await prisma.user.update({ where: { id: userId }, data: { activeFrameId: null } });
  }
}

export async function getStatus(userId: string): Promise<PremiumStatus> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { email: true, entitlement: true, premiumExpiresAt: true },
  });
  const subscription = await prisma.subscription.findUnique({ where: { userId } });

  return {
    isPremium: computeIsPremium(user),
    tier: user.entitlement,
    expiresAt: user.premiumExpiresAt?.toISOString() ?? null,
    willRenew: subscription?.willRenew ?? false,
    productId: subscription?.productId ?? null,
  };
}

/**
 * Handles a webhook delivery from RevenueCat. Idempotent via `rcEventId` —
 * RevenueCat retries deliveries on any non-2xx response, so a duplicate
 * event.id must be a no-op rather than re-applying the transition.
 */
export async function handleRevenueCatEvent(event: RevenueCatEventInput): Promise<void> {
  try {
    await prisma.revenueCatEvent.create({
      data: {
        rcEventId: event.id,
        userId: event.appUserId,
        type: event.type,
        productId: event.productId,
        store: event.store,
        environment: event.environment ?? 'PRODUCTION',
      },
    });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2002') return; // already processed
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { id: event.appUserId }, select: { id: true } });
  if (!user) return; // app_user_id wasn't a real account — nothing to update

  const expiresAt = event.expiresAtMs ? new Date(event.expiresAtMs) : null;

  if (ACTIVE_EVENT_TYPES.has(event.type)) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { entitlement: 'premium', premiumExpiresAt: expiresAt },
      }),
      prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          tier: 'premium',
          productId: event.productId ?? 'unknown',
          store: event.store ?? 'unknown',
          willRenew: true,
          expiresAt,
        },
        update: {
          tier: 'premium',
          productId: event.productId ?? 'unknown',
          store: event.store ?? 'unknown',
          willRenew: true,
          expiresAt,
        },
      }),
    ]);
    return;
  }

  if (event.type === 'CANCELLATION') {
    // Auto-renew turned off — still entitled until `expiresAt` actually passes.
    await prisma.subscription.updateMany({ where: { userId: user.id }, data: { willRenew: false } });
    return;
  }

  if (event.type === 'EXPIRATION') {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { entitlement: 'free', premiumExpiresAt: null } }),
      prisma.subscription.updateMany({ where: { userId: user.id }, data: { tier: 'free', willRenew: false } }),
    ]);
    await unequipIfNoLongerEntitled(user.id);
    return;
  }

  // BILLING_ISSUE (grace period — RC follows up with EXPIRATION if unresolved)
  // and TRANSFER (account-transfer edge case, out of scope) intentionally
  // cause no entitlement change beyond the ledger row already written above.
}

/** Optimistic nudge called by the client right after a purchase/restore completes. */
export async function syncFromClient(userId: string, input: SyncPurchaseInput): Promise<PremiumStatus> {
  const expiresAt = input.expiresAtMs ? new Date(input.expiresAtMs) : null;

  if (input.active) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { entitlement: 'premium', premiumExpiresAt: expiresAt } }),
      prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          tier: 'premium',
          productId: input.productId ?? 'unknown',
          store: input.store ?? 'unknown',
          willRenew: input.willRenew ?? true,
          expiresAt,
        },
        update: {
          tier: 'premium',
          productId: input.productId ?? 'unknown',
          store: input.store ?? 'unknown',
          willRenew: input.willRenew ?? true,
          expiresAt,
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { entitlement: 'free', premiumExpiresAt: null } }),
      prisma.subscription.updateMany({ where: { userId }, data: { tier: 'free', willRenew: false } }),
    ]);
    await unequipIfNoLongerEntitled(userId);
  }

  return getStatus(userId);
}
