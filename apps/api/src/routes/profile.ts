import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { addFavoriteSchema, updateProfileSchema, usernameSchema } from '@cena/shared';
import {
  addFavorite,
  getPublicProfile,
  listFavorites,
  removeFavorite,
  updateProfile,
} from '../services/profileService';

const usernameParamSchema = z.object({ username: usernameSchema });
const favoriteKeyParamSchema = z.object({ key: z.string() });

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/users/:username', async (request) => {
    const { username } = usernameParamSchema.parse(request.params);
    return getPublicProfile(username, request.userId);
  });

  app.patch('/users/me', async (request) => {
    const input = updateProfileSchema.parse(request.body);
    return updateProfile(request.userId, input);
  });

  app.get('/favorites', async (request) => listFavorites(request.userId));

  app.post('/favorites', async (request) => {
    const input = addFavoriteSchema.parse(request.body);
    return addFavorite(request.userId, input);
  });

  app.delete('/favorites/:key', async (request) => {
    const { key } = favoriteKeyParamSchema.parse(request.params);
    return removeFavorite(request.userId, key);
  });
}
