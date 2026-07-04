import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createCommentSchema, idSchema } from '@cena/shared';
import { addComment, likeActivity, listComments, unlikeActivity } from '../services/activityService';

const idParamSchema = z.object({ id: idSchema });

export async function activityRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.post('/activities/:id/like', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await likeActivity(request.userId, id);
    return reply.status(204).send();
  });

  app.delete('/activities/:id/like', async (request, reply) => {
    const { id } = idParamSchema.parse(request.params);
    await unlikeActivity(request.userId, id);
    return reply.status(204).send();
  });

  app.get('/activities/:id/comments', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    return listComments(id);
  });

  app.post('/activities/:id/comments', async (request) => {
    const { id } = idParamSchema.parse(request.params);
    const input = createCommentSchema.parse(request.body);
    return addComment(request.userId, id, input);
  });
}
