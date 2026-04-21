// Matches iOS Dynamic Type approximate sizes
export const Typography = {
  fontSizes: {
    xs: 11,   // caption2
    sm: 12,   // caption1
    md: 14,   // subheadline / footnote
    base: 16, // body
    lg: 17,   // headline
    xl: 20,   // title3
    xxl: 24,  // title2
    xxxl: 28, // title1 / largeTitle
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
} as const;
