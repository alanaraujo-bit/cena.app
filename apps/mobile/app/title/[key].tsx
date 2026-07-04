import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { TitleDetail } from '@cena/shared';
import { AppBackground, GlassSurface, Icon, PrimaryButton, ThemedText } from '@/design-system';
import { useTitleDetail } from '@/features/titles/hooks';
import { WatchStateControls } from '@/features/titles/WatchStateControls';
import { useTheme } from '@/theme';

export default function TitleDetailScreen() {
  const theme = useTheme();
  const { key } = useLocalSearchParams<{ key: string }>();
  const detail = useTitleDetail(key);

  return (
    <AppBackground>
      {detail.isLoading ? (
        <Centered>
          <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
        </Centered>
      ) : detail.isError || !detail.data ? (
        <Centered>
          <ThemedText variant="body" color="secondary" align="center">
            Não foi possível carregar este título.
          </ThemedText>
        </Centered>
      ) : (
        <Content titleKey={key} data={detail.data} />
      )}
      <BackButton />
    </AppBackground>
  );
}

function Content({ titleKey, data }: { titleKey: string; data: TitleDetail }) {
  const theme = useTheme();

  const metaLine = [
    data.year?.toString(),
    data.mediaType === 'tv'
      ? data.numberOfSeasons
        ? `${data.numberOfSeasons} temporada${data.numberOfSeasons > 1 ? 's' : ''}`
        : 'Série'
      : data.runtimeMinutes
        ? `${data.runtimeMinutes} min`
        : null,
    data.genres[0]?.name,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
      {/* Backdrop */}
      <View style={styles.backdrop}>
        {data.backdropUrl ? (
          <Image source={{ uri: data.backdropUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
        ) : null}
        <LinearGradient
          colors={['transparent', theme.colors.bg.base]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ paddingHorizontal: theme.spacing.lg, marginTop: -60, gap: theme.spacing.lg }}>
        {/* Header: poster + title */}
        <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
          <View style={[styles.poster, { borderRadius: theme.radii.md }]}>
            {data.posterUrl ? (
              <Image source={{ uri: data.posterUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
            ) : null}
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end', gap: 4 }}>
            <ThemedText variant="headline">{data.title}</ThemedText>
            <ThemedText variant="caption" color="secondary">
              {metaLine}
            </ThemedText>
            <View style={styles.ratingRow}>
              <Icon name="star-fill" size={14} color={theme.colors.status.warning} />
              <ThemedText variant="callout" color="secondary">
                {data.voteAverage.toFixed(1)} TMDB
              </ThemedText>
            </View>
          </View>
        </View>

        {/* The core, always-visible watch-state actions. */}
        <WatchStateControls titleKey={titleKey} />

        {data.trailerKey ? (
          <PrimaryButton
            label="Assistir trailer"
            variant="glass"
            onPress={() => void Linking.openURL(`https://www.youtube.com/watch?v=${data.trailerKey}`)}
          />
        ) : null}

        {data.overview ? (
          <View style={{ gap: theme.spacing.sm }}>
            <ThemedText variant="subheadline">Sinopse</ThemedText>
            <ThemedText variant="body" color="secondary">
              {data.overview}
            </ThemedText>
          </View>
        ) : null}

        {data.director ? (
          <View>
            <ThemedText variant="caption" color="tertiary">
              DIREÇÃO
            </ThemedText>
            <ThemedText variant="body">{data.director}</ThemedText>
          </View>
        ) : null}

        {data.cast.length > 0 ? (
          <View style={{ gap: theme.spacing.sm }}>
            <ThemedText variant="subheadline">Elenco</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {data.cast.map((c) => (
                <View key={c.id} style={styles.castMember}>
                  <View style={[styles.castPhoto, { backgroundColor: theme.colors.bg.layer2 }]}>
                    {c.photoUrl ? (
                      <Image source={{ uri: c.photoUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
                    ) : (
                      <View style={[StyleSheet.absoluteFill, styles.centered]}>
                        <Icon name="profile" size={22} color={theme.colors.text.tertiary} />
                      </View>
                    )}
                  </View>
                  <ThemedText variant="micro" numberOfLines={1} align="center">
                    {c.name}
                  </ThemedText>
                  {c.character ? (
                    <ThemedText variant="micro" color="tertiary" numberOfLines={1} align="center">
                      {c.character}
                    </ThemedText>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

function BackButton() {
  const theme = useTheme();
  const router = useRouter();
  return (
    <SafeAreaView style={styles.backSafe} edges={['top', 'left']} pointerEvents="box-none">
      <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
        <GlassSurface elevated intensity="strong" radius={theme.radii.pill} style={styles.backBtn}>
          <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
        </GlassSurface>
      </Pressable>
    </SafeAreaView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={[StyleSheet.absoluteFill, styles.centered]}>{children}</View>;
}

const styles = StyleSheet.create({
  backdrop: { height: 260, width: '100%' },
  poster: { width: 110, height: 165, overflow: 'hidden' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  centered: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  castMember: { width: 72, gap: 3 },
  castPhoto: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden' },
  backSafe: { position: 'absolute', top: 0, left: 0, padding: 12 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
