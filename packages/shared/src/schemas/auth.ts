import { z } from 'zod';
import {
  displayNameSchema,
  emailSchema,
  idSchema,
  passwordSchema,
  usernameSchema,
} from './common';

export const registerSchema = z.object({
  name: displayNameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  /** Accepts either e-mail or username in a single field. */
  identifier: z.string().min(1, 'Informe seu e-mail ou nome de usuário'),
  password: z.string().min(1, 'Informe sua senha'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  /** Access-token lifetime in seconds, so the client can schedule refresh. */
  expiresIn: z.number().int().positive(),
});
export type AuthTokens = z.infer<typeof authTokensSchema>;

export const authUserSchema = z.object({
  id: idSchema,
  name: displayNameSchema,
  username: usernameSchema,
  email: emailSchema,
  avatarUrl: z.string().url().nullable(),
  onboardingCompleted: z.boolean(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const authResponseSchema = z.object({
  user: authUserSchema,
  tokens: authTokensSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
