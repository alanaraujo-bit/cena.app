import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Platform, View } from 'react-native';
import { GlassCard, ThemedText } from '@/design-system';
import { notificationsApi } from '@/features/notifications/api';
import { onboardingApi } from '@/features/onboarding/api';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { registerForPushNotificationsAsync } from '@/lib/push';
import { useTheme } from '@/theme';

const REASONS = [
  '💬 Quando alguém curtir ou comentar sua atividade',
  '👥 Quando ganhar um novo seguidor',
  '🎬 Quando um Filme Versus que você criou receber votos',
];

export default function NotificationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function proceed(primed: boolean) {
    setLoading(true);
    try {
      if (primed) {
        try {
          const token = await registerForPushNotificationsAsync();
          if (token) await notificationsApi.registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
        } catch {
          // best-effort — onboarding still completes without push.
        }
      }
      await onboardingApi.setStep({ step: 'notificationsPrimed', value: primed });
      router.push('/(onboarding)/concluir');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingScaffold
      step={4}
      title="Fique por dentro"
      subtitle="Ative as notificações para não perder as interações que importam."
      primaryLabel="Ativar notificações"
      onPrimary={() => proceed(true)}
      primaryLoading={loading}
      secondaryLabel="Agora não"
      onSecondary={() => proceed(false)}
    >
      <GlassCard>
        <View style={{ gap: theme.spacing.md }}>
          {REASONS.map((r) => (
            <ThemedText key={r} variant="body" color="secondary">
              {r}
            </ThemedText>
          ))}
        </View>
      </GlassCard>
    </OnboardingScaffold>
  );
}
