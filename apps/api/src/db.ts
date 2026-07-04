import { PrismaClient } from '@prisma/client';
import { env } from './env';

/** Single PrismaClient across the process (avoids connection exhaustion). */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
