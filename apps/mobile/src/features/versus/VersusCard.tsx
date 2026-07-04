import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';
import type { VersusSummary } from '@cena/shared';
import { PrimaryButton, ThemedText } from '@/design-system';
import { useTheme } from '@/theme';
import { useVoteVersus } from './hooks';

function timeRemainingLabel(closesAt: string): string {
  const ms = new Date(closesAt).getTime() - Date.now();
  if (ms <= 0) return 'Encerrado';
  const hours = Math.ceil(ms / 3_600_000);
  if (hours >= 24) return `Encerra em ${Math.ceil(hours / 24)}d`;
  if (hours >= 1) return `Encerra em ${hours}h`;
  return `Encerra em ${Math.ceil(ms / 60_000)}min`;
}

function VersusOption({
  title,
  posterUrl,
  pct,
  chosen,
}: {
  title: string;
  posterUrl: string | null;
  pct: number;
  chosen: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <View
        style={[
          styles.poster,
          {
            backgroundColor: theme.colors.bg.layer2,
            borderRadius: theme.radii.md,
            borderWidth: chosen ? 2 : 0,
            borderColor: theme.colors.accent.onSurface,
          },
        ]}
      >
        {posterUrl ? (
          <Image source={{ uri: posterUrl }} contentFit="cover" style={StyleSheet.absoluteFill} />
        ) : null}
      </View>
      <ThemedText variant="caption" numberOfLines={2}>
        {title}
      </ThemedText>
      <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.colors.glass.border, overflow: 'hidden' }}>
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: chosen ? theme.colors.accent.onSurface : theme.colors.text.tertiary,
          }}
        />
      </View>
      <ThemedText variant="micro" color="tertiary">
        {pct}%
      </ThemedText>
    </View>
  );
}

export function VersusCard({ versus }: { versus: VersusSummary }) {
  const theme = useTheme();
  const router = useRouter();
  const vote = useVoteVersus(versus.id);

  const total = versus.votesA + versus.votesB;
  const pctA = total > 0 ? Math.round((versus.votesA / total) * 100) : 0;
  const pctB = total > 0 ? 100 - pctA : 0;

  return (
    <View style={{ gap: theme.spacing.sm }}>
      {versus.question ? <ThemedText variant="callout">{versus.question}</ThemedText> : null}

      <Pressable onPress={() => router.push(`/versus/${versus.id}`)}>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, alignItems: 'flex-start' }}>
          <VersusOption
            title={versus.titleA.title}
            posterUrl={versus.titleA.posterUrl}
            pct={pctA}
            chosen={versus.myChoice === 'a'}
          />
          <ThemedText variant="micro" color="tertiary" style={{ marginTop: 40 }}>
            VS
          </ThemedText>
          <VersusOption
            title={versus.titleB.title}
            posterUrl={versus.titleB.posterUrl}
            pct={pctB}
            chosen={versus.myChoice === 'b'}
          />
        </View>
      </Pressable>

      {versus.canVote ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <PrimaryButton
            label="Votar A"
            variant="glass"
            onPress={() => vote.mutate({ choice: 'a' })}
            loading={vote.isPending && vote.variables?.choice === 'a'}
            disabled={vote.isPending}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            label="Votar B"
            variant="glass"
            onPress={() => vote.mutate({ choice: 'b' })}
            loading={vote.isPending && vote.variables?.choice === 'b'}
            disabled={vote.isPending}
            style={{ flex: 1 }}
          />
        </View>
      ) : (
        <ThemedText variant="caption" color="tertiary">
          {versus.isClosed
            ? 'Votação encerrada'
            : versus.myChoice
              ? 'Você já votou'
              : 'Assista aos dois filmes para poder votar'}
        </ThemedText>
      )}

      <ThemedText variant="micro" color="tertiary">
        {timeRemainingLabel(versus.closesAt)} · {total} {total === 1 ? 'voto' : 'votos'}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  poster: { width: '100%', aspectRatio: 2 / 3, overflow: 'hidden' },
});
