import type { FastifyInstance } from 'fastify';
import type { User } from '@prisma/client';
import type { AuthResponse, AuthTokens, LoginInput, RegisterInput } from '@cena/shared';
import { prisma } from '../db';
import { env } from '../env';
import {
  generateRefreshToken,
  hashPassword,
  sha256,
  verifyPassword,
} from '../lib/crypto';
import { durationToSeconds } from '../lib/duration';
import { AppError } from '../lib/errors';

const ACCESS_TTL_SECONDS = durationToSeconds(env.ACCESS_TOKEN_TTL);
const REFRESH_TTL_SECONDS = durationToSeconds(env.REFRESH_TOKEN_TTL);

function toAuthUser(user: User, onboardingCompleted: boolean): AuthResponse['user'] {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    onboardingCompleted,
  };
}

/** Issue an access JWT + a fresh, DB-backed refresh token. */
async function issueTokens(app: FastifyInstance, userId: string): Promise<AuthTokens> {
  const accessToken = app.jwt.sign({ sub: userId });

  const refreshToken = generateRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    },
  });

  return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SECONDS };
}

export async function registerUser(
  app: FastifyInstance,
  input: RegisterInput,
): Promise<AuthResponse> {
  const email = input.email.toLowerCase().trim();
  const username = input.username.toLowerCase().trim();

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });
  if (existing?.email === email) {
    throw AppError.conflict('email_taken', 'Este e-mail já está em uso.');
  }
  if (existing?.username === username) {
    throw AppError.conflict('username_taken', 'Este nome de usuário já está em uso.');
  }

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      username,
      email,
      passwordHash: await hashPassword(input.password),
      onboarding: { create: {} },
    },
  });

  const tokens = await issueTokens(app, user.id);
  return { user: toAuthUser(user, false), tokens };
}

export async function loginUser(app: FastifyInstance, input: LoginInput): Promise<AuthResponse> {
  const identifier = input.identifier.toLowerCase().trim();
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    include: { onboarding: { select: { completed: true } } },
  });

  // Constant-ish response: verify against a real-or-dummy hash either way.
  const ok = user
    ? await verifyPassword(user.passwordHash, input.password)
    : await verifyPassword(
        '$argon2id$v=19$m=65536,t=3,p=4$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        input.password,
      );

  if (!user || !ok) {
    throw AppError.unauthorized('E-mail/usuário ou senha incorretos.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } });
  const tokens = await issueTokens(app, user.id);
  return { user: toAuthUser(user, user.onboarding?.completed ?? false), tokens };
}

/**
 * Rotate a refresh token: the presented token is revoked and a new one issued.
 * If a token that's already revoked is presented, we treat it as reuse/theft
 * and revoke the whole chain for that user.
 */
export async function refreshTokens(app: FastifyInstance, rawToken: string): Promise<AuthTokens> {
  const tokenHash = sha256(rawToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record) throw AppError.unauthorized();

  if (record.revokedAt || record.expiresAt < new Date()) {
    // Reuse of a revoked/expired token → nuke all sessions for safety.
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw AppError.unauthorized('Sessão expirada. Faça login novamente.');
  }

  const newRaw = generateRefreshToken();
  const newHash = sha256(newRaw);

  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { tokenHash },
      data: { revokedAt: new Date(), replacedByHash: newHash },
    }),
    prisma.refreshToken.create({
      data: {
        userId: record.userId,
        tokenHash: newHash,
        expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
      },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { lastActiveAt: new Date() },
    }),
  ]);

  return {
    accessToken: app.jwt.sign({ sub: record.userId }),
    refreshToken: newRaw,
    expiresIn: ACCESS_TTL_SECONDS,
  };
}

export async function logout(rawToken: string): Promise<void> {
  const tokenHash = sha256(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Fetch the authenticated user for /me. */
export async function getMe(userId: string): Promise<AuthResponse['user']> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { onboarding: { select: { completed: true } } },
  });
  if (!user) throw AppError.unauthorized();
  return toAuthUser(user, user.onboarding?.completed ?? false);
}
