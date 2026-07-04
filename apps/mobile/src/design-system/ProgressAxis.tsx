import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { brandGradient, useTheme } from '@/theme';
import { ThemedText } from './ThemedText';

interface ProgressAxisProps {
  label: string;
  /** 0–1 normalized score. */
  value: number;
  /** Dim the bar for the currently weakest axis's label, not the bar itself. */
  emphasize?: boolean;
}

export function ProgressAxis({ label, value, emphasize }: ProgressAxisProps) {
  const theme = useTheme();
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemedText variant="caption" color={emphasize ? 'accent' : 'secondary'}>
          {label}
        </ThemedText>
        <ThemedText variant="caption" color="tertiary">
          {pct}%
        </ThemedText>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.glass.border,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: `${pct}%`, height: '100%', borderRadius: 4 }}
        />
      </View>
    </View>
  );
}
