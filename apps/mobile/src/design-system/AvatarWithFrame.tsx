import { useEffect } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { FrameEffect } from '@cena/shared';
import { useTheme } from '@/theme';
import { ThemedText } from './ThemedText';

interface FrameData {
  effect: FrameEffect;
  colors: string[];
}

interface AvatarWithFrameProps {
  avatarUrl: string | null;
  name: string;
  size?: number;
  /** Presence heartbeat — a green dot, not a live socket guarantee. */
  online?: boolean;
  /** The equipped frame's rendering data (brief §5.6) — null/undefined falls back to the plain ring. */
  frame?: FrameData | null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

const EFFECT_DURATIONS: Record<FrameEffect, number> = {
  none: 0,
  glow: 1800,
  pulse: 900,
  rotate: 2600,
  shimmer: 1000,
  orbital: 3200,
  prismatic: 3600,
  scanline: 1600,
  aurora: 4200,
};

export function AvatarWithFrame({
  avatarUrl,
  name,
  size = 64,
  online = false,
  frame,
}: AvatarWithFrameProps) {
  const theme = useTheme();
  const dotSize = Math.max(12, size * 0.22);
  const effect = frame?.effect ?? 'none';
  const colors = frame && frame.colors.length > 0 ? frame.colors : [theme.colors.accent.onSurface];
  const primary = colors[0]!;
  const secondary = colors[1] ?? primary;
  const ringColor = effect === 'none' ? theme.colors.accent.onSurface : primary;

  const progress = useSharedValue(0);
  useEffect(() => {
    if (effect === 'none') {
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration: EFFECT_DURATIONS[effect], easing: Easing.linear }),
      -1,
      false,
    );
  }, [effect, progress]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 360}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => {
    const scale = 1 + 0.08 * Math.sin(progress.value * Math.PI * 2);
    return { transform: [{ scale }] };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(progress.value * Math.PI * 2)),
  }));

  const scanStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -size + progress.value * size * 2 }],
  }));

  const prismaticStyle = useAnimatedStyle(() => ({
    borderColor:
      colors.length > 1
        ? interpolateColor(
            progress.value,
            colors.map((_, i) => i / (colors.length - 1)),
            colors,
          )
        : primary,
  }));

  const orbitDot1Style = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2;
    const radius = size / 2;
    return { transform: [{ translateX: Math.cos(angle) * radius }, { translateY: Math.sin(angle) * radius }] };
  });

  const orbitDot2Style = useAnimatedStyle(() => {
    const angle = progress.value * Math.PI * 2 + Math.PI;
    const radius = size / 2;
    return { transform: [{ translateX: Math.cos(angle) * radius }, { translateY: Math.sin(angle) * radius }] };
  });

  const glowSize = size * 1.5;

  return (
    <View style={{ width: size, height: size }}>
      {effect === 'glow' || effect === 'aurora' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            glowStyle,
            {
              position: 'absolute',
              left: -(glowSize - size) / 2,
              top: -(glowSize - size) / 2,
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              overflow: 'hidden',
            },
          ]}
        >
          <LinearGradient
            colors={[`${primary}99`, `${primary}00`]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      ) : null}

      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: ringColor,
          },
          effect === 'rotate' || effect === 'shimmer' ? { borderColor: secondary, borderTopColor: primary } : null,
          effect === 'pulse' ? pulseStyle : null,
          effect === 'rotate' || effect === 'shimmer' || effect === 'aurora' ? spinStyle : null,
          effect === 'prismatic' || effect === 'aurora' ? prismaticStyle : null,
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
              backgroundColor: theme.colors.bg.layer2,
            },
          ]}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
          ) : (
            <ThemedText variant="subheadline" color="secondary">
              {initials(name)}
            </ThemedText>
          )}

          {effect === 'scanline' ? (
            <Animated.View
              pointerEvents="none"
              style={[
                scanStyle,
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: primary,
                  opacity: 0.85,
                },
              ]}
            />
          ) : null}
        </View>
      </Animated.View>

      {effect === 'orbital' ? (
        <>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.orbitDot,
              orbitDot1Style,
              { left: size / 2 - 3, top: size / 2 - 3, backgroundColor: primary },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.orbitDot,
              orbitDot2Style,
              { left: size / 2 - 3, top: size / 2 - 3, backgroundColor: secondary },
            ]}
          />
        </>
      ) : null}

      {online ? (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: theme.colors.status.online,
              borderColor: theme.colors.bg.base,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
  orbitDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
