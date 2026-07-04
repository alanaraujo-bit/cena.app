import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import type { LeaderboardEntry, RankingWindow } from '@cena/shared';
import { CINEPHILE_RANK_LABELS } from '@cena/shared';
import { AvatarWithFrame, GlassCard, Screen, SegmentedControl, ThemedText } from '@/design-system';
import { useLeaderboard } from '@/features/ranking/hooks';
import { useStrings } from '@/i18n';
import { useTheme } from '@/theme';

export default function RankingScreen() {
  const t = useStrings();
  const theme = useTheme();
  const router = useRouter();
  const [window, setWindow] = useState<RankingWindow>('semana');
  const leaderboard = useLeaderboard(window);

  return (
    <Screen title={t.ranking.title}>
      <SegmentedControl<RankingWindow>
        value={window}
        onChange={setWindow}
        segments={[
          { value: 'semana', label: 'Semana' },
          { value: 'mes', label: 'Mês' },
          { value: 'todos', label: 'Todos' },
        ]}
      />

      {leaderboard.isLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <ActivityIndicator color={theme.colors.accent.onSurface} />
        </View>
      ) : !leaderboard.data || leaderboard.data.entries.length === 0 ? (
        <GlassCard>
          <ThemedText variant="body" color="secondary">
            {t.ranking.empty}
          </ThemedText>
        </GlassCard>
      ) : (
        <View style={{ gap: theme.spacing.sm }}>
          {leaderboard.data.entries.map((entry) => (
            <LeaderboardRow
              key={entry.username}
              entry={entry}
              onPress={() => router.push(`/user/${entry.username}`)}
            />
          ))}
          {leaderboard.data.viewerEntry ? (
            <>
              <ThemedText variant="caption" color="tertiary" style={{ marginTop: 4 }}>
                Sua posição
              </ThemedText>
              <LeaderboardRow
                entry={leaderboard.data.viewerEntry}
                onPress={() => router.push(`/user/${leaderboard.data!.viewerEntry!.username}`)}
              />
            </>
          ) : null}
        </View>
      )}
    </Screen>
  );
}

function LeaderboardRow({ entry, onPress }: { entry: LeaderboardEntry; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress}>
      <GlassCard
        style={
          entry.isViewer
            ? { borderWidth: 1.5, borderColor: theme.colors.accent.onSurface }
            : undefined
        }
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <ThemedText variant="subheadline" color="tertiary" style={{ width: 28 }}>
            {entry.position}
          </ThemedText>
          <AvatarWithFrame avatarUrl={entry.avatarUrl} name={entry.name} size={40} frame={entry.activeFrame} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="callout">{entry.name}</ThemedText>
            <ThemedText variant="caption" color="accent">
              {CINEPHILE_RANK_LABELS[entry.rank]}
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText variant="subheadline">{entry.totalMinutes} min</ThemedText>
            <ThemedText variant="micro" color="tertiary">
              {entry.moviesWatched} filmes · {entry.episodesWatched} eps
            </ThemedText>
          </View>
        </View>
      </GlassCard>
    </Pressable>
  );
}
