import { z } from 'zod';
import { NOTIFICATION_TYPES } from '../constants/enums';
import { idSchema, paginatedSchema } from './common';
import { frameEffectSchema } from './frames';
import { activityAuthorSchema } from './social';
import { titleSummarySchema } from './titles';

export const notificationTypeSchema = z.enum(NOTIFICATION_TYPES);

/** Only these are actually produced today; the rest of the enum is reserved. */
export const supportedNotificationTypeSchema = z.enum([
  'like',
  'comment',
  'new_follower',
  'follow_request',
  'follow_accepted',
  'frame_gift',
]);
export type SupportedNotificationType = z.infer<typeof supportedNotificationTypeSchema>;

export const notificationItemSchema = z.object({
  id: idSchema,
  type: notificationTypeSchema,
  createdAt: z.string(),
  read: z.boolean(),
  actor: activityAuthorSchema,
  activity: z
    .object({
      id: idSchema,
      title: titleSummarySchema.nullable(),
    })
    .nullable(),
  commentPreview: z.string().nullable(),
  frame: z
    .object({
      key: z.string(),
      name: z.string(),
      effect: frameEffectSchema,
      colors: z.array(z.string()),
    })
    .nullable(),
});
export type NotificationItem = z.infer<typeof notificationItemSchema>;

export const notificationsResponseSchema = paginatedSchema(notificationItemSchema).extend({
  unreadCount: z.number().int(),
});
export type NotificationsResponse = z.infer<typeof notificationsResponseSchema>;

export const registerPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['ios', 'android']),
});
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;

export const unregisterPushTokenSchema = z.object({
  token: z.string().min(1),
});
export type UnregisterPushTokenInput = z.infer<typeof unregisterPushTokenSchema>;
