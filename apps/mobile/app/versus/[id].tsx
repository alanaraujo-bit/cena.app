import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground, GlassCard, GlassSurface, Icon, ThemedText } from '@/design-system';
import { VersusCard } from '@/features/versus/VersusCard';
import { useVersus } from '@/features/versus/hooks';
import { useTheme } from '@/theme';

export default function VersusDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const versus = useVersus(id);

  return (
    <AppBackground>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 }}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
            <GlassSurface elevated intensity="strong" radius={theme.radii.pill} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
            </GlassSurface>
          </Pressable>
          <ThemedText variant="title">Filme Versus</ThemedText>
        </View>

        {versus.isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
          </View>
        ) : versus.isError || !versus.data ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <ThemedText variant="body" color="secondary" align="center">
              Não foi possível carregar esse Versus.
            </ThemedText>
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0 }}>
            <GlassCard>
              <ThemedText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.md }}>
                Criado por @{versus.data.creator.username}
              </ThemedText>
              <VersusCard versus={versus.data} />
            </GlassCard>
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}
