import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground, Icon, PrimaryButton, ThemedText } from '@/design-system';
import { useStrings } from '@/i18n';
import { useTheme } from '@/theme';

export default function LogSheet() {
  const t = useStrings();
  const theme = useTheme();
  const router = useRouter();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <View style={[styles.content, { padding: theme.spacing.xl, gap: theme.spacing.lg }]}>
          <View style={styles.handleRow}>
            <ThemedText variant="title">{t.log.title}</ThemedText>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={t.common.cancel}
              hitSlop={12}
            >
              <Icon name="close" size={24} color={theme.colors.text.secondary} />
            </Pressable>
          </View>

          <ThemedText variant="body" color="secondary">
            {t.log.subtitle}
          </ThemedText>

          <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.md }}>
            <PrimaryButton label={t.log.markWatched} variant="primary" onPress={() => {}} />
            <PrimaryButton label={t.log.startVersus} variant="glass" onPress={() => {}} />
          </View>

          <ThemedText variant="caption" color="tertiary" align="center" style={{ marginTop: 8 }}>
            {t.common.comingSoon}
          </ThemedText>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  handleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
