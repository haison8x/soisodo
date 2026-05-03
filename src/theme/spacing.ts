import { moderateScale } from '../utils/responsive';

// 4px base grid, scaled for responsive layout
export const Spacing = {
  xs: moderateScale(4, 0.4),
  sm: moderateScale(8, 0.4),
  md: moderateScale(12, 0.4),
  lg: moderateScale(16, 0.4),
  xl: moderateScale(20, 0.4),
  xxl: moderateScale(24, 0.4),
  xxxl: moderateScale(32, 0.4),
  section: moderateScale(40, 0.4),
} as const;
