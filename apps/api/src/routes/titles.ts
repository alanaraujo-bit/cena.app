import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { parseTitleKey, setWatchStateSchema, titleKeySchema } from '@cena/shared';
import { searchTitles, titleDetail, trendingTitles } from '../services/titleService';
import { getTitleStatus, getWatchCounts, setWatchState } from '../services/watchService';

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Informe um termo de busca.'),
  page: z.coerce.number().int().min(1).max(1000).default(1),
});

const keyParamSchema = z.object({ key: titleKeySchema });

export async function titleRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  app.get('/titles/search', async (request) => {
    const { q, page } = searchQuerySchema.parse(request.query);
    return searchTitles(q, page);
  });

  app.get('/titles/trending', async () => {
    return { items: await trendingTitles() };
  });

  app.get('/titles/counts', async (request) => {
    return getWatchCounts(request.userId);
  });

  app.get('/titles/:key', async (request) => {
    const { key } = keyParamSchema.parse(request.params);
    const { mediaType, tmdbId } = parseTitleKey(key);
    return titleDetail(mediaType, tmdbId);
  });

  app.get('/titles/:key/status', async (request) => {
    const { key } = keyParamSchema.parse(request.params);
    return getTitleStatus(request.userId, key);
  });

  app.post('/titles/watch', async (request) => {
    const input = setWatchStateSchema.parse(request.body);
    return setWatchState(request.userId, input);
  });
}
