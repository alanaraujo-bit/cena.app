import { useState } from 'react';
import { View } from 'react-native';
import { GlassCard, ThemedText } from '@/design-system';
import { useAuth } from '@/features/auth';
import { onboardingApi } from '@/features/onboarding/api';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { useTheme } from '@/theme';

export default function FinishScreen() {
  const theme = useTheme();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    try {
      await onboardingApi.complete();
      // Updates user.onboardingCompleted → the auth gate moves us into the tabs.
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingScaffold
      step={5}
      title="Tudo pronto! 🎉"
      subtitle="Sua conta está configurada. Bora registrar sua primeira cena."
      primaryLabel="Entrar na CENA"
      onPrimary={finish}
      primaryLoading={loading}
    >
      <GlassCard>
        <View style={{ gap: theme.spacing.sm }}>
          <ThemedText variant="subheadline">Próximos passos</ThemedText>
          <ThemedText variant="body" color="secondary">
            • Busque um filme e marque como assistido{'\n'}• Siga outros cinéfilos no Feed{'\n'}•
            Acompanhe sua evolução na Ordem Cinéfila
          </ThemedText>
        </View>
      </GlassCard>
    </OnboardingScaffold>
  );
}
