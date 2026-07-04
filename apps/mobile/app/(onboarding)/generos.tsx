import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { GlassSurface, ThemedText } from '@/design-system';
import { onboardingApi } from '@/features/onboarding/api';
import { TMDB_GENRES } from '@/features/onboarding/genres';
import { OnboardingScaffold } from '@/features/onboarding/OnboardingScaffold';
import { useTheme } from '@/theme';

export default function GenresScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  async function handleNext() {
    setLoading(true);
    try {
      await onboardingApi.setGenres({ genres: [...selected] });
      router.push('/(onboarding)/notificacoes');
    } finally {
      setLoading(false);
    }
  }

  return (
    <OnboardingScaffold
      step={3}
      title="Seus gêneros favoritos"
      subtitle="Escolha alguns para personalizar suas recomendações."
      primaryLabel={selected.size > 0 ? `Continuar (${selected.size})` : 'Continuar'}
      onPrimary={handleNext}
      primaryLoading={loading}
      primaryDisabled={selected.size === 0}
    >
      <View style={styles.chips}>
        {TMDB_GENRES.map((g) => {
          const active = selected.has(g.id);
          return (
            <Pressable key={g.id} onPress={() => toggle(g.id)}>
              <GlassSurface
                intensity="subtle"
                radius={theme.radii.pill}
                bordered={false}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderWidth: 1.5,
                  borderColor: active ? theme.colors.accent.onSurface : theme.colors.glass.border,
                }}
              >
                <ThemedText variant="callout" color={active ? 'accent' : 'secondary'}>
                  {g.label}
                </ThemedText>
              </GlassSurface>
            </Pressable>
          );
        })}
      </View>
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
