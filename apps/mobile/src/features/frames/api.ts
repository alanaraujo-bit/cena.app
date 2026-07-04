import type { FrameLibraryResponse } from '@cena/shared';
import { api } from '@/lib/api';

export const framesApi = {
  list: () => api.get<FrameLibraryResponse>('/frames'),
  equip: (frameId: string) => api.post<void>('/frames/equip', { frameId }),
  gift: (frameId: string, username: string) => api.post<void>('/frames/gift', { frameId, username }),
};
