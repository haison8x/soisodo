// Primitive palette — internal use only; screens import Semantic tokens below
const Primitives = {
  Blue500: '#007AFF',
  Green500: '#34C759',
  Red500: '#FF3B30',
  Orange500: '#F97316',
  Slate50: '#F8FAFC',
  Slate100: '#F1F5F9',
  Slate200: '#E2E8F0',
  Slate300: '#CBD5E1',
  Slate400: '#94A3B8',
  Slate500: '#64748B',
  Slate600: '#475569',
  Slate700: '#334155',
  Slate800: '#1E293B',
  Gray50: '#F2F2F7',
  Gray200: '#E5E5EA',
  Gray400: '#8E8E93',
  Gray600: '#6E6E73',
  Gray900: '#1C1C1E',
  White: '#FFFFFF',
  Black: '#000000',
} as const;

// Semantic tokens — use these in all screens and components
export const Colors = {
  primary: Primitives.Blue500,
  primaryLight: '#F0F7FF',
  success: Primitives.Green500,
  successLight: '#F0FFF4',
  danger: Primitives.Red500,
  warning: Primitives.Orange500,

  background: Primitives.Slate50,
  surface: Primitives.White,
  surfaceSecondary: Primitives.Slate100,
  surfaceMap: Primitives.Gray900,

  border: Primitives.Slate200,
  separator: Primitives.Gray200,

  textPrimary: Primitives.Slate800,
  textSecondary: Primitives.Slate500,
  textTertiary: Primitives.Slate400,
  textOnPrimary: Primitives.White,
  textOnDark: Primitives.White,

  overlay: 'rgba(0,0,0,0.5)',
  glassDark: 'rgba(0,122,255,0.9)',
  glassLight: 'rgba(255,255,255,0.9)',

  // Semantic: info/hint boxes (sky palette)
  hintBorder: '#BAE6FD',
  hintText: '#0369A1',

  // Semantic: premium / success states
  successDark: '#2F855A',

  // Semantic: dark overlay surfaces (e.g. OCR modal)
  surfaceDark: '#0F172A',

  // Semantic: map line on satellite tiles
  mapLineSatellite: '#FFD60A',

  // Universal shadow base (always black, matches RN convention)
  shadow: '#000000',
} as const;

export type ColorKey = keyof typeof Colors;
