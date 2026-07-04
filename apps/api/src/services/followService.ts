import type { FollowRelationship, FollowRequest } from '@cena/shared';
import { prisma } from '../db';
import { AppError } from '../lib/errors';

async function findUserByUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  if (!user) throw AppError.notFound('Usuário não encontrado.');
  return user;
}

export async function getRelationship(
  viewerId: string,
  ownerId: string,
): Promise<FollowRelationship> {
  if (viewerId === ownerId) return 'self';
  const edge = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: viewerId, followingId: ownerId } },
    select: { status: true },
  });
  return edge?.status ?? 'none';
}

/** Both directions must be an accepted follow — the "apenas amigos" gate. */
export async function isMutual(aId: string, bId: string): Promise<boolean> {
  const [aToB, bToA] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: aId, followingId: bId } },
      select: { status: true },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: bId, followingId: aId } },
      select: { status: true },
    }),
  ]);
  return aToB?.status === 'accepted' && bToA?.status === 'accepted';
}

export async function getFollowCounts(
  userId: string,
): Promise<{ followers: number; following: number }> {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId, status: 'accepted' } }),
    prisma.follow.count({ where: { followerId: userId, status: 'accepted' } }),
  ]);
  return { followers, following };
}

export async function follow(
  viewerId: string,
  targetUsername: string,
): Promise<FollowRelationship> {
  const target = await findUserByUsername(targetUsername);
  if (target.id === viewerId) {
    throw AppError.badRequest('Você não pode seguir a si mesmo.');
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: viewerId, followingId: target.id } },
  });
  if (existing) return existing.status;

  const status = target.privacyMode === 'privado' ? 'pending' : 'accepted';
  await prisma.follow.create({
    data: { followerId: viewerId, followingId: target.id, status },
  });
  return status;
}

export async function unfollow(viewerId: string, targetUsername: string): Promise<void> {
  const target = await findUserByUsername(targetUsername);
  await prisma.follow.deleteMany({ where: { followerId: viewerId, followingId: target.id } });
}

export async function listPendingRequests(ownerId: string): Promise<FollowRequest[]> {
  const rows = await prisma.follow.findMany({
    where: { followingId: ownerId, status: 'pending' },
    orderBy: { createdAt: 'asc' },
    include: { follower: { select: { username: true, name: true, avatarUrl: true } } },
  });
  return rows.map((r) => ({
    username: r.follower.username,
    name: r.follower.name,
    avatarUrl: r.follower.avatarUrl,
    requestedAt: r.createdAt.toISOString(),
  }));
}

export async function acceptRequest(ownerId: string, requesterUsername: string): Promise<void> {
  const requester = await findUserByUsername(requesterUsername);
  const result = await prisma.follow.updateMany({
    where: { followerId: requester.id, followingId: ownerId, status: 'pending' },
    data: { status: 'accepted', respondedAt: new Date() },
  });
  if (result.count === 0) throw AppError.notFound('Solicitação não encontrada.');
}

export async function declineRequest(ownerId: string, requesterUsername: string): Promise<void> {
  const requester = await findUserByUsername(requesterUsername);
  await prisma.follow.deleteMany({
    where: { followerId: requester.id, followingId: ownerId, status: 'pending' },
  });
}
