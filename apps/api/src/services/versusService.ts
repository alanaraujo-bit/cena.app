import type { Prisma } from '@prisma/client';
import { FREE_ACTIVE_VERSUS_LIMIT, type CreateVersusInput, type VersusSummary, type VoteVersusInput } from '@cena/shared';
import { prisma } from '../db';
import { computeIsPremium } from '../lib/entitlement';
import { AppError } from '../lib/errors';
import { createActivity } from './activityService';
import { createNotification } from './notificationService';
import { toVersusSummary } from './versusMapper';
import { ensureTitleCached, getWatchedTitleIds } from './watchService';

/** No prazo/expiração automática além disto — sempre 48h a partir da criação (brief §5.8). */
const VERSUS_DURATION_HOURS = 48;

const versusInclude = {
  creator: { select: { username: true, name: true } },
  titleA: true,
  titleB: true,
  votes: { select: { userId: true, choice: true } },
} satisfies Prisma.VersusInclude;

type VersusRow = Prisma.VersusGetPayload<{ include: typeof versusInclude }>;

async function assertWatchedBoth(userId: string, titleAId: string, titleBId: string): Promise<Set<string>> {
  const watchedIds = await getWatchedTitleIds(userId, [titleAId, titleBId]);
  if (!watchedIds.has(titleAId) || !watchedIds.has(titleBId)) {
    throw AppError.forbidden('Você precisa ter assistido aos dois filmes para isso.');
  }
  return watchedIds;
}

export async function createVersus(creatorId: string, input: CreateVersusInput): Promise<VersusSummary> {
  const creator = await prisma.user.findUniqueOrThrow({
    where: { id: creatorId },
    select: { email: true, entitlement: true },
  });
  if (!computeIsPremium(creator)) {
    const activeCount = await prisma.versus.count({
      where: { creatorId, closesAt: { gt: new Date() } },
    });
    if (activeCount >= FREE_ACTIVE_VERSUS_LIMIT) {
      throw new AppError(
        403,
        'versus_limit_reached',
        'Free permite só 1 Filme Versus ativo por vez. Assine o Premium para criar sem limite.',
      );
    }
  }

  const [titleA, titleB] = await Promise.all([
    ensureTitleCached(input.titleAKey),
    ensureTitleCached(input.titleBKey),
  ]);

  const watchedIds = await assertWatchedBoth(creatorId, titleA.id, titleB.id);

  const created: VersusRow = await prisma.versus.create({
    data: {
      creatorId,
      titleAId: titleA.id,
      titleBId: titleB.id,
      question: input.question,
      closesAt: new Date(Date.now() + VERSUS_DURATION_HOURS * 3_600_000),
    },
    include: versusInclude,
  });

  await createActivity(creatorId, { type: 'versus_created', versusId: created.id });

  return toVersusSummary(created, creatorId, watchedIds);
}

export async function getVersus(id: string, viewerId: string): Promise<VersusSummary> {
  const row = await prisma.versus.findUnique({ where: { id }, include: versusInclude });
  if (!row) throw AppError.notFound('Versus não encontrado.');

  const watchedIds = await getWatchedTitleIds(viewerId, [row.titleA.id, row.titleB.id]);
  return toVersusSummary(row, viewerId, watchedIds);
}

export async function voteVersus(
  id: string,
  voterId: string,
  input: VoteVersusInput,
): Promise<VersusSummary> {
  const row = await prisma.versus.findUnique({ where: { id }, include: versusInclude });
  if (!row) throw AppError.notFound('Versus não encontrado.');

  if (Date.now() >= row.closesAt.getTime()) {
    throw AppError.badRequest('Esse Versus já foi encerrado.');
  }

  const watchedIds = await assertWatchedBoth(voterId, row.titleA.id, row.titleB.id);

  if (row.votes.some((v) => v.userId === voterId)) {
    throw AppError.conflict('already_voted', 'Você já votou nesse Versus.');
  }

  await prisma.versusVote.create({ data: { versusId: id, userId: voterId, choice: input.choice } });
  await createActivity(voterId, { type: 'versus_voted', versusId: id });
  await createNotification({
    recipientId: row.creatorId,
    actorId: voterId,
    type: 'versus_vote',
    versusId: id,
  });

  const updated = await prisma.versus.findUniqueOrThrow({ where: { id }, include: versusInclude });
  return toVersusSummary(updated, voterId, watchedIds);
}
