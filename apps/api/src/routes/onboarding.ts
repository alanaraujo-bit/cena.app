import type { FastifyInstance } from 'fastify';
import { onboardingStepSchema, updateGenresSchema, updateLevelSchema } from '@cena/shared';
import {
  complete,
  getStatus,
  setGenres,
  setLevel,
  setStep,
} from '../services/onboardingService';

export async function onboardingRoutes(app: FastifyInstance) {
  // All onboarding routes require an authenticated user.
  app.addHook('preHandler', app.authenticate);

  app.get('/onboarding/status', async (request) => getStatus(request.userId));

  app.patch('/onboarding/level', async (request) =>
    setLevel(request.userId, updateLevelSchema.parse(request.body)),
  );

  app.patch('/onboarding/genres', async (request) =>
    setGenres(request.userId, updateGenresSchema.parse(request.body)),
  );

  app.patch('/onboarding/step', async (request) =>
    setStep(request.userId, onboardingStepSchema.parse(request.body)),
  );

  app.post('/onboarding/complete', async (request) => complete(request.userId));
}
