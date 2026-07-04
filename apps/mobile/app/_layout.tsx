import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useColorSchemeResolved } from '@/theme';
import { queryClient } from '@/lib/queryClient';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemedStatusBar />
            <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="log"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStatusBar() {
  const scheme = useColorSchemeResolved();
  return <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />;
}
