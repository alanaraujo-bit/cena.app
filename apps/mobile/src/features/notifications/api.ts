import type { NotificationsResponse } from '@cena/shared';
import { api } from '@/lib/api';

export const notificationsApi = {
  list: (cursor?: string) =>
    api.get<NotificationsResponse>(
      `/notifications${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`,
    ),
  markRead: (id: string) => api.post<void>(`/notifications/${id}/read`),
  markAllRead: () => api.post<void>('/notifications/read-all'),
  registerPushToken: (token: string, platform: 'ios' | 'android') =>
    api.post<void>('/push-tokens', { token, platform }),
  unregisterPushToken: (token: string) => api.delete<void>('/push-tokens', { body: { token } }),
};
