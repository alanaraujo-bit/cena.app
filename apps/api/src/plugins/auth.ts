import fastifyJwt from '@fastify/jwt';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../env';
import { AppError } from '../lib/errors';

/** Shape of the access-token payload. */
export interface AccessTokenPayload {
  sub: string; // user id
}

declare module 'fastify' {
  interface FastifyInstance {
    /** preHandler guard for protected routes. Rejects with 401 when invalid. */
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    /** Present only after `authenticate` runs. */
    userId: string;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AccessTokenPayload;
    user: AccessTokenPayload;
  }
}

export const authPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: env.ACCESS_TOKEN_TTL },
  });

  app.decorate('authenticate', async (request: FastifyRequest) => {
    try {
      const payload = await request.jwtVerify<AccessTokenPayload>();
      request.userId = payload.sub;
    } catch {
      throw AppError.unauthorized();
    }
  });
});
