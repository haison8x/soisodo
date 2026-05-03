import { fontScale } from '../utils/responsive';

// Matches iOS Dynamic Type approximate sizes, now with responsive scaling for iPad
export const Typography = {
  fontSizes: {
    xs: fontScale(11),   // caption2
    sm: fontScale(12),   // caption1
    md: fontScale(14),   // subheadline / footnote
    base: fontScale(16), // body
    lg: fontScale(17),   // headline
    xl: fontScale(20),   // title3
    xxl: fontScale(24),  // title2
    xxxl: fontScale(28), // title1 / largeTitle
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
} as const;
