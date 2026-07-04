import { GlassCard, GlassTextField, Screen, ThemedText } from '@/design-system';
import { useStrings } from '@/i18n';

export default function SearchScreen() {
  const t = useStrings();
  return (
    <Screen title={t.search.title}>
      <GlassTextField placeholder={t.search.placeholder} autoCapitalize="none" />
      <GlassCard>
        <ThemedText variant="body" color="secondary">
          {t.search.empty}
        </ThemedText>
      </GlassCard>
    </Screen>
  );
}
