import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { GlassCard, PrimaryButton, ProgressAxis, Screen, ThemedText } from '@/design-system';
import { TMDB_GENRES } from '@/features/onboarding/genres';
import { useAdvancedStats, usePremiumStatus } from '@/features/premium/hooks';
import { useTheme } from '@/theme';

const GENRE_LABELS = new Map(TMDB_GENRES.map((g) => [g.id, g.label]));

const MONTH_LABELS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-');
  const idx = Number(month) - 1;
  return `${MONTH_LABELS[idx] ?? month}/${year!.slice(2)}`;
}

function maxOf(values: number[]): number {
  return Math.max(1, ...values);
}

export default function AdvancedStatsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const status = usePremiumStatus();
  const isPremium = status.data?.isPremium ?? false;
  const stats = useAdvancedStats(isPremium);

  return (
    <Screen title="Sua Jornada Cinéfila" subtitle="Estatísticas avançadas do seu histórico">
      {status.isLoading ? (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <ActivityIndicator color={theme.colors.accent.onSurface} />
        </View>
      ) : !isPremium ? (
        <GlassCard>
          <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
            Estatísticas avançadas são exclusivas de assinantes Premium.
          </ThemedText>
          <PrimaryButton label="Ver o Premium" onPress={() => router.push('/premium')} />
        </GlassCard>
      ) : stats.isLoading || !stats.data ? (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <ActivityIndicator color={theme.colors.accent.onSurface} />
        </View>
      ) : (
        <View style={{ gap: theme.spacing.lg }}>
          <GlassCard>
            <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
              Gêneros favoritos
            </ThemedText>
            {stats.data.genreBreakdown.length === 0 ? (
              <ThemedText variant="caption" color="secondary">
                Marque títulos como assistidos para ver seus gêneros favoritos.
              </ThemedText>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                {(() => {
                  const max = maxOf(stats.data.genreBreakdown.map((g) => g.count));
                  return stats.data.genreBreakdown.map((g) => (
                    <ProgressAxis
                      key={g.genreId}
                      label={`${GENRE_LABELS.get(g.genreId) ?? 'Outro'} (${g.count})`}
                      value={g.count / max}
                    />
                  ));
                })()}
              </View>
            )}
          </GlassCard>

          <GlassCard>
            <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
              Décadas assistidas
            </ThemedText>
            {stats.data.decadeBreakdown.length === 0 ? (
              <ThemedText variant="caption" color="secondary">
                Sem dados suficientes ainda.
              </ThemedText>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                {(() => {
                  const max = maxOf(stats.data.decadeBreakdown.map((d) => d.count));
                  return stats.data.decadeBreakdown.map((d) => (
                    <ProgressAxis key={d.decade} label={`${d.decade}s (${d.count})`} value={d.count / max} />
                  ));
                })()}
              </View>
            )}
          </GlassCard>

          <GlassCard>
            <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
              Diretores mais assistidos
            </ThemedText>
            {stats.data.topDirectors.length === 0 ? (
              <ThemedText variant="caption" color="secondary">
                Sem dados suficientes ainda.
              </ThemedText>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                {(() => {
                  const max = maxOf(stats.data.topDirectors.map((d) => d.count));
                  return stats.data.topDirectors.map((d) => (
                    <ProgressAxis key={d.director} label={`${d.director} (${d.count})`} value={d.count / max} />
                  ));
                })()}
              </View>
            )}
          </GlassCard>

          <GlassCard>
            <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
              Minutos assistidos por mês
            </ThemedText>
            {stats.data.monthlyMinutes.length === 0 ? (
              <ThemedText variant="caption" color="secondary">
                Sem dados suficientes ainda.
              </ThemedText>
            ) : (
              <View style={{ gap: theme.spacing.sm }}>
                {(() => {
                  const max = maxOf(stats.data.monthlyMinutes.map((m) => m.minutes));
                  return stats.data.monthlyMinutes.map((m) => (
                    <ProgressAxis
                      key={m.month}
                      label={`${formatMonth(m.month)} (${m.minutes} min)`}
                      value={m.minutes / max}
                    />
                  ));
                })()}
              </View>
            )}
          </GlassCard>
        </View>
      )}
    </Screen>
  );
}
