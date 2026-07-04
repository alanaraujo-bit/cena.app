import type { Comment as CommentDto, CreateCommentInput, FeedResponse } from '@cena/shared';
import { api } from '@/lib/api';

export const feedApi = {
  get: (cursor?: string) =>
    api.get<FeedResponse>(`/feed${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`),
  like: (activityId: string) => api.post<void>(`/activities/${activityId}/like`),
  unlike: (activityId: string) => api.delete<void>(`/activities/${activityId}/like`),
  listComments: (activityId: string) => api.get<CommentDto[]>(`/activities/${activityId}/comments`),
  addComment: (activityId: string, input: CreateCommentInput) =>
    api.post<CommentDto>(`/activities/${activityId}/comments`, input),
};
