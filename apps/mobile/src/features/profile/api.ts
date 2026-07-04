import type { PublicProfile, TitleSummary, UpdateProfileInput } from '@cena/shared';
import { api } from '@/lib/api';

export const profileApi = {
  get: (username: string) => api.get<PublicProfile>(`/users/${encodeURIComponent(username)}`),
  update: (input: UpdateProfileInput) =>
    api.patch<{ name: string; bio: string | null }>('/users/me', input),
  favorites: () => api.get<TitleSummary[]>('/favorites'),
  addFavorite: (key: string) => api.post<TitleSummary[]>('/favorites', { key }),
  removeFavorite: (key: string) => api.delete<TitleSummary[]>(`/favorites/${encodeURIComponent(key)}`),
};
