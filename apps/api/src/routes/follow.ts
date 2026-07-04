import type { FastifyInstance } from 'fastify';
import { usernameSchema } from '@cena/shared';
import { z } from 'zod';
import {
  acceptRequest,
  declineRequest,
  follow,
  listPendingRequests,
  unfollow,
} from '../services/followService';

const usernameParamSchema = z.object({ username: usernameSchema });

export async function followRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/users/:username/follow', async (request) => {
    const { username } = usernameParamSchema.parse(request.params);
    const relationship = await follow(request.userId, username);
    return { relationship };
  });

  app.delete('/users/:username/follow', async (request, reply) => {
    const { username } = usernameParamSchema.parse(request.params);
    await unfollow(request.userId, username);
    return reply.status(204).send();
  });

  app.post('/users/:username/follow/accept', async (request, reply) => {
    const { username } = usernameParamSchema.parse(request.params);
    await acceptRequest(request.userId, username);
    return reply.status(204).send();
  });

  app.post('/users/:username/follow/decline', async (request, reply) => {
    const { username } = usernameParamSchema.parse(request.params);
    await declineRequest(request.userId, username);
    return reply.status(204).send();
  });

  app.get('/follow-requests', async (request) => listPendingRequests(request.userId));
}
