import type { FollowRelationship, FollowRequest } from '@cena/shared';
import { api } from '@/lib/api';

export const followApi = {
  follow: (username: string) =>
    api.post<{ relationship: FollowRelationship }>(`/users/${encodeURIComponent(username)}/follow`),
  unfollow: (username: string) => api.delete<void>(`/users/${encodeURIComponent(username)}/follow`),
  accept: (username: string) => api.post<void>(`/users/${encodeURIComponent(username)}/follow/accept`),
  decline: (username: string) => api.post<void>(`/users/${encodeURIComponent(username)}/follow/decline`),
  pendingRequests: () => api.get<FollowRequest[]>('/follow-requests'),
};
