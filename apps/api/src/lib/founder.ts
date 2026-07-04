import { env } from '../env';

/** The operator's own account owns every frame and is the only one that can gift staff frames. */
export function isFounderEmail(email: string): boolean {
  return !!env.FOUNDER_EMAIL && email.toLowerCase() === env.FOUNDER_EMAIL.toLowerCase();
}
