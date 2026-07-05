import type { FastifyInstance } from 'fastify';
import { syncPurchaseSchema } from '@cena/shared';
import { getAdvancedStats } from '../services/statsService';
import { getStatus, syncFromClient } from '../services/subscriptionService';

export async function premiumRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/premium/status', async (request) => getStatus(request.userId));

  app.post('/premium/sync', async (request) => {
    const input = syncPurchaseSchema.parse(request.body);
    return syncFromClient(request.userId, input);
  });

  app.get('/premium/stats/advanced', async (request) => getAdvancedStats(request.userId));
}
