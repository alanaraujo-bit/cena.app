import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { ThemedText } from './ThemedText';

interface RatingControlProps {
  /** Current rating on the 0–10 scale, or null if unrated. */
  value: number | null;
  onChange: (value: number) => void;
  size?: number;
  showValue?: boolean;
}

const STARS = 5;

/**
 * Five-star control with half-star precision, mapped onto the product's 0–10
 * scale (each star = 2 points, a half star = 1). Tapping the left half of a
 * star gives the odd value, the right half the even value.
 */
export function RatingControl({ value, onChange, size = 34, showValue = true }: RatingControlProps) {
  const theme = useTheme();
  const current = value ?? 0;

  const handlePress = (starIndex: number) => (e: GestureResponderEvent) => {
    const x = e.nativeEvent.locationX;
    const half = x < size / 2;
    const points = starIndex * 2 + (half ? 1 : 2); // 1..10
    void Haptics.selectionAsync();
    onChange(points);
  };

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {Array.from({ length: STARS }).map((_, i) => {
          const full = (i + 1) * 2;
          const halfThreshold = full - 1;
          const name = current >= full ? 'star-fill' : current >= halfThreshold ? 'star-half' : 'star';
          const color =
            current >= halfThreshold ? theme.colors.status.warning : theme.colors.text.tertiary;
          return (
            <Pressable key={i} onPress={handlePress(i)} hitSlop={4}>
              <Icon name={name} size={size} color={color} />
            </Pressable>
          );
        })}
      </View>
      {showValue ? (
        <ThemedText variant="headline" color={value != null ? 'primary' : 'tertiary'}>
          {value != null ? value.toFixed(1) : '—'}
          <ThemedText variant="caption" color="tertiary">
            {' '}
            / 10
          </ThemedText>
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stars: { flexDirection: 'row', gap: 4 },
});
