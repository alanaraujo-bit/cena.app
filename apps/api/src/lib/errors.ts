import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import type { ApiError } from '@cena/shared';

/** A domain error that maps cleanly to an HTTP status + stable error code. */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError(400, 'bad_request', message, details);
  }
  static unauthorized(message = 'Sessão inválida ou expirada.') {
    return new AppError(401, 'unauthorized', message);
  }
  static forbidden(message = 'Você não tem permissão para isso.') {
    return new AppError(403, 'forbidden', message);
  }
  static notFound(message = 'Não encontrado.') {
    return new AppError(404, 'not_found', message);
  }
  static conflict(code: string, message: string) {
    return new AppError(409, code, message);
  }
}

/** Centralized error handler producing the standard ApiError envelope. */
export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    const body: ApiError = {
      error: {
        code: 'validation_error',
        message: 'Dados inválidos.',
        details: error.flatten().fieldErrors,
      },
    };
    return reply.status(400).send(body);
  }

  if (error instanceof AppError) {
    const body: ApiError = {
      error: { code: error.code, message: error.message, details: error.details },
    };
    return reply.status(error.statusCode).send(body);
  }

  // Fastify's own validation / rate-limit / etc. carry a statusCode.
  if (typeof error.statusCode === 'number' && error.statusCode < 500) {
    const body: ApiError = {
      error: { code: error.code ?? 'request_error', message: error.message },
    };
    return reply.status(error.statusCode).send(body);
  }

  request.log.error(error);
  const body: ApiError = {
    error: { code: 'internal_error', message: 'Algo deu errado. Tente novamente.' },
  };
  return reply.status(500).send(body);
}
