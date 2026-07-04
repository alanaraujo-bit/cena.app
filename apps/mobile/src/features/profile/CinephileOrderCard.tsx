import { View } from 'react-native';
import { CINEPHILE_RANK_LABELS, type CinephileOrder } from '@cena/shared';
import { GlassCard, ProgressAxis, ThemedText } from '@/design-system';
import { useTheme } from '@/theme';

const AXIS_LABELS = {
  volume: 'Volume',
  diversidade: 'Diversidade',
  profundidade: 'Profundidade',
  consistencia: 'Consistência',
} as const;

export function CinephileOrderCard({ order }: { order: CinephileOrder }) {
  const theme = useTheme();

  return (
    <GlassCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <ThemedText variant="caption" color="tertiary">
            ORDEM CINÉFILA
          </ThemedText>
          <ThemedText variant="headline" color="accent">
            {CINEPHILE_RANK_LABELS[order.rank]}
          </ThemedText>
        </View>
        <ThemedText variant="title">{Math.round(order.icg * 100)}</ThemedText>
      </View>

      <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
        {(Object.keys(AXIS_LABELS) as (keyof typeof AXIS_LABELS)[]).map((axis) => (
          <ProgressAxis
            key={axis}
            label={AXIS_LABELS[axis]}
            value={order.axes[axis]}
            emphasize={axis === order.weakestAxis}
          />
        ))}
      </View>

      {order.nextStepHint ? (
        <ThemedText variant="caption" color="secondary" style={{ marginTop: theme.spacing.md }}>
          💡 {order.nextStepHint}
        </ThemedText>
      ) : null}
    </GlassCard>
  );
}
