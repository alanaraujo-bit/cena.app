import type {
  SearchResults,
  SetWatchStateInput,
  TitleDetail,
  TitleSocialStatus,
  TitleSummary,
} from '@cena/shared';
import { api } from '@/lib/api';

export const titlesApi = {
  search: (q: string, page = 1) =>
    api.get<SearchResults>(`/titles/search?q=${encodeURIComponent(q)}&page=${page}`),
  trending: () => api.get<{ items: TitleSummary[] }>('/titles/trending'),
  detail: (key: string) => api.get<TitleDetail>(`/titles/${key}`),
  status: (key: string) => api.get<TitleSocialStatus>(`/titles/${key}/status`),
  setWatchState: (input: SetWatchStateInput) =>
    api.post<TitleSocialStatus>('/titles/watch', input),
  counts: () =>
    api.get<{ assistido: number; assistindo: number; para_assistir: number }>('/titles/counts'),
};
