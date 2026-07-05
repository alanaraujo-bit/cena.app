import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { REVENUECAT_ENTITLEMENT_ID } from '@cena/shared';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '';

let configured = false;

/**
 * react-native-purchases needs real native code linked at build time — it
 * cannot run inside Expo Go (`appOwnership === 'expo'`), only in a custom EAS
 * dev client/build. Everything in this module is a safe no-op until then, so
 * the rest of the app keeps working unmodified under Expo Go.
 */
export function isPurchasesAvailable(): boolean {
  if (Constants.appOwnership === 'expo') return false;
  return Platform.OS === 'ios' ? !!IOS_API_KEY : !!ANDROID_API_KEY;
}

/** Call once, right after the user is known to be authenticated (mirrors usePushTokenSync). */
export function configurePurchases(appUserId: string): void {
  if (!isPurchasesAvailable() || configured) return;
  try {
    const apiKey = Platform.OS === 'ios' ? IOS_API_KEY : ANDROID_API_KEY;
    Purchases.configure({ apiKey, appUserID: appUserId });
    configured = true;
  } catch {
    // Native module unavailable for some other reason — premium stays disabled.
  }
}

/** Best-effort — clears RevenueCat's local identity so the next login on this device starts clean. */
export async function logOutPurchases(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
    configured = false;
  } catch {
    // ignore
  }
}

export async function getMonthlyPackage(): Promise<PurchasesPackage | null> {
  if (!isPurchasesAvailable()) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.monthly ?? null;
  } catch {
    return null;
  }
}

export async function purchaseMonthly(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (err) {
    if ((err as { userCancelled?: boolean }).userCancelled) return null;
    throw err;
  }
}

export async function restorePurchases(): Promise<CustomerInfo | null> {
  if (!isPurchasesAvailable()) return null;
  try {
    return await Purchases.restorePurchases();
  } catch {
    return null;
  }
}

export function isEntitlementActive(info: CustomerInfo): boolean {
  return !!info.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
}
