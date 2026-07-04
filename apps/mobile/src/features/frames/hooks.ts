import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { framesApi } from './api';

const FRAMES_KEY = ['frames'] as const;

export function useFrames() {
  return useQuery({
    queryKey: FRAMES_KEY,
    queryFn: () => framesApi.list(),
    staleTime: 15_000,
  });
}

export function useEquipFrame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (frameId: string) => framesApi.equip(frameId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: FRAMES_KEY });
      void qc.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useGiftFrame() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ frameId, username }: { frameId: string; username: string }) =>
      framesApi.gift(frameId, username),
    onSuccess: () => void qc.invalidateQueries({ queryKey: FRAMES_KEY }),
  });
}
