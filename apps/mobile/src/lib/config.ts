import { Platform } from 'react-native';

/**
 * Runtime config. `EXPO_PUBLIC_*` vars are inlined at build time by Expo.
 * On a physical device you'll set EXPO_PUBLIC_API_URL to your machine's LAN IP
 * (e.g. http://192.168.0.10:3333); the localhost fallbacks only work in
 * simulators/emulators.
 */
function defaultApiUrl(): string {
  // Android emulator reaches the host machine via 10.0.2.2, not localhost.
  if (Platform.OS === 'android') return 'http://10.0.2.2:3333';
  return 'http://localhost:3333';
}

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? defaultApiUrl(),
} as const;
