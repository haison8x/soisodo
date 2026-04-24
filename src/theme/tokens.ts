import { Platform } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

// ─── COLORS (semantic, light + dark) ───────────────────────────────────────

type ColorPair = { light: string; dark: string };

export const colorTokens = {
  background:        { light: '#F2F2F7', dark: '#000000' },
  backgroundGrouped: { light: '#F2F2F7', dark: '#1C1C1E' },
  surface:           { light: '#FFFFFF', dark: '#1C1C1E' },
  surfaceElevated:   { light: '#FFFFFF', dark: '#2C2C2E' },
  surfaceSecondary:  { light: '#F1F5F9', dark: '#3A3A3C' },

  label:             { light: '#1E293B', dark: '#FFFFFF'   },
  labelSecondary:    { light: '#64748B', dark: '#EBEBF599' },
  labelTertiary:     { light: '#94A3B8', dark: '#EBEBF54D' },
  placeholder:       { light: '#94A3B8', dark: '#EBEBF566' },

  separator:         { light: '#E5E5EA', dark: '#38383A' },
  separatorOpaque:   { light: '#C6C6C8', dark: '#48484A' },
  border:            { light: '#E2E8F0', dark: '#48484A' },

  primary:           { light: '#007AFF', dark: '#0A84FF' },
  success:           { light: '#34C759', dark: '#30D158' },
  warning:           { light: '#F97316', dark: '#FF9F0A' },
  danger:            { light: '#FF3B30', dark: '#FF453A' },
  accent:            { light: '#8B5CF6', dark: '#BF5AF2' },

  fillPrimary:       { light: '#007AFF1A', dark: '#0A84FF29' },
  fillSecondary:     { light: '#7878801C', dark: '#7878805C' },
  fillTertiary:      { light: '#7676801E', dark: '#7676803D' },

  successLight:      { light: '#F0FFF4', dark: '#1A3A2A' },
  primaryLight:      { light: '#F0F7FF', dark: '#0A2540' },
  hintBorder:        { light: '#BAE6FD', dark: '#1E4A6B' },
  hintText:          { light: '#0369A1', dark: '#38BDF8' },
  successDark:       { light: '#2F855A', dark: '#4ADE80' },

  overlay:           { light: 'rgba(0,0,0,0.5)',    dark: 'rgba(0,0,0,0.7)'    },
  glassDark:         { light: 'rgba(0,122,255,0.9)', dark: 'rgba(10,132,255,0.85)' },
  glassLight:        { light: 'rgba(255,255,255,0.9)', dark: 'rgba(28,28,30,0.85)' },

  textOnPrimary:     { light: '#FFFFFF', dark: '#FFFFFF' },
  textOnDark:        { light: '#FFFFFF', dark: '#FFFFFF' },
  surfaceMap:        { light: '#1C1C1E', dark: '#000000' },
  mapLineSatellite:  { light: '#FFD60A', dark: '#FFD60A' },
  shadow:            { light: '#000000', dark: '#000000' },
} as const satisfies Record<string, ColorPair>;

// ─── SPACING (scale 4/8) ─────────────────────────────────────────────────────

export const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32, section: 40, huge: 56,
} as const;

// ─── RADIUS ──────────────────────────────────────────────────────────────────

export const radius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
} as const;

// ─── TYPOGRAPHY (Apple HIG scale) ────────────────────────────────────────────

type TypeStyle = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>;

export const typography = {
  largeTitle:  { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: 0.37 },
  title1:      { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: 0.36 },
  title2:      { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, letterSpacing: 0.35 },
  title3:      { fontSize: 20, lineHeight: 25, fontWeight: '600' as const, letterSpacing: 0.38 },
  headline:    { fontSize: 17, lineHeight: 22, fontWeight: '600' as const, letterSpacing: -0.41 },
  body:        { fontSize: 17, lineHeight: 22, fontWeight: '400' as const, letterSpacing: -0.41 },
  callout:     { fontSize: 16, lineHeight: 21, fontWeight: '400' as const, letterSpacing: -0.32 },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const, letterSpacing: -0.24 },
  footnote:    { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, letterSpacing: -0.08 },
  caption1:    { fontSize: 12, lineHeight: 16, fontWeight: '400' as const, letterSpacing: 0 },
  caption2:    { fontSize: 11, lineHeight: 13, fontWeight: '400' as const, letterSpacing: 0.07 },
} as const satisfies Record<string, TypeStyle>;

// ─── FONT FAMILY ─────────────────────────────────────────────────────────────
// iOS: SF Pro system (undefined). Android: Inter hoặc Roboto system.

export const fontFamily = Platform.select({
  ios: undefined,
  android: 'Inter',
  default: 'System',
}) as string | undefined;

// ─── SHADOWS (cross-platform) ─────────────────────────────────────────────────

export const shadow = {
  none: {} as ViewStyle,
  sm: Platform.select<ViewStyle>({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2 },
    android: { elevation: 2 },
    default: {},
  }) ?? {},
  md: Platform.select<ViewStyle>({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 8 },
    android: { elevation: 5 },
    default: {},
  }) ?? {},
  lg: Platform.select<ViewStyle>({
    ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
    android: { elevation: 10 },
    default: {},
  }) ?? {},
} as const;

// ─── THEME RESOLVER ───────────────────────────────────────────────────────────

export type ColorScheme = 'light' | 'dark';

export function resolveColors(scheme: ColorScheme): Record<keyof typeof colorTokens, string> {
  const out = {} as Record<keyof typeof colorTokens, string>;
  (Object.keys(colorTokens) as (keyof typeof colorTokens)[]).forEach(k => {
    out[k] = colorTokens[k][scheme];
  });
  return out;
}

export const theme = { spacing, radius, typography, fontFamily, shadow };
