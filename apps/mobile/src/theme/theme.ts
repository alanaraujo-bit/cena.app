import { darkColors, lightColors, type ThemeColors } from './colors';
import { blur, motion, radii, spacing, typography } from './tokens';

export interface Theme {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  blur: typeof blur;
  motion: typeof motion;
}

export const darkTheme: Theme = {
  scheme: 'dark',
  colors: darkColors,
  spacing,
  radii,
  typography,
  blur,
  motion,
};

export const lightTheme: Theme = {
  scheme: 'light',
  colors: lightColors,
  spacing,
  radii,
  typography,
  blur,
  motion,
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
