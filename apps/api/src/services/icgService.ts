import { CINEPHILE_RANKS, ICG_AXIS_WEIGHTS, type CinephileOrder, type IcgAxis } from '@cena/shared';
import { prisma } from '../db';
import {
  AUTEUR_DENOM,
  COUNTRY_DENOM,
  DAILY_COUNT_CAP,
  DECADE_DENOM,
  DEMOTION_INACTIVITY_DAYS,
  GENRE_CONCENTRATION_THRESHOLD,
  GENRE_DENOM,
  LONG_RUNTIME_MINUTES,
  NON_MAINSTREAM_POPULARITY,
  PRE_1980_YEAR,
  RANK_GATES,
  RANK_SCORE_THRESHOLDS,
  RATING_GAMING_MIN_COUNT,
  RATING_GAMING_MIN_DISTINCT,
  RATING_GAMING_MIN_VARIANCE,
  RATING_GAMING_PENALTY,
  RECOMPUTE_WINDOW_HOURS,
  CONSISTENCY_AVG_MONTHLY_TARGET,
  CONSISTENCY_MONTHLY_CAP,
  CONSISTENCY_STREAK_TARGET_MONTHS,
  VOLUME_SATURATION,
} from './icgConstants';

const NEXT_STEP_HINTS: Record<IcgAxis, string> = {
  volume: 'Assista mais alguns títulos para avançar nesse eixo.',
  diversidade: 'Explore gêneros, países e décadas diferentes dos que você já viu.',
  profundidade: 'Inclua clássicos, filmes mais longos ou fora do mainstream na sua jornada.',
  consistencia: 'Mantenha um ritmo mais regular de sessões ao longo dos meses.',
};

