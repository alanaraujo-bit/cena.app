import type { Prisma } from '@prisma/client';
import type { NotificationItem, NotificationsResponse, SupportedNotificationType } from '@cena/shared';
import { prisma } from '../db';
import { sendExpoPushNotifications } from '../lib/push';

const actorSelect = { username: true, name: true, avatarUrl: true } satisfies Prisma.UserSelect;

const notificationInclude = {
  actor: { select: actorSelect },
  activity: { select: { id: true, title: true } },
} satisfies Prisma.NotificationInclude;

type NotificationRow = Prisma.NotificationGetPayload<{ include: typeof notificationInclude }>;

function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    type: row.type,
    createdAt: row.createdAt.toISOString(),
    read: row.read,
    actor: row.actor,
    activity: row.activity
      ? {
          id: row.activity.id,
          title: row.activity.title
            ? {
                key: row.activity.title.key,
                tmdbId: row.activity.title.tmdbId,
                mediaType: row.activity.title.mediaType,
                title: row.activity.title.title,
                year: row.activity.title.year,
                overview: row.activity.title.overview,
                posterUrl: row.activity.title.posterUrl,
                backdropUrl: row.activity.title.backdropUrl,
                voteAverage: row.activity.title.voteAverage,
                popularity: row.activity.title.popularity,
              }
            : null,
        }
      : null,
    commentPreview: row.commentPreview,
  };
}

function pushCopyFor(
  type: SupportedNotificationType,
  actorName: string,
  commentPreview?: string | null,
): { title: string; body: string } {
  switch (type) {
    case 'new_follower':
      return { title: 'Novo seguidor', body: `${actorName} começou a seguir você.` };
    case 'follow_request':
      return { title: 'Solicitação para seguir', body: `${actorName} quer seguir você.` };
    case 'follow_accepted':
      return { title: 'Solicitação aceita', body: `${actorName} aceitou sua solicitação para seguir.` };
    case 'like':
      return { title: 'Nova curtida', body: `${actorName} curtiu sua atividade.` };
    case 'comment':
      return {
        title: 'Novo comentário',
        body: commentPreview ? `${actorName}: "${commentPreview}"` : `${actorName} comentou na sua atividade.`,
      };
  }
}

interface CreateNotificationInput {
  recipientId: string;
  actorId: string;
  type: SupportedNotificationType;
  activityId?: string;
  commentPreview?: string;
}

/** Persists the in-app notification, then best-effort fans it out as a push. */
export async function createNotification(input: CreateNotificationInput): Promise<void> {
  if (input.recipientId === input.actorId) return;

  const [actor] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: input.actorId }, select: { name: true } }),
  ]);

  await prisma.notification.create({
    data: {
      recipientId: input.recipientId,
      actorId: input.actorId,
      type: input.type,
      activityId: input.activityId,
      commentPreview: input.commentPreview,
    },
  });

  const tokens = await prisma.pushToken.findMany({
    where: { userId: input.recipientId },
    select: { token: true },
  });
  if (tokens.length === 0) return;

  const { title, body } = pushCopyFor(input.type, actor.name, input.commentPreview);
  await sendExpoPushNotifications(
    tokens.map((t) => ({ to: t.token, title, body, data: { type: input.type } })),
  );
}

export async function listNotifications(
  userId: string,
  cursor: string | undefined,
  limit: number,
): Promise<NotificationsResponse> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: notificationInclude,
    }),
    prisma.notification.count({ where: { recipientId: userId, read: false } }),
  ]);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;

  return {
    items: page.map(toNotificationItem),
    nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
    unreadCount,
  };
}

export async function markRead(userId: string, notificationId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { id: notificationId, recipientId: userId },
    data: { read: true, readAt: new Date() },
  });
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

export async function registerPushToken(
  userId: string,
  token: string,
  platform: string,
): Promise<void> {
  await prisma.pushToken.upsert({
    where: { token },
    create: { userId, token, platform },
    update: { userId, platform, lastSeenAt: new Date() },
  });
}

export async function unregisterPushToken(userId: string, token: string): Promise<void> {
  await prisma.pushToken.deleteMany({ where: { userId, token } });
}
