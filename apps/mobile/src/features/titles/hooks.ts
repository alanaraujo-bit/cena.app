import { useEffect, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SetWatchStateInput, TitleSocialStatus } from '@cena/shared';
import { titlesApi } from './api';

/** Debounce a rapidly-changing value (search box). */
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useSearchTitles(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ['titles', 'search', q],
    queryFn: () => titlesApi.search(q),
    enabled: q.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

export function useTrending() {
  return useQuery({
    queryKey: ['titles', 'trending'],
    queryFn: () => titlesApi.trending(),
    staleTime: 30 * 60_000,
  });
}

export function useTitleDetail(key: string) {
  return useQuery({
    queryKey: ['titles', 'detail', key],
    queryFn: () => titlesApi.detail(key),
    staleTime: 30 * 60_000,
  });
}

export function useWatchCounts() {
  return useQuery({
    queryKey: ['titles', 'counts'],
    queryFn: () => titlesApi.counts(),
    staleTime: 30_000,
  });
}

/** The caller's own "assistido" list — the picker source for Filme Versus creation. */
export function useMyWatchedTitles() {
  return useQuery({
    queryKey: ['titles', 'watched'],
    queryFn: () => titlesApi.watched(),
    staleTime: 30_000,
  });
}

export function useTitleStatus(key: string) {
  return useQuery({
    queryKey: ['titles', 'status', key],
    queryFn: () => titlesApi.status(key),
  });
}

/** Set/clear watch state with an optimistic update and rollback on failure. */
export function useSetWatchState(key: string) {
  const qc = useQueryClient();
  const statusKey = ['titles', 'status', key];

  return useMutation({
    mutationFn: (input: SetWatchStateInput) => titlesApi.setWatchState(input),
    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: statusKey });
      const previous = qc.getQueryData<TitleSocialStatus>(statusKey);
      qc.setQueryData<TitleSocialStatus>(statusKey, {
        watchState: input.state,
        rating: input.state === 'assistido' ? (input.rating ?? previous?.rating ?? null) : null,
        watchedAt:
          input.state === 'assistido'
            ? (previous?.watchedAt ?? new Date().toISOString())
            : null,
      });
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous !== undefined) qc.setQueryData(statusKey, context.previous);
    },
    onSuccess: (data) => {
      qc.setQueryData(statusKey, data);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['titles', 'counts'] });
    },
  });
}
