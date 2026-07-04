import { z } from 'zod';
import { RATING_MAX, RATING_MIN, RATING_STEP } from '../constants/enums';

/** A CUID/ULID-style id. Kept as a branded string for clarity across the API. */
export const idSchema = z.string().min(1).max(64);

export const usernameSchema = z
  .string()
  .min(3, 'Nome de usuário muito curto')
  .max(30, 'Nome de usuário muito longo')
  .regex(/^[a-z0-9_.]+$/, 'Use apenas letras minúsculas, números, "." e "_"');

export const emailSchema = z.string().email('E-mail inválido').max(254);

export const passwordSchema = z
  .string()
  .min(8, 'A senha precisa de pelo menos 8 caracteres')
  .max(128, 'Senha muito longa');

export const displayNameSchema = z.string().min(1, 'Informe seu nome').max(60);

/** 0–10 rating in half steps. */
export const ratingSchema = z
  .number()
  .min(RATING_MIN)
  .max(RATING_MAX)
  .refine((v) => Math.round(v / RATING_STEP) * RATING_STEP === v, {
    message: `A nota deve variar de ${RATING_STEP} em ${RATING_STEP}`,
  });

/** Cursor pagination envelope reused across list endpoints. */
export const paginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function paginatedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
}
