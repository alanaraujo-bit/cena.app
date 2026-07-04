import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ActivityItem, CreateCommentInput, FeedResponse } from '@cena/shared';
import { feedApi } from './api';

const FEED_KEY = ['feed'] as const;

export function useFeed() {
  return useInfiniteQuery({
    queryKey: FEED_KEY,
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => feedApi.get(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: FeedResponse) => lastPage.nextCursor ?? undefined,
    staleTime: 15_000,
  });
}

type FeedCache = { pages: FeedResponse[]; pageParams: unknown[] };

function mapActivity(
  data: FeedCache | undefined,
  activityId: string,
  map: (item: ActivityItem) => ActivityItem,
): FeedCache | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      items: page.items.map((item) => (item.id === activityId ? map(item) : item)),
    })),
  };
}

export function useToggleLike() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, liked }: { activityId: string; liked: boolean }) =>
      liked ? feedApi.unlike(activityId) : feedApi.like(activityId),
    onMutate: async ({ activityId, liked }) => {
      await qc.cancelQueries({ queryKey: FEED_KEY });
      const previous = qc.getQueryData<FeedCache>(FEED_KEY);
      qc.setQueryData<FeedCache>(FEED_KEY, (data) =>
        mapActivity(data, activityId, (item) => ({
          ...item,
          likedByMe: !liked,
          likeCount: item.likeCount + (liked ? -1 : 1),
        })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) qc.setQueryData(FEED_KEY, context.previous);
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: FEED_KEY });
    },
  });
}

export function useComments(activityId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['comments', activityId],
    queryFn: () => feedApi.listComments(activityId),
    enabled,
  });
}

export function useAddComment(activityId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCommentInput) => feedApi.addComment(activityId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['comments', activityId] });
      qc.setQueryData<FeedCache>(FEED_KEY, (data) =>
        mapActivity(data, activityId, (item) => ({ ...item, commentCount: item.commentCount + 1 })),
      );
    },
  });
}
