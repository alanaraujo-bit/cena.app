import type {
  OnboardingStatus,
  OnboardingStepInput,
  UpdateGenresInput,
  UpdateLevelInput,
} from '@cena/shared';
import { prisma } from '../db';
import { AppError } from '../lib/errors';

/** Ensure a row exists (defensive — register creates one, but be resilient). */
async function ensure(userId: string) {
  return prisma.onboardingCompletion.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

function toStatus(row: {
  level: OnboardingStatus['level'];
  favoriteGenres: number[];
  notificationsPrimed: boolean;
  seededTitles: boolean;
  followedFounder: boolean;
  completed: boolean;
}): OnboardingStatus {
  return {
    level: row.level,
    favoriteGenres: row.favoriteGenres,
    notificationsPrimed: row.notificationsPrimed,
    seededTitles: row.seededTitles,
    followedFounder: row.followedFounder,
    completed: row.completed,
  };
}

export async function getStatus(userId: string): Promise<OnboardingStatus> {
  return toStatus(await ensure(userId));
}

export async function setLevel(userId: string, input: UpdateLevelInput): Promise<OnboardingStatus> {
  await ensure(userId);
  return toStatus(
    await prisma.onboardingCompletion.update({
      where: { userId },
      data: { level: input.level },
    }),
  );
}

export async function setGenres(
  userId: string,
  input: UpdateGenresInput,
): Promise<OnboardingStatus> {
  await ensure(userId);
  return toStatus(
    await prisma.onboardingCompletion.update({
      where: { userId },
      data: { favoriteGenres: input.genres },
    }),
  );
}

export async function setStep(
  userId: string,
  input: OnboardingStepInput,
): Promise<OnboardingStatus> {
  await ensure(userId);
  return toStatus(
    await prisma.onboardingCompletion.update({
      where: { userId },
      data: { [input.step]: input.value },
    }),
  );
}

export async function complete(userId: string): Promise<OnboardingStatus> {
  const row = await ensure(userId);
  if (!row.level) {
    throw AppError.badRequest('Escolha seu nível cinéfilo antes de concluir.');
  }
  return toStatus(
    await prisma.onboardingCompletion.update({
      where: { userId },
      data: { completed: true, completedAt: new Date() },
    }),
  );
}
