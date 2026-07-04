import type { FastifyInstance } from 'fastify';
import type { HealthResponse } from '@cena/shared';

const startedAt = Date.now();

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async (): Promise<HealthResponse> => {
    return {
      status: 'ok',
      service: 'cena-api',
      version: process.env.npm_package_version ?? '0.1.0',
      uptime: Math.floor((Date.now() - startedAt) / 1000),
      timestamp: new Date().toISOString(),
    };
  });
}
