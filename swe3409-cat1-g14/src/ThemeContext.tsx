// src/ThemeContext.tsx
//
// Holds the current colour mode (light or dark) for the whole app.
//
// Usage in any screen or component:
//
//   const { theme, mode, toggle } = useTheme();
//
// Then use theme.bg, theme.card, theme.text, etc. in your StyleSheet.
// Never hardcode a colour again — read it from the theme.
//
// The user's choice is saved to disk so it survives an app restart.

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { lightTheme, darkTheme, Theme } from './theme.ts';

const STORAGE_KEY = 'milkcheck.theme';

type Mode = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  mode: Mode;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && (saved === 'light' || saved === 'dark')) {
          setMode(saved);
        }
      } catch {
        // If storage fails, just keep the default (light).
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {
      // Ignore write errors — the app keeps working, just without persistence.
    });
  }, [mode, hydrated]);

  const toggle = useCallback(() => {
    setMode((m) => (m === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: mode === 'light' ? lightTheme : darkTheme,
      mode,
      toggle,
    }),
    [mode, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a <ThemeProvider>');
  }
  return ctx;
}