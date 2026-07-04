import * as SecureStore from 'expo-secure-store';

/**
 * Secure storage for auth tokens. Never put tokens in AsyncStorage — that's
 * plaintext. Access/refresh tokens live here (brief §5.1).
 */
const ACCESS_KEY = 'cena.accessToken';
const REFRESH_KEY = 'cena.refreshToken';

export const tokenStore = {
  async get(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const [accessToken, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(ACCESS_KEY),
      SecureStore.getItemAsync(REFRESH_KEY),
    ]);
    if (!accessToken || !refreshToken) return null;
    return { accessToken, refreshToken };
  },
  async set(tokens: { accessToken: string; refreshToken: string }): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
    ]);
  },
  async clear(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_KEY),
      SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
  },
};
