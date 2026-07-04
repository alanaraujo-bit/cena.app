import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme';

/**
 * The layered backdrop every screen sits on. A base fill plus two faint radial-
 * ish accent washes give the glass something to refract, without competing for
 * attention. One accent tint per screen — never a rainbow.
 */
export function AppBackground({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const { bg, accent } = theme.colors;

  // Very low-opacity accent washes; stronger in dark, whisper-faint in light.
  const washOpacity = theme.scheme === 'dark' ? 0.14 : 0.06;

  return (
    <View style={[styles.root, { backgroundColor: bg.base }]}>
      <LinearGradient
        colors={[bg.layer1, bg.base]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[withAlpha(accent.primary, washOpacity), 'transparent']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['transparent', withAlpha(accent.highlight, washOpacity * 0.6)]}
        start={{ x: 0.2, y: 0.6 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

/** Apply an alpha to a #rrggbb hex, returning an rgba() string. */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
