import type { FastifyInstance } from 'fastify';
import { env } from '../env';
import { AppError } from '../lib/errors';
import { handleRevenueCatEvent } from '../services/subscriptionService';

/** Minimal shape we actually read — RevenueCat's payload carries many more fields. */
interface RevenueCatWebhookBody {
  event?: {
    id?: string;
    type?: string;
    app_user_id?: string;
    product_id?: string;
    store?: string;
    environment?: string;
    expiration_at_ms?: number | null;
  };
}

/**
 * RevenueCat webhook receiver — not gated by our own JWT auth (it's a
 * server-to-server call from RevenueCat), instead validated against a shared
 * secret. Configure the exact string `Bearer <REVENUECAT_WEBHOOK_SECRET>` as
 * the "Authorization header value" in the RevenueCat dashboard's webhook
 * settings.
 */
export async function revenueCatWebhookRoutes(app: FastifyInstance) {
  app.post('/webhooks/revenuecat', async (request, reply) => {
    const expected = env.REVENUECAT_WEBHOOK_SECRET;
    if (expected && request.headers.authorization !== `Bearer ${expected}`) {
      throw AppError.unauthorized('Assinatura de webhook inválida.');
    }

    const event = (request.body as RevenueCatWebhookBody).event;
    if (!event?.id || !event.type || !event.app_user_id) {
      return reply.status(400).send({ error: { code: 'bad_request', message: 'Payload inválido.' } });
    }

    await handleRevenueCatEvent({
      id: event.id,
      type: event.type,
      appUserId: event.app_user_id,
      productId: event.product_id,
      store: event.store,
      environment: event.environment,
      expiresAtMs: event.expiration_at_ms ?? null,
    });

    return reply.status(200).send({ ok: true });
  });
}
