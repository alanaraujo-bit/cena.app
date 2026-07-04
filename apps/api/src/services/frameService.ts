import type { Prisma } from '@prisma/client';
import { CINEPHILE_RANKS, type FrameCatalogItem, type FrameLibraryResponse, type GiftFrameInput } from '@cena/shared';
import { prisma } from '../db';
import { AppError } from '../lib/errors';
import { isFounderEmail } from '../lib/founder';
import { STARTER_FRAME_KEY } from './frameCatalog';
import { getCinephileOrder } from './icgService';
import { createNotification } from './notificationService';

function frameToDto(
  frame: Prisma.FrameGetPayload<Record<string, never>>,
  opts: { owned: boolean; active: boolean; source: string | null },
): FrameCatalogItem {
  return {
    id: frame.id,
    key: frame.key,
    name: frame.name,
    description: frame.description,
    rarity: frame.rarity,
    effect: frame.effect,
    colors: frame.colors,
    unlockRank: frame.unlockRank,
    owned: opts.owned,
    active: opts.active,
    source: opts.source as FrameCatalogItem['source'],
  };
}

/** Grants any rank-gated frame the user's current Ordem Cinéfila rank now qualifies for. */
async function grantEligibleRankUnlocks(
  userId: string,
  frames: Prisma.FrameGetPayload<Record<string, never>>[],
  ownedIds: Set<string>,
): Promise<void> {
  const candidates = frames.filter((f) => f.unlockRank && !ownedIds.has(f.id));
  if (candidates.length === 0) return;

  const order = await getCinephileOrder(userId);
  const rankIdx = CINEPHILE_RANKS.indexOf(order.rank as never);

  for (const frame of candidates) {
    const neededIdx = CINEPHILE_RANKS.indexOf(frame.unlockRank as never);
    if (neededIdx <= rankIdx) {
      await prisma.userFrame.create({ data: { userId, frameId: frame.id, source: 'rank_unlock' } });
      ownedIds.add(frame.id);
    }
  }
}

export async function listFrames(userId: string): Promise<FrameLibraryResponse> {
  const [user, frames, ownedRows] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, activeFrameId: true } }),
    prisma.frame.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.userFrame.findMany({ where: { userId }, select: { frameId: true, source: true } }),
  ]);

  const founder = isFounderEmail(user.email);
  const ownedMap = new Map(ownedRows.map((r) => [r.frameId, r.source as string]));

  if (!founder) {
    const starter = frames.find((f) => f.key === STARTER_FRAME_KEY);
    if (starter && !ownedMap.has(starter.id)) {
      await prisma.userFrame.create({ data: { userId, frameId: starter.id, source: 'starter' } });
      ownedMap.set(starter.id, 'starter');
    }

    const ownedIds = new Set(ownedMap.keys());
    await grantEligibleRankUnlocks(userId, frames, ownedIds);
    for (const id of ownedIds) {
      if (!ownedMap.has(id)) ownedMap.set(id, 'rank_unlock');
    }
  }

  return {
    frames: frames.map((f) =>
      frameToDto(f, {
        owned: founder || ownedMap.has(f.id),
        active: user.activeFrameId === f.id,
        source: founder ? null : (ownedMap.get(f.id) ?? null),
      }),
    ),
    canGift: founder,
  };
}

export async function equipFrame(userId: string, frameId: string): Promise<void> {
  const [frame, user] = await Promise.all([
    prisma.frame.findUnique({ where: { id: frameId } }),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } }),
  ]);
  if (!frame) throw AppError.notFound('Moldura não encontrada.');

  if (!isFounderEmail(user.email)) {
    const owned = await prisma.userFrame.findUnique({
      where: { userId_frameId: { userId, frameId } },
    });

    if (!owned) {
      if (frame.key === STARTER_FRAME_KEY) {
        await prisma.userFrame.create({ data: { userId, frameId, source: 'starter' } });
      } else if (frame.unlockRank) {
        const order = await getCinephileOrder(userId);
        const rankIdx = CINEPHILE_RANKS.indexOf(order.rank as never);
        const neededIdx = CINEPHILE_RANKS.indexOf(frame.unlockRank as never);
        if (neededIdx > rankIdx) throw AppError.forbidden('Você ainda não desbloqueou essa moldura.');
        await prisma.userFrame.create({ data: { userId, frameId, source: 'rank_unlock' } });
      } else {
        throw AppError.forbidden('Você ainda não possui essa moldura.');
      }
    }
  }

  await prisma.user.update({ where: { id: userId }, data: { activeFrameId: frameId } });
}

export async function giftFrame(actorUserId: string, input: GiftFrameInput): Promise<void> {
  const actor = await prisma.user.findUniqueOrThrow({ where: { id: actorUserId }, select: { email: true } });
  if (!isFounderEmail(actor.email)) {
    throw AppError.forbidden('Somente o fundador pode presentear molduras.');
  }

  const frame = await prisma.frame.findUnique({ where: { id: input.frameId } });
  if (!frame) throw AppError.notFound('Moldura não encontrada.');

  const target = await prisma.user.findUnique({ where: { username: input.username.toLowerCase() } });
  if (!target) throw AppError.notFound('Usuário não encontrado.');
  if (target.id === actorUserId) throw AppError.badRequest('Você já possui todas as molduras.');

  const existing = await prisma.userFrame.findUnique({
    where: { userId_frameId: { userId: target.id, frameId: frame.id } },
  });
  if (existing) return;

  await prisma.userFrame.create({
    data: { userId: target.id, frameId: frame.id, source: 'founder_gift', giftedById: actorUserId },
  });
  await createNotification({
    recipientId: target.id,
    actorId: actorUserId,
    type: 'frame_gift',
    frameId: frame.id,
  });
}
