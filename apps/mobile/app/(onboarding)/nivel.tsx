import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import type { CinephileLevel } from '@cena/shared';
import { GlassSurface, Icon, ThemedText } from '@/design-system';
import { onboardingApi } from '@/features/onboarding/api';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { useTheme } from '@/theme';

const LEVELS: { value: CinephileLevel; label: string; hint: string }[] = [
  { value: 'iniciante', label: 'Iniciante', hint: 'Curto filmes de vez em quando.' },
  { value: 'intermediario', label: 'Intermediário', hint: 'Assisto com frequência e gosto de variar.' },
  { value: 'avancado', label: 'Avançado', hint: 'Busco clássicos, cinema autoral e diversidade.' },
  { value: 'especialista', label: 'Especialista', hint: 'Cinema é parte da minha identidade.' },
];

export default function LevelScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<CinephileLevel | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (!selected) return;
    setLoading(true);
    try {
      await onboardingApi.setLevel({ level: selected });
      router.push('/(onboarding)/generos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingScaffold
      step={2}
      title="Qual seu nível cinéfilo?"
      subtitle="Isso nos ajuda a começar. Você pode evoluir a qualquer momento."
      primaryLabel="Continuar"
      onPrimary={handleNext}
      primaryLoading={loading}
      primaryDisabled={!selected}
    >
      <View style={{ gap: theme.spacing.md }}>
        {LEVELS.map((lvl) => {
          const active = selected === lvl.value;
          return (
            <Pressable key={lvl.value} onPress={() => setSelected(lvl.value)}>
              <GlassSurface
                intensity="subtle"
                radius={theme.radii.lg}
                bordered={false}
                style={{
                  padding: theme.spacing.lg,
                  borderWidth: 1.5,
                  borderColor: active ? theme.colors.accent.onSurface : theme.colors.glass.border,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                }}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText variant="subheadline">{lvl.label}</ThemedText>
                  <ThemedText variant="caption" color="secondary">
                    {lvl.hint}
                  </ThemedText>
                </View>
                {active ? (
                  <Icon name="check" size={22} color={theme.colors.accent.onSurface} weight="bold" />
                ) : null}
              </GlassSurface>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScaffold>
  );
}
