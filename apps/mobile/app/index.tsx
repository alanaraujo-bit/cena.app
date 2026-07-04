import { ActivityIndicator, View } from 'react-native';
import { AppBackground } from '@/design-system';
import { useTheme } from '@/theme';

/**
 * Bare entry route. The auth gate in the root layout immediately redirects to
 * (auth), (onboarding) or (tabs); this just avoids a blank flash meanwhile.
 */
export default function Index() {
  const theme = useTheme();
  return (
    <AppBackground>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.colors.accent.onSurface} size="large" />
      </View>
    </AppBackground>
  );
}
