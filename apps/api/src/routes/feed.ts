import type { FastifyInstance } from 'fastify';
import { paginationQuerySchema } from '@cena/shared';
import { getFeed } from '../services/activityService';

export async function feedRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/feed', async (request) => {
    const { cursor, limit } = paginationQuerySchema.parse(request.query);
    return getFeed(request.userId, cursor, limit);
  });
}
