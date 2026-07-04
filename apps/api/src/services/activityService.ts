import type { Prisma } from '@prisma/client';
import type {
  ActivityItem,
  Comment as CommentDto,
  CreateCommentInput,
  FeedResponse,
} from '@cena/shared';
import { prisma } from '../db';
import { AppError } from '../lib/errors';
import { createNotification } from './notificationService';

type SupportedActivityType = 'watched' | 'want_to_watch' | 'rating';

/** Fire-and-forget style creation used by watchService on state transitions. */
export async function createActivity(
  userId: string,
  type: SupportedActivityType,
  titleId: string,
  rating?: number | null,
): Promise<void> {
  await prisma.activity.create({
    data: { userId, type, titleId, rating: rating ?? null },
  });
}

const activityInclude = {
  user: { select: { username: true, name: true, avatarUrl: true } },
  title: true,
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.ActivityInclude;

type ActivityRow = Prisma.ActivityGetPayload<{ include: typeof activityInclude }>;

function toActivityItem(row: ActivityRow, likedActivityIds: Set<string>): ActivityItem {
  return {
    id: row.id,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    user: row.user,
    title: row.title
      ? {
          key: row.title.key,
          tmdbId: row.title.tmdbId,
          mediaType: row.title.mediaType,
          title: row.title.title,
          year: row.title.year,
          overview: row.title.overview,
          posterUrl: row.title.posterUrl,
          backdropUrl: row.title.backdropUrl,
          voteAverage: row.title.voteAverage,
          popularity: row.title.popularity,
        }
      : null,
    rating: row.rating,
    likeCount: row._count.likes,
    commentCount: row._count.comments,
    likedByMe: likedActivityIds.has(row.id),
  };
}

export async function getFeed(
  viewerId: string,
  cursor: string | undefined,
  limit: number,
): Promise<FeedResponse> {
  const following = await prisma.follow.findMany({
    where: { followerId: viewerId, status: 'accepted' },
    select: { followingId: true },
  });
  const followingIds = following.map((f) => f.followingId);

  if (followingIds.length === 0) {
    return { items: [], nextCursor: null };
  }

  const rows = await prisma.activity.findMany({
    where: { userId: { in: followingIds } },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: activityInclude,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  const likes = await prisma.like.findMany({
    where: { userId: viewerId, activityId: { in: page.map((r) => r.id) } },
    select: { activityId: true },
  });
  const likedIds = new Set(likes.map((l) => l.activityId));

  return {
    items: page.map((row) => toActivityItem(row, likedIds)),
    nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
  };
}

async function getActivityOwnerId(activityId: string): Promise<string> {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { userId: true },
  });
  if (!activity) throw AppError.notFound('Atividade não encontrada.');
  return activity.userId;
}

export async function likeActivity(userId: string, activityId: string): Promise<void> {
  const ownerId = await getActivityOwnerId(activityId);

  const existing = await prisma.like.findUnique({
    where: { userId_activityId: { userId, activityId } },
  });
  if (existing) return;

  await prisma.like.create({ data: { userId, activityId } });
  await createNotification({ recipientId: ownerId, actorId: userId, type: 'like', activityId });
}

export async function unlikeActivity(userId: string, activityId: string): Promise<void> {
  await prisma.like.deleteMany({ where: { userId, activityId } });
}

export async function addComment(
  userId: string,
  activityId: string,
  input: CreateCommentInput,
): Promise<CommentDto> {
  const ownerId = await getActivityOwnerId(activityId);
  const comment = await prisma.comment.create({
    data: { userId, activityId, body: input.body },
    include: { user: { select: { username: true, name: true, avatarUrl: true } } },
  });
  await createNotification({
    recipientId: ownerId,
    actorId: userId,
    type: 'comment',
    activityId,
    commentPreview: input.body.length > 140 ? `${input.body.slice(0, 140)}…` : input.body,
  });
  return {
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt.toISOString(),
    user: comment.user,
  };
}

export async function listComments(activityId: string): Promise<CommentDto[]> {
  await getActivityOwnerId(activityId);
  const rows = await prisma.comment.findMany({
    where: { activityId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { username: true, name: true, avatarUrl: true } } },
  });
  return rows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    user: c.user,
  }));
}
