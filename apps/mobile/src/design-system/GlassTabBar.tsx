import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { brandGradient, useTheme } from '@/theme';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';
import { ThemedText } from './ThemedText';

/** Route name → tab icon + label. Order here is the on-screen order. */
const TABS: { route: string; icon: IconName; label: string }[] = [
  { route: 'index', icon: 'feed', label: 'Feed' },
  { route: 'buscar', icon: 'search', label: 'Buscar' },
  { route: 'ranking', icon: 'ranking', label: 'Ranking' },
  { route: 'perfil', icon: 'profile', label: 'Perfil' },
];

interface GlassTabBarProps extends BottomTabBarProps {
  onLogPress: () => void;
}

export function GlassTabBar({ state, navigation, onLogPress }: GlassTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  const renderTab = (tab: (typeof TABS)[number]) => {
    const routeIndex = state.routes.findIndex((r) => r.name === tab.route);
    const focused = state.index === routeIndex;

    const onPress = () => {
      void Haptics.selectionAsync();
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[routeIndex]?.key,
        canPreventDefault: true,
      });
      if (!focused && !event.defaultPrevented) {
        navigation.navigate(tab.route);
      }
    };

    const color = focused ? theme.colors.accent.onSurface : theme.colors.text.tertiary;

    return (
      <Pressable
        key={tab.route}
        onPress={onPress}
        style={styles.tab}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={tab.label}
      >
        <Icon name={tab.icon} size={24} color={color} weight={focused ? 'semibold' : 'regular'} />
        <ThemedText variant="micro" style={{ color }}>
          {tab.label}
        </ThemedText>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]} pointerEvents="box-none">
      <GlassSurface elevated intensity="strong" radius={theme.radii.xxl} style={styles.bar}>
        <View style={styles.side}>{left.map(renderTab)}</View>
        <LogButton onPress={onLogPress} />
        <View style={styles.side}>{right.map(renderTab)}</View>
      </GlassSurface>
    </View>
  );
}

function LogButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[styles.logWrap, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Registrar"
        onPressIn={() => (scale.value = withSpring(0.9, theme.motion.springBouncy))}
        onPressOut={() => (scale.value = withSpring(1, theme.motion.springBouncy))}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
      >
        <LinearGradient
          colors={brandGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logButton}
        >
          <Icon name="log" size={30} color={theme.colors.text.onAccent} weight="bold" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    width: '100%',
    maxWidth: 460,
  },
  side: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
    minWidth: 56,
  },
  logWrap: {
    marginHorizontal: 6,
  },
  logButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
