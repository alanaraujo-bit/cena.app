import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { brandGradient, useTheme } from '@/theme';
import { GlassSurface } from './GlassSurface';
import { ThemedText } from './ThemedText';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <GlassSurface intensity="subtle" radius={theme.radii.pill} style={styles.container}>
      {segments.map((seg) => {
        const active = seg.value === value;
        return (
          <Pressable
            key={seg.value}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (active) return;
              void Haptics.selectionAsync();
              onChange(seg.value);
            }}
          >
            {active ? (
              <LinearGradient
                colors={brandGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[StyleSheet.absoluteFill, { borderRadius: theme.radii.pill }]}
              />
            ) : null}
            <ThemedText
              variant="callout"
              color={active ? 'onAccent' : 'secondary'}
              style={styles.label}
            >
              {seg.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  label: { paddingHorizontal: 8 },
});
