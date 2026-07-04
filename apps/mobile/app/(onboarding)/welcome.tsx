import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { GlassCard, ThemedText } from '@/design-system';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { useTheme } from '@/theme';

const HIGHLIGHTS = [
  { emoji: '🎬', title: 'Registre', text: 'Marque o que assistiu, está assistindo e quer assistir.' },
  { emoji: '⭐', title: 'Avalie', text: 'Dê notas e deixe sua Resenha Momento.' },
  { emoji: '🏆', title: 'Evolua', text: 'Suba na sua Ordem Cinéfila conforme seu repertório cresce.' },
];

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <OnboardingScaffold
      step={1}
      title="Bem-vindo à CENA"
      subtitle="A rede social dos cinéfilos. Veja como funciona:"
      primaryLabel="Começar"
      onPrimary={() => router.push('/(onboarding)/nivel')}
    >
      <View style={{ gap: theme.spacing.md }}>
        {HIGHLIGHTS.map((h) => (
          <GlassCard key={h.title}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.lg }}>
              <ThemedText variant="title">{h.emoji}</ThemedText>
              <View style={{ flex: 1 }}>
                <ThemedText variant="subheadline">{h.title}</ThemedText>
                <ThemedText variant="callout" color="secondary">
                  {h.text}
                </ThemedText>
              </View>
            </View>
          </GlassCard>
        ))}
      </View>
    </OnboardingScaffold>
  );
}
