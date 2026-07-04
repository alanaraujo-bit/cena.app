import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { API_VERSION } from '@cena/shared';
import { env } from './env';
import { healthRoutes } from './routes/health';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger:
      env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { translateTime: 'SYS:HH:MM:ss' } } }
        : true,
  });

  await app.register(helmet, { global: true });
  await app.register(cors, {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  // Unversioned uptime probe (used by hosting platforms).
  await app.register(healthRoutes);

  // Versioned API surface. Feature routes get registered under /v1 here as
  // milestones land (auth, titles, feed, users, ranking, versus, frames…).
  await app.register(
    async (v1) => {
      await v1.register(healthRoutes);
    },
    { prefix: `/${API_VERSION}` },
  );

  return app;
}
