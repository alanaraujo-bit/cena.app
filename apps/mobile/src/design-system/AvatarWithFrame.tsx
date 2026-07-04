import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { ThemedText } from './ThemedText';

interface AvatarWithFrameProps {
  avatarUrl: string | null;
  name: string;
  size?: number;
  /** Presence heartbeat — a green dot, not a live socket guarantee. */
  online?: boolean;
  /**
   * Reserved for the future frame-rarity system (brief §5.6); today every user
   * renders the same understated ring regardless of this value.
   */
  frameId?: string | null;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
  return (first + last).toUpperCase();
}

export function AvatarWithFrame({
  avatarUrl,
  name,
  size = 64,
  online = false,
}: AvatarWithFrameProps) {
  const theme = useTheme();
  const dotSize = Math.max(12, size * 0.22);

  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: theme.colors.accent.onSurface,
          },
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
        </View>
      </View>

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
});
