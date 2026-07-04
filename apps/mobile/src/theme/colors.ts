/**
 * CENA brand color DNA, carried forward from the retired web app:
 * a cyan→blue gradient with a magenta highlight. Both themes are first-class.
 *
 * Never hardcode these hexes in components — consume them via useTheme().
 */

export interface ThemeColors {
  /** Layered backgrounds, base → surface, that glass sits on top of. */
  bg: {
    base: string;
    layer1: string;
    layer2: string;
    surface: string;
  };
  /** Brand accents. */
  accent: {
    /** For gradients/glows — the vivid version. */
    primary: string;
    secondary: string;
    /** Magenta destaque. */
    highlight: string;
    glow: string;
    /** Contrast-safe variant for text/icons over the theme background. */
    onSurface: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    /** Text sitting on top of an accent fill. */
    onAccent: string;
  };
  /** Glass material params for the BlurView + overlay approximation. */
  glass: {
    /** Tint of the vibrancy overlay laid over the blur. */
    overlay: string;
    /** Slightly stronger overlay for elevated surfaces (sheets, FAB). */
    overlayStrong: string;
    /** Hairline border stroke. */
    border: string;
    /** expo-blur tint mode that best matches this theme. */
    tint: 'light' | 'dark' | 'default';
  };
  /** Semantic feedback colors. */
  status: {
    success: string;
    warning: string;
    danger: string;
    online: string;
  };
  /** Non-glass surfaces / dividers. */
  border: string;
  divider: string;
  /** Scrim behind modals / over busy imagery for text contrast. */
  scrim: string;
}

export const darkColors: ThemeColors = {
  bg: {
    base: '#0a0e17',
    layer1: '#0f1419',
    layer2: '#161b22',
    surface: '#1c2430',
  },
  accent: {
    primary: '#00d9ff',
    secondary: '#0099ff',
    highlight: '#ff0080',
    glow: '#57e8ff',
    onSurface: '#57e8ff',
  },
  text: {
    primary: '#e6edf3',
    secondary: '#97a6b5',
    tertiary: '#748394',
    onAccent: '#04121a',
  },
  glass: {
    overlay: 'rgba(255,255,255,0.10)',
    overlayStrong: 'rgba(255,255,255,0.14)',
    border: 'rgba(255,255,255,0.12)',
    tint: 'dark',
  },
  status: {
    success: '#3ad29f',
    warning: '#ffcc4d',
    danger: '#ff5c7a',
    online: '#3ad29f',
  },
  border: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.06)',
  scrim: 'rgba(5,8,13,0.6)',
};

export const lightColors: ThemeColors = {
  bg: {
    base: '#f5f7fa',
    layer1: '#eef1f5',
    layer2: '#e4e8ee',
    surface: '#ffffff',
  },
  accent: {
    primary: '#00d9ff',
    secondary: '#0099ff',
    highlight: '#ff0080',
    glow: '#57e8ff',
    // Deepened so cyan text/icons stay legible on light backgrounds.
    onSurface: '#0091ad',
  },
  text: {
    primary: '#101418',
    secondary: '#4b5563',
    tertiary: '#8a94a0',
    onAccent: '#ffffff',
  },
  glass: {
    overlay: 'rgba(255,255,255,0.55)',
    overlayStrong: 'rgba(255,255,255,0.70)',
    border: 'rgba(0,0,0,0.08)',
    tint: 'light',
  },
  status: {
    success: '#12a97a',
    warning: '#c98a00',
    danger: '#e0415f',
    online: '#12a97a',
  },
  border: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.06)',
  scrim: 'rgba(255,255,255,0.5)',
};

/** The signature cyan→blue gradient, used for CTAs, glows, brand marks. */
export const brandGradient = ['#00d9ff', '#0099ff'] as const;
/** Cyan→magenta, for rarer/premium flourishes (legendary frames, ICG glow). */
export const prismGradient = ['#00d9ff', '#ff0080'] as const;
