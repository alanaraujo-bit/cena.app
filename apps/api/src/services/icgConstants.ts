/**
 * Tuning constants for the Índice Cinéfilo Global (ICG) — brief §5.5.
 * Kept in one file so the "magic numbers" behind the algorithm are auditable
 * in a single place rather than scattered through icgService.
 */

/** Max watched entries per calendar day that count toward the score. */
export const DAILY_COUNT_CAP = 4;

/** Volume axis: log-scale denominator (titles at which volume saturates). */
export const VOLUME_SATURATION = 500;

/** Diversity axis: normalization denominators. */
export const GENRE_DENOM = 20;
export const COUNTRY_DENOM = 35;
export const DECADE_DENOM = 10;
/** Above this share of a single genre, diversity is penalized. */
export const GENRE_CONCENTRATION_THRESHOLD = 0.45;

/** Depth axis. */
export const PRE_1980_YEAR = 1980;
export const LONG_RUNTIME_MINUTES = 150;
/** TMDB popularity below this is treated as "non-mainstream". */
export const NON_MAINSTREAM_POPULARITY = 15;
export const AUTEUR_DENOM = 15;
/** Rating-gaming guard: needs at least this many ratings to evaluate. */
export const RATING_GAMING_MIN_COUNT = 10;
export const RATING_GAMING_MIN_DISTINCT = 3;
/** Variance (0–25 scale²) below this, with enough ratings, looks artificial. */
export const RATING_GAMING_MIN_VARIANCE = 0.15;
export const RATING_GAMING_PENALTY = 0.6;

/** Consistency axis. */
export const CONSISTENCY_STREAK_TARGET_MONTHS = 12;
export const CONSISTENCY_AVG_MONTHLY_TARGET = 8;
export const CONSISTENCY_MONTHLY_CAP = 12;

/** Cache window: recompute at most this often. */
export const RECOMPUTE_WINDOW_HOURS = 6;

/** Rank promotion tenure/history gates, indexed like CINEPHILE_RANKS. */
export interface RankGate {
  minAccountAgeMonths: number;
  minCountedTitles: number;
  minConsecutiveActiveMonths: number;
}
export const RANK_GATES: Record<number, RankGate> = {
  5: { minAccountAgeMonths: 18, minCountedTitles: 260, minConsecutiveActiveMonths: 8 },
  4: { minAccountAgeMonths: 10, minCountedTitles: 140, minConsecutiveActiveMonths: 5 },
  3: { minAccountAgeMonths: 5, minCountedTitles: 60, minConsecutiveActiveMonths: 3 },
};

/** Score thresholds (inclusive lower bound) mapping ICG → rank index. */
export const RANK_SCORE_THRESHOLDS = [0, 0.15, 0.35, 0.55, 0.72, 0.88];

/** Days of inactivity required before a demotion is allowed. */
export const DEMOTION_INACTIVITY_DAYS = 60;