interface CountedEntry {
  watchedAt: Date;
  rating: number | null;
  mediaType: string;
  year: number | null;
  runtimeMinutes: number | null;
  popularity: number;
  genreIds: number[];
  countries: string[];
  director: string | null;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function monthIndex(date: Date): number {
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

/** Longest run of consecutive calendar months, ending at the most recent one. */
function consecutiveStreak(sortedUniqueMonthIndices: number[]): number {
  if (sortedUniqueMonthIndices.length === 0) return 0;
  let streak = 1;
  for (let i = sortedUniqueMonthIndices.length - 1; i > 0; i--) {
    if (sortedUniqueMonthIndices[i]! - sortedUniqueMonthIndices[i - 1]! === 1) streak++;
    else break;
  }
  return streak;
}

function mean(nums: number[]): number {
  return nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
}

function variance(nums: number[]): number {
  if (nums.length === 0) return 0;
  const m = mean(nums);
  return mean(nums.map((n) => (n - m) ** 2));
}

/**
 * Apply the daily-logging cap (brief §5.5 anti-gaming): at most N entries per
 * calendar day count toward the score, so mass-logging a backlog can't
 * inflate Volume in one sitting.
 */
function applyDailyCap(entries: CountedEntry[]): CountedEntry[] {
  const perDay = new Map<string, number>();
  const counted: CountedEntry[] = [];
  for (const entry of entries) {
    const dayKey = entry.watchedAt.toISOString().slice(0, 10);
    const soFar = perDay.get(dayKey) ?? 0;
    if (soFar >= DAILY_COUNT_CAP) continue;
    perDay.set(dayKey, soFar + 1);
    counted.push(entry);
  }
  return counted;
}

function computeVolume(countedTotal: number): number {
  return clamp01(Math.log(1 + countedTotal) / Math.log(1 + VOLUME_SATURATION));
}

function computeDiversity(entries: CountedEntry[]): number {
  if (entries.length === 0) return 0;

  const genreCounts = new Map<number, number>();
  let totalGenreTags = 0;
  const countries = new Set<string>();
  const decades = new Set<number>();

  for (const e of entries) {
    for (const g of e.genreIds) {
      genreCounts.set(g, (genreCounts.get(g) ?? 0) + 1);
      totalGenreTags += 1;
    }
    for (const c of e.countries) countries.add(c);
    if (e.year) decades.add(Math.floor(e.year / 10) * 10);
  }

  const genreScore = Math.min(genreCounts.size / GENRE_DENOM, 1);
  const countryScore = Math.min(countries.size / COUNTRY_DENOM, 1);
  const decadeScore = Math.min(decades.size / DECADE_DENOM, 1);
  const raw = (genreScore + countryScore + decadeScore) / 3;

  const maxGenreShare =
    totalGenreTags === 0 ? 0 : Math.max(...genreCounts.values()) / totalGenreTags;
  const penalty =
    maxGenreShare > GENRE_CONCENTRATION_THRESHOLD
      ? clamp01(1 - (maxGenreShare - GENRE_CONCENTRATION_THRESHOLD) * 2)
      : 1;

  return clamp01(raw * Math.max(penalty, 0.5));
}

function computeDepth(entries: CountedEntry[]): number {
  const total = entries.length;
  if (total === 0) return 0;

  const pre1980Ratio = entries.filter((e) => e.year !== null && e.year < PRE_1980_YEAR).length / total;
  const longRuntimeRatio =
    entries.filter((e) => e.runtimeMinutes !== null && e.runtimeMinutes >= LONG_RUNTIME_MINUTES)
      .length / total;
  const nonMainstreamRatio =
    entries.filter((e) => e.popularity < NON_MAINSTREAM_POPULARITY).length / total;
  const uniqueDirectors = new Set(entries.filter((e) => e.director).map((e) => e.director));
  const auteurScore = Math.min(uniqueDirectors.size / AUTEUR_DENOM, 1);

  const raw = (pre1980Ratio + longRuntimeRatio + nonMainstreamRatio + auteurScore) / 4;

  const ratings = entries.map((e) => e.rating).filter((r): r is number => r !== null);
  const distinctRatings = new Set(ratings).size;
  const ratingVariance = variance(ratings);
  const looksGamed =
    ratings.length >= RATING_GAMING_MIN_COUNT &&
    (distinctRatings < RATING_GAMING_MIN_DISTINCT || ratingVariance < RATING_GAMING_MIN_VARIANCE);

  return clamp01(raw * (looksGamed ? RATING_GAMING_PENALTY : 1));
}

interface ConsistencyResult {
  score: number;
  consecutiveActiveMonths: number;
}

function computeConsistency(entries: CountedEntry[]): ConsistencyResult {
  if (entries.length === 0) return { score: 0, consecutiveActiveMonths: 0 };

  const countsByMonth = new Map<number, number>();
  for (const e of entries) {
    const idx = monthIndex(e.watchedAt);
    countsByMonth.set(idx, (countsByMonth.get(idx) ?? 0) + 1);
  }
  const sortedMonths = [...countsByMonth.keys()].sort((a, b) => a - b);
  const rawCounts = sortedMonths.map((m) => countsByMonth.get(m)!);

  const streak = consecutiveStreak(sortedMonths);
  const streakScore = Math.min(streak / CONSISTENCY_STREAK_TARGET_MONTHS, 1);

  const cappedCounts = rawCounts.map((c) => Math.min(c, CONSISTENCY_MONTHLY_CAP));
  const avgCapped = mean(cappedCounts);
  const avgScore = Math.min(avgCapped / CONSISTENCY_AVG_MONTHLY_TARGET, 1);

  const rawMean = mean(rawCounts);
  const stdDev = Math.sqrt(variance(rawCounts));
  const cv = rawMean > 0 ? stdDev / rawMean : 0;
  const evennessScore = clamp01(1 - cv / 2);

  const score = clamp01((streakScore + avgScore + evennessScore) / 3);
  return { score, consecutiveActiveMonths: streak };
}

function scoreToRankIndex(icg: number): number {
  let idx = 0;
  for (let i = 0; i < RANK_SCORE_THRESHOLDS.length; i++) {
    if (icg >= RANK_SCORE_THRESHOLDS[i]!) idx = i;
  }
  return idx;
}

/** Walk a promotion target down until its tenure/history gate is satisfied. */
function applyRankGates(
  targetIndex: number,
  ctx: { accountAgeMonths: number; countedTotal: number; consecutiveActiveMonths: number },
): number {
  let idx = targetIndex;
  while (idx > 2) {
    const gate = RANK_GATES[idx];
    if (!gate) break;
    const satisfied =
      ctx.accountAgeMonths >= gate.minAccountAgeMonths &&
      ctx.countedTotal >= gate.minCountedTitles &&
      ctx.consecutiveActiveMonths >= gate.minConsecutiveActiveMonths;
    if (satisfied) break;
    idx -= 1;
  }
  return idx;
}

/** Rate-limit rank movement: at most one step per recompute; demotion also
 * requires a real inactivity window. */
function determineNewRankIndex(
  currentIndex: number,
  gatedTargetIndex: number,
  daysSinceLastActive: number,
): number {
  if (gatedTargetIndex > currentIndex) return currentIndex + 1;
  if (gatedTargetIndex < currentIndex && daysSinceLastActive >= DEMOTION_INACTIVITY_DAYS) {
    return currentIndex - 1;
  }
  return currentIndex;
}

function toDto(row: {
  rank: string;
  icg: number;
  volumeScore: number;
  diversityScore: number;
  depthScore: number;
  consistencyScore: number;
  weakestAxis: string;
  calculatedAt: Date;
}): CinephileOrder {
  const weakestAxis = row.weakestAxis as IcgAxis;
  return {
    rank: row.rank as CinephileOrder['rank'],
    icg: row.icg,
    axes: {
      volume: row.volumeScore,
      diversidade: row.diversityScore,
      profundidade: row.depthScore,
      consistencia: row.consistencyScore,
    },
    weakestAxis,
    nextStepHint: NEXT_STEP_HINTS[weakestAxis],
    calculatedAt: row.calculatedAt.toISOString(),
  };
}

export async function getCinephileOrder(userId: string): Promise<CinephileOrder> {
  const existing = await prisma.cinephileOrder.findUnique({ where: { userId } });

  const isFresh =
    existing && Date.now() - existing.calculatedAt.getTime() < RECOMPUTE_WINDOW_HOURS * 3_600_000;
  if (isFresh) return toDto(existing);

  const [user, rawEntries] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { createdAt: true } }),
    prisma.watchEntry.findMany({
      where: { userId, state: 'assistido', watchedAt: { not: null } },
      orderBy: { watchedAt: 'asc' },
      select: {
        watchedAt: true,
        rating: true,
        title: {
          select: {
            mediaType: true,
            year: true,
            runtimeMinutes: true,
            popularity: true,
            genreIds: true,
            countries: true,
            director: true,
          },
        },
      },
    }),
  ]);

  const entries: CountedEntry[] = rawEntries.map((e) => ({
    watchedAt: e.watchedAt!,
    rating: e.rating,
    mediaType: e.title.mediaType,
    year: e.title.year,
    runtimeMinutes: e.title.runtimeMinutes,
    popularity: e.title.popularity,
    genreIds: e.title.genreIds,
    countries: e.title.countries,
    director: e.title.director,
  }));

  const counted = applyDailyCap(entries);

  const volumeScore = computeVolume(counted.length);
  const diversityScore = computeDiversity(counted);
  const depthScore = computeDepth(counted);
  const { score: consistencyScore, consecutiveActiveMonths } = computeConsistency(counted);

  const icg =
    volumeScore * ICG_AXIS_WEIGHTS.volume +
    diversityScore * ICG_AXIS_WEIGHTS.diversidade +
    depthScore * ICG_AXIS_WEIGHTS.profundidade +
    consistencyScore * ICG_AXIS_WEIGHTS.consistencia;

  const axisScores: Record<IcgAxis, number> = {
    volume: volumeScore,
    diversidade: diversityScore,
    profundidade: depthScore,
    consistencia: consistencyScore,
  };
  const weakestAxis = (Object.keys(axisScores) as IcgAxis[]).reduce((worst, axis) =>
    axisScores[axis] < axisScores[worst] ? axis : worst,
  );

  const accountAgeMonths = monthIndex(new Date()) - monthIndex(user.createdAt);
  const targetIndex = scoreToRankIndex(icg);
  const gatedIndex = applyRankGates(targetIndex, {
    accountAgeMonths,
    countedTotal: counted.length,
    consecutiveActiveMonths,
  });

  const currentIndex = existing ? CINEPHILE_RANKS.indexOf(existing.rank as never) : 0;
  const lastActive = counted.length > 0 ? counted[counted.length - 1]!.watchedAt : null;
  const daysSinceLastActive = lastActive
    ? (Date.now() - lastActive.getTime()) / 86_400_000
    : Number.POSITIVE_INFINITY;

  const newIndex = determineNewRankIndex(currentIndex, gatedIndex, daysSinceLastActive);
  const newRank = CINEPHILE_RANKS[newIndex]!;
  const rankChanged = !existing || newRank !== existing.rank;

  const saved = await prisma.cinephileOrder.upsert({
    where: { userId },
    create: {
      userId,
      rank: newRank,
      icg,
      volumeScore,
      diversityScore,
      depthScore,
      consistencyScore,
      weakestAxis,
      rankSince: new Date(),
    },
    update: {
      rank: newRank,
      icg,
      volumeScore,
      diversityScore,
      depthScore,
      consistencyScore,
      weakestAxis,
      calculatedAt: new Date(),
      ...(rankChanged ? { rankSince: new Date() } : {}),
    },
  });

  return toDto(saved);
}
