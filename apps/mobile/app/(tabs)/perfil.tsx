import { View } from 'react-native';
import { GlassCard, Screen, SegmentedControl, ThemedText } from '@/design-system';
import { useStrings } from '@/i18n';
import { useUiStore, type ThemePreference } from '@/store/uiStore';
import { useTheme } from '@/theme';

export default function ProfileScreen() {
  const t = useStrings();
  const theme = useTheme();
  const themePreference = useUiStore((s) => s.themePreference);
  const setThemePreference = useUiStore((s) => s.setThemePreference);

  return (
    <Screen title={t.profile.title}>
      <GlassCard>
        <View style={{ flexDirection: 'row', gap: theme.spacing.lg }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: theme.colors.bg.layer2,
              borderWidth: 2,
              borderColor: theme.colors.accent.onSurface,
            }}
          />
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ThemedText variant="headline">Seu perfil</ThemedText>
            <ThemedText variant="callout" color="accent">
              Espectador · Ordem Cinéfila
            </ThemedText>
          </View>
        </View>
      </GlassCard>

      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
        <StatTile label={t.profile.watched} value="0" />
        <StatTile label={t.profile.followers} value="0" />
        <StatTile label={t.profile.following} value="0" />
      </View>

      <GlassCard>
        <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.md }}>
          {t.settings.appearance}
        </ThemedText>
        <SegmentedControl<ThemePreference>
          value={themePreference}
          onChange={setThemePreference}
          segments={[
            { value: 'system', label: t.settings.themeSystem },
            { value: 'light', label: t.settings.themeLight },
            { value: 'dark', label: t.settings.themeDark },
          ]}
        />
      </GlassCard>
    </Screen>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard style={{ flex: 1 }}>
      <ThemedText variant="title" align="center">
        {value}
      </ThemedText>
      <ThemedText variant="micro" color="tertiary" align="center" style={{ marginTop: 2 }}>
        {label.toUpperCase()}
      </ThemedText>
    </GlassCard>
  );
}
