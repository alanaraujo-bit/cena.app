import { BlurView } from 'expo-blur';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme, type BlurLevel } from '@/theme';

interface GlassSurfaceProps extends ViewProps {
  /** Blur strength preset. */
  intensity?: BlurLevel;
  /** Use the stronger vibrancy overlay (sheets, FAB, elevated surfaces). */
  elevated?: boolean;
  /** Corner radius; defaults to the `lg` token. */
  radius?: number;
  /** Draw the hairline border. Default true — it's what sells the glass. */
  bordered?: boolean;
  style?: ViewStyle | ViewStyle[];
}

/**
 * The core Liquid Glass approximation: a real blur layer, a theme-tinted
 * vibrancy overlay, and a hairline border. Same component + math on iOS and
 * Android so the brand identity doesn't fork by OS (brief §4.1).
 */
export function GlassSurface({
  intensity = 'regular',
  elevated = false,
  radius,
  bordered = true,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const theme = useTheme();
  const cornerRadius = radius ?? theme.radii.lg;

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: cornerRadius,
          borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
          borderColor: theme.colors.glass.border,
        },
        style,
      ]}
      {...rest}
    >
      <BlurView
        intensity={theme.blur[intensity]}
        tint={theme.colors.glass.tint}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: elevated
              ? theme.colors.glass.overlayStrong
              : theme.colors.glass.overlay,
          },
        ]}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
