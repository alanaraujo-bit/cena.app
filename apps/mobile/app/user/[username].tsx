import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground, GlassSurface, Icon, ThemedText } from '@/design-system';
import { ProfileView } from '@/features/profile/ProfileView';
import { useProfile } from '@/features/profile/hooks';
import { useTheme } from '@/theme';

export default function PublicProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { username } = useLocalSearchParams<{ username: string }>();
  const profile = useProfile(username);

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
            <GlassSurface elevated intensity="strong" radius={theme.radii.pill} style={styles.backBtn}>
              <Icon name="chevron-left" size={22} color={theme.colors.text.primary} weight="semibold" />
            </GlassSurface>
          </Pressable>
        </View>

        {profile.isLoading ? (
          <Centered>
            <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
          </Centered>
        ) : profile.isError || !profile.data ? (
          <Centered>
            <ThemedText variant="body" color="secondary" align="center">
              Não foi possível carregar este perfil.
            </ThemedText>
          </Centered>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: theme.spacing.lg, paddingTop: 0, gap: theme.spacing.lg }}
          >
            <ProfileView profile={profile.data} onOpenTitle={(key) => router.push(`/title/${key}`)} />
          </ScrollView>
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 4 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
});
