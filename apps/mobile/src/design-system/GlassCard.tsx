import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { useTheme, type BlurLevel } from '@/theme';
import { GlassSurface } from './GlassSurface';

interface GlassCardProps {
  children: ReactNode;
  intensity?: BlurLevel;
  elevated?: boolean;
  padded?: boolean;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
}

/** A padded glass container — the default card surface across the app. */
export function GlassCard({
  children,
  intensity = 'regular',
  elevated = false,
  padded = true,
  radius,
  style,
}: GlassCardProps) {
  const theme = useTheme();
  return (
    <GlassSurface
      intensity={intensity}
      elevated={elevated}
      radius={radius}
      style={[padded ? { padding: theme.spacing.lg } : null, style].filter(Boolean) as ViewStyle[]}
    >
      {children}
    </GlassSurface>
  );
}
