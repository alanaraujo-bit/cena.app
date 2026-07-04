import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import type { TitleSummary } from '@cena/shared';
import { GlassSurface, Icon, ThemedText } from '@/design-system';
import { useTheme } from '@/theme';

const BLURHASH = 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4';

export function TitleResultRow({
  item,
  onPress,
}: {
  item: TitleSummary;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <GlassSurface intensity="subtle" radius={theme.radii.lg} style={styles.row}>
        <View
          style={[styles.poster, { backgroundColor: theme.colors.bg.layer2, borderRadius: 8 }]}
        >
          {item.posterUrl ? (
            <Image
              source={{ uri: item.posterUrl }}
              placeholder={{ blurhash: BLURHASH }}
              contentFit="cover"
              transition={150}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
        </View>

        <View style={styles.meta}>
          <ThemedText variant="subheadline" numberOfLines={1}>
            {item.title}
          </ThemedText>
          <View style={styles.subRow}>
            <ThemedText variant="caption" color="accent">
              {item.mediaType === 'tv' ? 'Série' : 'Filme'}
            </ThemedText>
            {item.year ? (
              <ThemedText variant="caption" color="tertiary">
                · {item.year}
              </ThemedText>
            ) : null}
            {item.voteAverage > 0 ? (
              <View style={styles.rating}>
                <Icon name="star-fill" size={11} color={theme.colors.status.warning} />
                <ThemedText variant="caption" color="secondary">
                  {item.voteAverage.toFixed(1)}
                </ThemedText>
              </View>
            ) : null}
          </View>
          {item.overview ? (
            <ThemedText variant="caption" color="secondary" numberOfLines={2} style={{ marginTop: 2 }}>
              {item.overview}
            </ThemedText>
          ) : null}
        </View>
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, padding: 10 },
  poster: { width: 56, height: 84, overflow: 'hidden' },
  meta: { flex: 1, justifyContent: 'center' },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
