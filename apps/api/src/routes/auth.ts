import type { FastifyInstance } from 'fastify';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type AuthResponse,
  type AuthTokens,
} from '@cena/shared';
import {
  getMe,
  loginUser,
  logout,
  refreshTokens,
  registerUser,
} from '../services/authService';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const input = registerSchema.parse(request.body);
    const result: AuthResponse = await registerUser(app, input);
    return reply.status(201).send(result);
  });

  app.post('/auth/login', async (request) => {
    const input = loginSchema.parse(request.body);
    const result: AuthResponse = await loginUser(app, input);
    return result;
  });

  app.post('/auth/refresh', async (request) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    const tokens: AuthTokens = await refreshTokens(app, refreshToken);
    return tokens;
  });

  app.post('/auth/logout', async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body);
    await logout(refreshToken);
    return reply.status(204).send();
  });

  app.get('/auth/me', { preHandler: [app.authenticate] }, async (request) => {
    return getMe(request.userId);
  });
}
