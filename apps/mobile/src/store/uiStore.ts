import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemePreference = 'system' | 'light' | 'dark';

/**
 * Pure UI state only (theme choice, transient flags). Server state lives in
 * TanStack Query; this store must never cache API data.
 */
interface UiState {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  /** True once the persisted store has rehydrated from disk. */
  hydrated: boolean;
  setHydrated: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      themePreference: 'system',
      setThemePreference: (themePreference) => set({ themePreference }),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'cena-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themePreference: state.themePreference }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
