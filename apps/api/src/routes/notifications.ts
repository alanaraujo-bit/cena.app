import type { FastifyInstance } from 'fastify';
import { idSchema, paginationQuerySchema, registerPushTokenSchema, unregisterPushTokenSchema } from '@cena/shared';
import { z } from 'zod';
import {
  listNotifications,
  markAllRead,
  markRead,
  registerPushToken,
  unregisterPushToken,
} from '../services/notificationService';

const idParamSchema = z.object({ id: idSchema });

export async function notificationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/notifications', async (request) => {
    const { cursor, limit } = paginationQuerySchema.parse(request.query);
    return listNotifications(request.userId, cursor, limit);
  });

  app.post('/notifications/:id/read', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await markRead(request.userId, id);
    return reply.status(204).send();
  });

  app.post('/notifications/read-all', async (request, reply) => {
    await markAllRead(request.userId);
    return reply.status(204).send();
  });

  app.post('/push-tokens', async (request, reply) => {
    const { token, platform } = registerPushTokenSchema.parse(request.body);
    await registerPushToken(request.userId, token, platform);
    return reply.status(204).send();
  });

  app.delete('/push-tokens', async (request, reply) => {
    const { token } = unregisterPushTokenSchema.parse(request.body);
    await unregisterPushToken(request.userId, token);
    return reply.status(204).send();
  });
}
