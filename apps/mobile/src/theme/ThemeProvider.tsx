import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useUiStore } from '@/store/uiStore';
import { darkTheme, lightTheme, type Theme } from './theme';

const ThemeContext = createContext<Theme>(darkTheme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const preference = useUiStore((s) => s.themePreference);

  const theme = useMemo<Theme>(() => {
    const resolved = preference === 'system' ? (systemScheme ?? 'dark') : preference;
    return resolved === 'light' ? lightTheme : darkTheme;
  }, [preference, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Access the active resolved theme. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** The current resolved scheme, handy for status bar / native controls. */
export function useColorSchemeResolved(): 'light' | 'dark' {
  return useTheme().scheme;
}
