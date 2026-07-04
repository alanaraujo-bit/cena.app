import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { AppBackground, GlassCard, Icon, ThemedText } from '@/design-system';
import { ActivityFeedItem } from '@/features/feed/ActivityFeedItem';
import { useFeed } from '@/features/feed/hooks';
import { useUnreadCount } from '@/features/notifications/hooks';
import { useStrings } from '@/i18n';
import { useTheme } from '@/theme';

export default function FeedScreen() {
  const t = useStrings();
  const theme = useTheme();
  const router = useRouter();
  const feed = useFeed();
  const unreadCount = useUnreadCount();

  const items = useMemo(() => feed.data?.pages.flatMap((page) => page.items) ?? [], [feed.data]);

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: 8,
            paddingBottom: theme.spacing.md,
          }}
        >
          <ThemedText variant="title">{t.feed.title}</ThemedText>
          <Pressable
            onPress={() => router.push('/notificacoes')}
            hitSlop={10}
            accessibilityLabel="Notificações"
            style={{ padding: 4 }}
          >
            <Icon name="bell" size={24} color={theme.colors.text.primary} />
            {(unreadCount.data ?? 0) > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 9,
                  height: 9,
                  borderRadius: 5,
                  backgroundColor: theme.colors.status.danger,
                }}
              />
            ) : null}
          </Pressable>
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
