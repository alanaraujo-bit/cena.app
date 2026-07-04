import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { AppBackground, GlassCard, GlassSurface, Icon, ThemedText } from '@/design-system';
import { NotificationRow } from '@/features/notifications/NotificationRow';
import { useMarkAllRead, useNotifications } from '@/features/notifications/hooks';
import { useTheme } from '@/theme';

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const notifications = useNotifications();
  const markAllRead = useMarkAllRead();

  const items = useMemo(
    () => notifications.data?.pages.flatMap((page) => page.items) ?? [],
    [notifications.data],
  );
  const unreadCount = notifications.data?.pages[0]?.unreadCount ?? 0;

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
            <GlassSurface elevated intensity="strong" radius={theme.radii.pill} style={styles.backBtn}>
              <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
            </GlassSurface>
          </Pressable>
          <ThemedText variant="title">Notificações</ThemedText>
          {unreadCount > 0 ? (
            <Pressable onPress={() => markAllRead.mutate()} hitSlop={8}>
              <ThemedText variant="caption" color="accent">
                Marcar tudo como lido
              </ThemedText>
            </Pressable>
          ) : (
            <View style={{ width: 1 }} />
          )}
        </View>

        {notifications.isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
          </View>
        ) : items.length === 0 ? (
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <GlassCard>
              <ThemedText variant="body" color="secondary">
                Você ainda não tem notificações. Curtidas, comentários e novos seguidores aparecem
                aqui.
              </ThemedText>
            </GlassCard>
          </View>
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NotificationRow item={item} />}
            contentContainerStyle={{ paddingBottom: 40 }}
            onEndReachedThreshold={0.4}
            onEndReached={() => {
              if (notifications.hasNextPage && !notifications.isFetchingNextPage) {
                void notifications.fetchNextPage();
              }
            }}
            onRefresh={() => void notifications.refetch()}
            refreshing={notifications.isRefetching}
          />
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
