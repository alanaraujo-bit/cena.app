import type { Title } from '@prisma/client';
import type { TitleSummary } from '@cena/shared';

export function toTitleSummary(title: Title): TitleSummary {
  return {
    key: title.key,
    tmdbId: title.tmdbId,
    mediaType: title.mediaType as TitleSummary['mediaType'],
    title: title.title,
    year: title.year,
    overview: title.overview,
    posterUrl: title.posterUrl,
    backdropUrl: title.backdropUrl,
    voteAverage: title.voteAverage,
    popularity: title.popularity,
  };
}
