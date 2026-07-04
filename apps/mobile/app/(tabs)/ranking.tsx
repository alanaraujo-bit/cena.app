import { GlassCard, Screen, ThemedText } from '@/design-system';
import { useStrings } from '@/i18n';

export default function RankingScreen() {
  const t = useStrings();
  return (
    <Screen title={t.ranking.title}>
      <GlassCard>
        <ThemedText variant="body" color="secondary">
          {t.ranking.empty}
        </ThemedText>
      </GlassCard>
    </Screen>
  );
}
