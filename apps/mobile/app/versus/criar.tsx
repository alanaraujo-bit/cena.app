import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import type { TitleSummary } from '@cena/shared';
import { AppBackground, GlassCard, GlassSurface, GlassTextField, Icon, PrimaryButton, ThemedText } from '@/design-system';
import { ApiRequestError } from '@/lib/api';
import { TitleResultRow } from '@/features/titles/TitleResultRow';
import { useMyWatchedTitles } from '@/features/titles/hooks';
import { useCreateVersus } from '@/features/versus/hooks';
import { useTheme } from '@/theme';

export default function CreateVersusScreen() {
  const theme = useTheme();
  const router = useRouter();
  const watched = useMyWatchedTitles();
  const createVersus = useCreateVersus();

  const [titleA, setTitleA] = useState<TitleSummary | null>(null);
  const [titleB, setTitleB] = useState<TitleSummary | null>(null);
  const [question, setQuestion] = useState('');

  const pickableForB = useMemo(
    () => watched.data?.items.filter((t) => t.key !== titleA?.key) ?? [],
    [watched.data, titleA],
  );

  const submit = () => {
    if (!titleA || !titleB) return;
    createVersus.mutate(
      { titleAKey: titleA.key, titleBKey: titleB.key, question: question.trim() || undefined },
      { onSuccess: (data) => router.replace(`/versus/${data.id}`) },
    );
  };

  const limitReached =
    createVersus.error instanceof ApiRequestError && createVersus.error.code === 'versus_limit_reached';

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
            <GlassSurface elevated intensity="strong" radius={theme.radii.pill} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
            </GlassSurface>
          </Pressable>
          <ThemedText variant="title">Criar Filme Versus</ThemedText>
        </View>

        {watched.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
          </View>
        ) : (watched.data?.items.length ?? 0) < 2 ? (
          <View style={{ padding: theme.spacing.lg }}>
            <GlassCard>
              <ThemedText variant="body" color="secondary">
                Marque pelo menos 2 filmes ou séries como assistidos para criar um Filme Versus.
              </ThemedText>
            </GlassCard>
          </View>
        ) : !titleA ? (
          <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg }}>
            <ThemedText variant="subheadline" style={{ marginBottom: theme.spacing.sm }}>
              Escolha o primeiro título
            </ThemedText>
            <FlashList
              data={watched.data?.items ?? []}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => <TitleResultRow item={item} onPress={() => setTitleA(item)} />}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          </View>
        ) : !titleB ? (
          <View style={{ flex: 1, paddingHorizontal: theme.spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
              <ThemedText variant="subheadline">Escolha o segundo título</ThemedText>
              <Pressable onPress={() => setTitleA(null)}>
                <ThemedText variant="caption" color="accent">
                  Trocar 1º
                </ThemedText>
              </Pressable>
            </View>
            <FlashList
              data={pickableForB}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => <TitleResultRow item={item} onPress={() => setTitleB(item)} />}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            />
          </View>
        ) : (
          <View style={{ padding: theme.spacing.lg, gap: theme.spacing.lg }}>
            <GlassCard>
              <ThemedText variant="callout" style={{ marginBottom: theme.spacing.sm }}>
                {titleA.title} <ThemedText variant="callout" color="tertiary">vs</ThemedText> {titleB.title}
              </ThemedText>
              <GlassTextField
                placeholder="Pergunta (opcional): qual é o melhor?"
                value={question}
                onChangeText={setQuestion}
                maxLength={140}
              />
            </GlassCard>

            {limitReached ? (
              <GlassCard>
                <ThemedText variant="body" color="secondary" style={{ marginBottom: theme.spacing.md }}>
                  Free permite só 1 Filme Versus ativo por vez. Assine o Premium para criar sem limite.
                </ThemedText>
                <PrimaryButton label="Ver o Premium" onPress={() => router.push('/premium')} />
              </GlassCard>
            ) : (
              <PrimaryButton
                label="Criar Filme Versus"
                onPress={submit}
                loading={createVersus.isPending}
              />
            )}
            <PrimaryButton label="Trocar títulos" variant="ghost" onPress={() => { setTitleA(null); setTitleB(null); }} />
          </View>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
