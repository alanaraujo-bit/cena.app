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
import { toTitleSummary } from './titleMapper';
import { toVersusSummary } from './versusMapper';

type SupportedActivityType = 'watched' | 'want_to_watch' | 'rating' | 'versus_created' | 'versus_voted';

interface CreateActivityInput {
  type: SupportedActivityType;
  titleId?: string;
  rating?: number | null;
  versusId?: string;
}

/** Fire-and-forget style creation used by watchService/versusService on meaningful transitions. */
export async function createActivity(userId: string, input: CreateActivityInput): Promise<void> {
  await prisma.activity.create({
    data: {
      userId,
      type: input.type,
      titleId: input.titleId,
      rating: input.rating ?? null,
      versusId: input.versusId,
    },
  });
}

const authorSelect = {
  username: true,
  name: true,
  avatarUrl: true,
  activeFrame: { select: { key: true, effect: true, colors: true } },
} satisfies Prisma.UserSelect;

const versusInclude = {
  creator: { select: { username: true, name: true } },
  titleA: true,
  titleB: true,
  votes: { select: { userId: true, choice: true } },
} satisfies Prisma.VersusInclude;

const activityInclude = {
  user: { select: authorSelect },
  title: true,
  versus: { include: versusInclude },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.ActivityInclude;

type ActivityRow = Prisma.ActivityGetPayload<{ include: typeof activityInclude }>;

/** Batch-checks which of the given titles the user has marked "assistido" — kept local (not
 * imported from watchService) to avoid a circular import, since watchService imports createActivity. */
async function getWatchedTitleIdsBatch(userId: string, titleIds: string[]): Promise<Set<string>> {
  if (titleIds.length === 0) return new Set();
  const rows = await prisma.watchEntry.findMany({
    where: { userId, state: 'assistido', titleId: { in: titleIds } },
    select: { titleId: true },
  });
  return new Set(rows.map((r) => r.titleId));
}

function toActivityItem(
  row: ActivityRow,
  likedActivityIds: Set<string>,
  viewerId: string,
  watchedTitleIds: Set<string>,
): ActivityItem {
  return {
    id: row.id,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    user: row.user,
    title: row.title ? toTitleSummary(row.title) : null,
    rating: row.rating,
    versus: row.versus ? toVersusSummary(row.versus, viewerId, watchedTitleIds) : null,
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

  const versusTitleIds = new Set<string>();
  for (const row of page) {
    if (row.versus) {
      versusTitleIds.add(row.versus.titleA.id);
      versusTitleIds.add(row.versus.titleB.id);
    }
  }
  const watchedTitleIds = await getWatchedTitleIdsBatch(viewerId, [...versusTitleIds]);

  return {
    items: page.map((row) => toActivityItem(row, likedIds, viewerId, watchedTitleIds)),
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
    include: { user: { select: authorSelect } },
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
    include: { user: { select: authorSelect } },
  });
  return rows.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    user: c.user,
  }));
}
