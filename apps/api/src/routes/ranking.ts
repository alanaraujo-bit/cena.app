import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { rankingWindowSchema } from '@cena/shared';
import { getLeaderboard } from '../services/rankingService';

const rankingQuerySchema = z.object({
  window: rankingWindowSchema.default('semana'),
});

export async function rankingRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/ranking', async (request) => {
    const { window } = rankingQuerySchema.parse(request.query);
    return getLeaderboard(request.userId, window);
  });
}
