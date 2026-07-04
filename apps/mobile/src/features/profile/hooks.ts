import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdateProfileInput } from '@cena/shared';
import { profileApi } from './api';

export function useProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => profileApi.get(username as string),
    enabled: !!username,
    staleTime: 30_000,
  });
}

export function useUpdateProfile(username: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileApi.update(input),
    onSuccess: () => {
      if (username) void qc.invalidateQueries({ queryKey: ['profile', username] });
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => profileApi.favorites(),
    staleTime: 30_000,
  });
}

export function useAddFavorite(username: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => profileApi.addFavorite(key),
    onSuccess: (data) => {
      qc.setQueryData(['favorites'], data);
      if (username) void qc.invalidateQueries({ queryKey: ['profile', username] });
    },
  });
}

export function useRemoveFavorite(username: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => profileApi.removeFavorite(key),
    onSuccess: (data) => {
      qc.setQueryData(['favorites'], data);
      if (username) void qc.invalidateQueries({ queryKey: ['profile', username] });
    },
  });
}
