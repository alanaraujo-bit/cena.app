import type { FastifyInstance } from 'fastify';
import { createVersusSchema, idSchema, voteVersusSchema } from '@cena/shared';
import { z } from 'zod';
import { createVersus, getVersus, voteVersus } from '../services/versusService';

const idParamSchema = z.object({ id: idSchema });

export async function versusRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/versus', async (request) => {
    const input = createVersusSchema.parse(request.body);
    return createVersus(request.userId, input);
  });

  app.get('/versus/:id', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return getVersus(id, request.userId);
  });

  app.post('/versus/:id/vote', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const input = voteVersusSchema.parse(request.body);
    return voteVersus(id, request.userId, input);
  });
}
