/**
 * Non-color design tokens shared by both themes. Colors live in `colors.ts`;
 * everything here (spacing, radii, type scale, motion, blur) is theme-agnostic.
 */

/** 4pt spacing scale. Use these, never ad hoc pixel values. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/** Continuous (squircle-ish) corner radii. */
export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 32,
  pill: 999,
} as const;

/**
 * Type scale — one clear hierarchy reused everywhere. Movie titles, usernames,
 * and section headers must pull from here, never invent sizes.
 */
export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const, letterSpacing: 0.2 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: 0.2 },
  headline: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const, letterSpacing: 0.15 },
  subheadline: { fontSize: 17, lineHeight: 23, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  callout: { fontSize: 15, lineHeight: 20, fontWeight: '500' as const },
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '500' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;

export type TypographyVariant = keyof typeof typography;

/** Blur intensities per surface, tuned for the Liquid Glass approximation. */
export const blur = {
  subtle: 20,
  regular: 40,
  strong: 60,
  intense: 90,
} as const;

export type BlurLevel = keyof typeof blur;

/** Spring presets for Reanimated. Motion is physical, not linear. */
export const motion = {
  spring: { damping: 18, stiffness: 220, mass: 1 },
  springSoft: { damping: 22, stiffness: 140, mass: 1 },
  springBouncy: { damping: 12, stiffness: 260, mass: 0.9 },
  timingFast: 160,
  timingBase: 240,
  timingSlow: 360,
} as const;

/** Hit target minimum (accessibility). */
export const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const MIN_TOUCH_SIZE = 44;
