import { useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { AppBackground, GlassCard, ThemedText } from '@/design-system';
import { ActivityFeedItem } from '@/features/feed/ActivityFeedItem';
import { useFeed } from '@/features/feed/hooks';
import { useStrings } from '@/i18n';
import { useTheme } from '@/theme';

export default function FeedScreen() {
  const t = useStrings();
  const theme = useTheme();
  const feed = useFeed();

  const items = useMemo(() => feed.data?.pages.flatMap((page) => page.items) ?? [], [feed.data]);

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={{ paddingHorizontal: theme.spacing.lg, paddingTop: 8, paddingBottom: theme.spacing.md }}>
          <ThemedText variant="title">{t.feed.title}</ThemedText>
        </View>

        {feed.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
          </View>
        ) : items.length === 0 ? (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <GlassCard>
              <ThemedText variant="body" color="secondary">
                {t.feed.empty}
              </ThemedText>
            </GlassCard>
          </View>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ActivityFeedItem item={item} />}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (feed.hasNextPage && !feed.isFetchingNextPage) void feed.fetchNextPage();
            }}
            onRefresh={() => void feed.refetch()}
            refreshing={feed.isRefetching}
            ListFooterComponent={
              feed.isFetchingNextPage ? (
                <View style={{ paddingVertical: 16 }}>
                  <ActivityIndicator color={theme.colors.accent.onSurface} />
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
