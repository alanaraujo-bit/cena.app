import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { API_VERSION } from '@cena/shared';
import { prisma } from './db';
import { env } from './env';
import { errorHandler } from './lib/errors';
import { authPlugin } from './plugins/auth';
import { activityRoutes } from './routes/activities';
import { authRoutes } from './routes/auth';
import { feedRoutes } from './routes/feed';
import { followRoutes } from './routes/follow';
import { frameRoutes } from './routes/frames';
import { healthRoutes } from './routes/health';
import { notificationRoutes } from './routes/notifications';
import { onboardingRoutes } from './routes/onboarding';
import { premiumRoutes } from './routes/premium';
import { profileRoutes } from './routes/profile';
import { rankingRoutes } from './routes/ranking';
import { revenueCatWebhookRoutes } from './routes/revenuecatWebhook';
import { titleRoutes } from './routes/titles';
import { versusRoutes } from './routes/versus';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss' } } }
        : true,
  });

  app.setErrorHandler(errorHandler);

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  await app.register(authPlugin);

  // Unversioned uptime probe (used by hosting platforms).
  await app.register(healthRoutes);

  // Versioned API surface. Feature routes get registered under /v1 here as
  // milestones land (titles, feed, users, ranking, versus, frames…).
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
      await v1.register(authRoutes);
      await v1.register(onboardingRoutes);
      await v1.register(titleRoutes);
      await v1.register(profileRoutes);
      await v1.register(followRoutes);
      await v1.register(feedRoutes);
      await v1.register(activityRoutes);
      await v1.register(rankingRoutes);
      await v1.register(notificationRoutes);
      await v1.register(frameRoutes);
      await v1.register(versusRoutes);
      await v1.register(premiumRoutes);
      await v1.register(revenueCatWebhookRoutes);
    },
    { prefix: `/${API_VERSION}` },
  );

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
