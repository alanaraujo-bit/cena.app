/** RevenueCat entitlement identifier configured in the RevenueCat dashboard. */
export const REVENUECAT_ENTITLEMENT_ID = 'premium';

/**
 * Placeholder product identifiers — replace once the real subscription
 * products exist in App Store Connect / Google Play Console and are attached
 * to the "premium" entitlement in RevenueCat. Single monthly tier for now.
 */
export const PREMIUM_PRODUCT_IDS = {
  monthly: 'cena_premium_mensal',
} as const;

/** Free tier's cap on concurrently-open self-created Filme Versus polls. */
export const FREE_ACTIVE_VERSUS_LIMIT = 1;
