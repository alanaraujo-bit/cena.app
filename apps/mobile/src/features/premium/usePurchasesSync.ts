import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { REVENUECAT_ENTITLEMENT_ID } from '@cena/shared';
import type { CustomerInfo } from 'react-native-purchases';
import Purchases from 'react-native-purchases';
import { configurePurchases, isPurchasesAvailable } from '@/lib/purchases';
import { premiumApi } from './api';

function mapStore(store: string): 'app_store' | 'play_store' | undefined {
  if (store === 'APP_STORE' || store === 'MAC_APP_STORE') return 'app_store';
  if (store === 'PLAY_STORE') return 'play_store';
  return undefined;
}

/**
 * Configures RevenueCat on boot (mirrors usePushTokenSync) and pushes any
 * entitlement change straight to our backend as soon as the SDK notices it —
 * the webhook stays the authoritative source of truth; this is just a fast
 * local nudge so the UI doesn't wait on webhook delivery latency.
 */
export function usePurchasesSync(enabled: boolean, userId: string | undefined): void {
  const qc = useQueryClient();

  useEffect(() => {
    if (!enabled || !userId || !isPurchasesAvailable()) return;

    configurePurchases(userId);

    const handleUpdate = (info: CustomerInfo) => {
      const entitlement = info.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
      void premiumApi
        .sync({
          active: !!entitlement,
          productId: entitlement?.productIdentifier,
          store: entitlement ? mapStore(entitlement.store) : undefined,
          expiresAtMs: entitlement?.expirationDate ? new Date(entitlement.expirationDate).getTime() : null,
          willRenew: entitlement?.willRenew,
        })
        .then(() => {
          void qc.invalidateQueries({ queryKey: ['premium'] });
          void qc.invalidateQueries({ queryKey: ['frames'] });
        })
        .catch(() => {
          // best-effort — the webhook will reconcile eventually
        });
    };

    Purchases.addCustomerInfoUpdateListener(handleUpdate);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(handleUpdate);
    };
  }, [enabled, userId, qc]);
}
