import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBackground, PrimaryButton, ThemedText } from '@/design-system';
import { useTheme } from '@/theme';

export const ONBOARDING_STEPS = 5;

interface OnboardingScaffoldProps {
  step: number; // 1-based
  title: string;
  subtitle?: string;
  children?: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimary,
  primaryLoading,
  primaryDisabled,
  secondaryLabel,
  onSecondary,
}: OnboardingScaffoldProps) {
  const theme = useTheme();

  return (
    <AppBackground>
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, { padding: theme.spacing.xl }]}>
          <ProgressDots step={step} />

          <View style={{ flex: 1, justifyContent: 'center', gap: theme.spacing.xxl }}>
            <View style={{ gap: theme.spacing.sm }}>
              <ThemedText variant="title">{title}</ThemedText>
              {subtitle ? (
                <ThemedText variant="body" color="secondary">
                  {subtitle}
                </ThemedText>
              ) : null}
            </View>
            {children}
          </View>

          <View style={{ gap: theme.spacing.md }}>
            <PrimaryButton
              label={primaryLabel}
              onPress={onPrimary}
              loading={primaryLoading}
              disabled={primaryDisabled}
            />
            {secondaryLabel && onSecondary ? (
              <PrimaryButton label={secondaryLabel} variant="ghost" onPress={onSecondary} />
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    </AppBackground>
  );
}

function ProgressDots({ step }: { step: number }) {
  const theme = useTheme();
  return (
    <View style={styles.dots}>
      {Array.from({ length: ONBOARDING_STEPS }).map((_, i) => {
        const active = i < step;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: active ? theme.colors.accent.onSurface : theme.colors.glass.border,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 8 },
});
