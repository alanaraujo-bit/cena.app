import { View } from 'react-native';
import { GlassCard, Screen, ThemedText } from '@/design-system';
import { useHealth } from '@/features/health/useHealth';
import { useStrings } from '@/i18n';
import { useTheme } from '@/theme';

export default function FeedScreen() {
  const t = useStrings();
  const theme = useTheme();
  const health = useHealth();

  const status = health.isLoading
    ? { label: 'Conectando à API…', color: theme.colors.text.tertiary }
    : health.isError
      ? { label: 'API offline — inicie o servidor', color: theme.colors.status.danger }
      : { label: `API conectada · ${health.data?.service}`, color: theme.colors.status.success };

  return (
    <Screen title={t.feed.title} subtitle={t.common.tagline}>
      <GlassCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: status.color,
            }}
          />
          <ThemedText variant="callout" style={{ color: status.color }}>
            {status.label}
          </ThemedText>
        </View>
      </GlassCard>

      <GlassCard>
        <ThemedText variant="headline">Bem-vindo à CENA 🎬</ThemedText>
        <ThemedText variant="body" color="secondary" style={{ marginTop: 8 }}>
          {t.feed.empty}
        </ThemedText>
      </GlassCard>
    </Screen>
  );
}
