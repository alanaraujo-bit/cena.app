import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { ThemedText } from './ThemedText';

interface PosterCardProps {
  posterUrl: string | null;
  title: string;
  year?: number | null;
  mediaType?: 'movie' | 'tv';
  /** TMDB or community rating badge (0–10). */
  rating?: number | null;
  width?: number;
  onPress?: () => void;
}

const BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

export function PosterCard({
  posterUrl,
  title,
  year,
  mediaType,
  rating,
  width = 120,
  onPress,
}: PosterCardProps) {
  const theme = useTheme();
  const height = width * 1.5;

  return (
    <Pressable onPress={onPress} style={{ width }}>
      <View
        style={[
          styles.posterWrap,
          { width, height, borderRadius: theme.radii.md, backgroundColor: theme.colors.bg.layer2 },
        ]}
      >
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            placeholder={{ blurhash: BLURHASH }}
            contentFit="cover"
            transition={200}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.centered]}>
            <Icon name="feed" size={28} color={theme.colors.text.tertiary} />
          </View>
        )}

        {mediaType ? (
          <View style={[styles.badge, { backgroundColor: theme.colors.scrim }]}>
            <ThemedText variant="micro" color="onAccent" style={{ color: '#fff' }}>
              {mediaType === 'tv' ? 'SÉRIE' : 'FILME'}
            </ThemedText>
          </View>
        ) : null}

        {rating != null && rating > 0 ? (
          <View style={[styles.rating, { backgroundColor: theme.colors.scrim }]}>
            <Icon name="star-fill" size={11} color={theme.colors.status.warning} />
            <ThemedText variant="micro" style={{ color: '#fff' }}>
              {rating.toFixed(1)}
            </ThemedText>
          </View>
        ) : null}
      </View>

      <ThemedText variant="caption" numberOfLines={1} style={{ marginTop: 6 }}>
        {title}
      </ThemedText>
      {year ? (
        <ThemedText variant="micro" color="tertiary">
          {year}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  posterWrap: { overflow: 'hidden' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rating: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
