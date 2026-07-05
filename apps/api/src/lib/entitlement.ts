import type { EntitlementTier } from '@cena/shared';
import { isFounderEmail } from './founder';

/** The founder account is always treated as Premium (it already owns everything). */
export function computeIsPremium(user: { email: string; entitlement: EntitlementTier }): boolean {
  return isFounderEmail(user.email) || user.entitlement === 'premium';
}

/** Strips the internal email/entitlement fields, replacing them with the derived `isPremium` flag. */
export function toAuthorDto<T extends { email: string; entitlement: EntitlementTier }>(
  user: T,
): Omit<T, 'email' | 'entitlement'> & { isPremium: boolean } {
  const { email, entitlement, ...rest } = user;
  return { ...rest, isPremium: computeIsPremium({ email, entitlement }) };
}
