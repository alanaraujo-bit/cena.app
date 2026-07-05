import type { AdvancedStats, PremiumStatus, SyncPurchaseInput } from '@cena/shared';
import { api } from '@/lib/api';

export const premiumApi = {
  status: () => api.get<PremiumStatus>('/premium/status'),
  sync: (input: SyncPurchaseInput) => api.post<PremiumStatus>('/premium/sync', input),
  advancedStats: () => api.get<AdvancedStats>('/premium/stats/advanced'),
};
