import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { AppBackground } from './AppBackground';
import { ThemedText } from './ThemedText';

interface ScreenProps {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  /** Wrap content in a ScrollView. Default true. */
  scroll?: boolean;
  /** Extra bottom padding so the floating tab bar doesn't cover content. */
  tabBarPadding?: boolean;
  contentStyle?: ViewStyle;
  headerRight?: ReactNode;
}

const TAB_BAR_CLEARANCE = 110;

export function Screen({
  title,
  subtitle,
  children,
  scroll = true,
  tabBarPadding = true,
  contentStyle,
  headerRight,
}: ScreenProps) {
  const theme = useTheme();

  const header = title ? (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <ThemedText variant="title">{title}</ThemedText>
        {subtitle ? (
          <ThemedText variant="callout" color="secondary" style={{ marginTop: 2 }}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {headerRight}
    </View>
  ) : null;

  const inner = (
    <View
      style={[
        { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg },
        tabBarPadding ? { paddingBottom: TAB_BAR_CLEARANCE } : null,
        contentStyle,
      ]}
    >
      {header}
      {children}
    </View>
  );

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingTop: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});
