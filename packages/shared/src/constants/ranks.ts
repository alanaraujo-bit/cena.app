/**
 * Ordem Cinéfila — the six cinephile ranks, in ascending order.
 * This ordering is load-bearing for promotion/demotion logic; do not reorder.
 */
export const CINEPHILE_RANKS = [
  'espectador',
  'apreciador',
  'cinetico',
  'cinefilo',
  'curador',
  'arquiteto',
] as const;

export type CinephileRank = (typeof CINEPHILE_RANKS)[number];

/** Public-facing labels (pt-BR) shown on the profile. */
export const CINEPHILE_RANK_LABELS: Record<CinephileRank, string> = {
  espectador: 'Espectador',
  apreciador: 'Apreciador',
  cinetico: 'Cinético',
  cinefilo: 'Cinéfilo',
  curador: 'Curador',
  arquiteto: 'Arquiteto do Cinema',
};

/** The four weighted axes that compose the Índice Cinéfilo Global (ICG). */
export const ICG_AXES = ['volume', 'diversidade', 'profundidade', 'consistencia'] as const;
export type IcgAxis = (typeof ICG_AXES)[number];

/** Axis weights — must sum to 1. Tuned deliberately; see §5.5 of the brief. */
export const ICG_AXIS_WEIGHTS: Record<IcgAxis, number> = {
  volume: 0.25,
  diversidade: 0.3,
  profundidade: 0.3,
  consistencia: 0.15,
};
