import { GlassCard } from './GlassCard';
import { ThemedText } from './ThemedText';

interface StatTileProps {
  label: string;
  value: string;
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <GlassCard style={{ flex: 1 }}>
      <ThemedText variant="title" align="center">
        {value}
      </ThemedText>
      <ThemedText variant="micro" color="tertiary" align="center" style={{ marginTop: 2 }}>
        {label.toUpperCase()}
      </ThemedText>
    </GlassCard>
  );
}
