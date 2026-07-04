import type { FastifyInstance } from 'fastify';
import { equipFrameSchema, giftFrameSchema } from '@cena/shared';
import { equipFrame, giftFrame, listFrames } from '../services/frameService';

export async function frameRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/frames', async (request) => listFrames(request.userId));

  app.post('/frames/equip', async (request, reply) => {
    const { frameId } = equipFrameSchema.parse(request.body);
    await equipFrame(request.userId, frameId);
    return reply.status(204).send();
  });

  app.post('/frames/gift', async (request, reply) => {
    const input = giftFrameSchema.parse(request.body);
    await giftFrame(request.userId, input);
    return reply.status(204).send();
  });
}
