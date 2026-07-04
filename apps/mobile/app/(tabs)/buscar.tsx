import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import type { TitleSummary } from '@cena/shared';
import { AppBackground, GlassTextField, PosterCard, ThemedText } from '@/design-system';
import { TitleResultRow } from '@/features/titles/TitleResultRow';
import { useDebounced, useSearchTitles, useTrending } from '@/features/titles/hooks';
import { useStrings } from '@/i18n';
import { useTheme } from '@/theme';

export default function SearchScreen() {
  const t = useStrings();
  const theme = useTheme();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const debounced = useDebounced(query);
  const search = useSearchTitles(debounced);
  const trending = useTrending();

  const open = (item: TitleSummary) => router.push(`/title/${item.key}`);
  const showResults = debounced.trim().length >= 2;

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { padding: theme.spacing.lg }]}>
          <ThemedText variant="title" style={{ marginBottom: theme.spacing.md }}>
            {t.search.title}
          </ThemedText>
          <GlassTextField
            placeholder={t.search.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>

        {showResults ? (
          <SearchResults
            loading={search.isLoading}
            items={search.data?.items ?? []}
            onOpen={open}
          />
        ) : (
          <TrendingRail
            loading={trending.isLoading}
            items={trending.data?.items ?? []}
            onOpen={open}
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

function SearchResults({
  loading,
  items,
  onOpen,
}: {
  loading: boolean;
  items: TitleSummary[];
  onOpen: (t: TitleSummary) => void;
}) {
  const theme = useTheme();
  if (loading) return <Centered><ActivityIndicator color={theme.colors.accent.onSurface} /></Centered>;
  if (items.length === 0)
    return (
      <Centered>
        <ThemedText variant="body" color="secondary" align="center">
          Nada encontrado. Tente outro termo.
        </ThemedText>
      </Centered>
    );

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.key}
      renderItem={({ item }) => <TitleResultRow item={item} onPress={() => onOpen(item)} />}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120, paddingTop: 4 }}
      keyboardDismissMode="on-drag"
    />
  );
}

function TrendingRail({
  loading,
  items,
  onOpen,
}: {
  loading: boolean;
  items: TitleSummary[];
  onOpen: (t: TitleSummary) => void;
}) {
  const theme = useTheme();
  if (loading) return <Centered><ActivityIndicator color={theme.colors.accent.onSurface} /></Centered>;

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
      <ThemedText variant="headline" style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        Em alta esta semana
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {items.map((item) => (
          <PosterCard
            key={item.key}
            posterUrl={item.posterUrl}
            title={item.title}
            year={item.year}
            mediaType={item.mediaType}
            rating={item.voteAverage}
            onPress={() => onOpen(item)}
          />
        ))}
      </ScrollView>
    </ScrollView>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {},
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
