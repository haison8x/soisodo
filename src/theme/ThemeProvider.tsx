import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { resolveColors, theme, type ColorScheme } from './tokens';

type ThemeValue = ReturnType<typeof buildTheme>;

function buildTheme(scheme: ColorScheme) {
  return { ...theme, colors: resolveColors(scheme), scheme };
}

const ThemeContext = createContext<ThemeValue>(buildTheme('light'));

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = (useColorScheme() ?? 'light') as ColorScheme;
  const value = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
