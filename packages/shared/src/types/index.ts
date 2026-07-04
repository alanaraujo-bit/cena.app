import type { CinephileRank, IcgAxis } from '../constants/ranks';

/** Per-axis ICG breakdown, each normalized 0–1. */
export type IcgAxisScores = Record<IcgAxis, number>;

/** Cached Ordem Cinéfila result surfaced on the profile. */
export interface CinephileOrder {
  rank: CinephileRank;
  /** Índice Cinéfilo Global, 0–1. */
  icg: number;
  axes: IcgAxisScores;
  /** The currently weakest axis — drives the actionable next-step hint. */
  weakestAxis: IcgAxis;
  calculatedAt: string;
}

/** Standard error envelope returned by the API on non-2xx. */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
