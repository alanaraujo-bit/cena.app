import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { brandGradient, useTheme } from '@/theme';
import { MIN_TOUCH_SIZE } from '@/theme/tokens';
import { ThemedText } from './ThemedText';
import { GlassSurface } from './GlassSurface';

type Variant = 'primary' | 'glass' | 'ghost';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, theme.motion.springBouncy);
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, theme.motion.springBouncy);
  };
  const handlePress = () => {
    if (disabled || loading) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const inactive = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      accessibilityLabel={label}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={inactive}
      style={[
        animatedStyle,
        fullWidth ? styles.fullWidth : undefined,
        { opacity: disabled ? 0.5 : 1, borderRadius: theme.radii.lg },
        style,
      ]}
    >
      {variant === 'primary' ? (
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.inner, { borderRadius: theme.radii.lg }]}
        >
          <Content label={label} loading={loading} onAccent color={theme.colors.text.onAccent} />
        </LinearGradient>
      ) : variant === 'glass' ? (
        <GlassSurface elevated radius={theme.radii.lg} style={styles.inner}>
          <Content label={label} loading={loading} color={theme.colors.text.primary} />
        </GlassSurface>
      ) : (
        <View style={[styles.inner, { borderRadius: theme.radii.lg }]}>
          <Content label={label} loading={loading} color={theme.colors.accent.onSurface} />
        </View>
      )}
    </AnimatedPressable>
  );
}

function Content({
  label,
  loading,
  onAccent,
  color,
}: {
  label: string;
  loading: boolean;
  onAccent?: boolean;
  color: string;
}) {
  if (loading) return <ActivityIndicator color={color} />;
  return (
    <ThemedText variant="subheadline" color={onAccent ? 'onAccent' : 'primary'} style={{ color }}>
      {label}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  inner: {
    minHeight: MIN_TOUCH_SIZE + 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    gap: 8,
  },
});
