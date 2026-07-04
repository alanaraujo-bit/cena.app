import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import type { WatchState } from '@cena/shared';
import { GlassCard, GlassSurface, Icon, RatingControl, ThemedText } from '@/design-system';
import { brandGradient, useTheme } from '@/theme';
import type { IconName } from '@/design-system';
import { useSetWatchState, useTitleStatus } from './hooks';

const OPTIONS: { state: WatchState; label: string; icon: IconName }[] = [
  { state: 'assistido', label: 'Assistido', icon: 'check' },
  { state: 'assistindo', label: 'Assistindo', icon: 'play' },
  { state: 'para_assistir', label: 'Quero ver', icon: 'star' },
];

export function WatchStateControls({ titleKey }: { titleKey: string }) {
  const theme = useTheme();
  const status = useTitleStatus(titleKey);
  const mutation = useSetWatchState(titleKey);

  const active = status.data?.watchState ?? null;

  const choose = (state: WatchState) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Tapping the active state again clears it.
    mutation.mutate({ key: titleKey, state: active === state ? null : state });
  };

  const rate = (rating: number) => {
    mutation.mutate({ key: titleKey, state: 'assistido', rating });
  };

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View style={styles.row}>
        {OPTIONS.map((opt) => {
          const isActive = active === opt.state;
          return (
            <Pressable key={opt.state} style={styles.cell} onPress={() => choose(opt.state)}>
              <GlassSurface
                intensity="subtle"
                radius={theme.radii.lg}
                bordered={false}
                style={[
                  styles.button,
                  {
                    borderWidth: 1.5,
                    borderColor: isActive ? 'transparent' : theme.colors.glass.border,
                  },
                ]}
              >
                {isActive ? (
                  <LinearGradient
                    colors={brandGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : null}
                <Icon
                  name={opt.icon}
                  size={22}
                  color={isActive ? theme.colors.text.onAccent : theme.colors.text.secondary}
                  weight={isActive ? 'bold' : 'regular'}
                />
                <ThemedText
                  variant="caption"
                  style={{
                    color: isActive ? theme.colors.text.onAccent : theme.colors.text.secondary,
                  }}
                >
                  {opt.label}
                </ThemedText>
              </GlassSurface>
            </Pressable>
          );
        })}
      </View>

      {active === 'assistido' ? (
        <GlassCard>
          <ThemedText variant="caption" color="secondary" style={{ marginBottom: theme.spacing.sm }}>
            Sua nota
          </ThemedText>
          <RatingControl value={status.data?.rating ?? null} onChange={rate} />
        </GlassCard>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  cell: { flex: 1 },
  button: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
});
