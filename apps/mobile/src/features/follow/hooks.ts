import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FollowRelationship, PublicProfile } from '@cena/shared';
import { followApi } from './api';

/** Follow, unfollow, or cancel a pending request — one toggle based on current relationship. */
export function useFollowToggle(username: string) {
  const qc = useQueryClient();
  const profileKey = ['profile', username];

  return useMutation({
    mutationFn: async (current: FollowRelationship) => {
      if (current === 'none') return followApi.follow(username);
      await followApi.unfollow(username);
      return { relationship: 'none' as const };
    },
    onMutate: async (current) => {
      await qc.cancelQueries({ queryKey: profileKey });
      const previous = qc.getQueryData<PublicProfile>(profileKey);
      const optimistic: FollowRelationship = current === 'none' ? 'pending' : 'none';
      qc.setQueryData<PublicProfile>(profileKey, (data) =>
        data
          ? {
              ...data,
              relationship: optimistic,
              followersCount: data.followersCount + (optimistic === 'none' ? -1 : 1),
            }
          : data,
      );
      return { previous };
    },
    onSuccess: (result) => {
      qc.setQueryData<PublicProfile>(profileKey, (data) =>
        data ? { ...data, relationship: result.relationship } : data,
      );
      void qc.invalidateQueries({ queryKey: profileKey });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(profileKey, context.previous);
    },
  });
}

export function usePendingRequests() {
  return useQuery({
    queryKey: ['follow-requests'],
    queryFn: () => followApi.pendingRequests(),
    staleTime: 15_000,
  });
}

export function useRespondToRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ username, accept }: { username: string; accept: boolean }) =>
      accept ? followApi.accept(username) : followApi.decline(username),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['follow-requests'] });
    },
  });
}
