import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const isTablet = width >= 768;

export const scale = (size: number) => (width / guidelineBaseWidth) * size;
export const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Scale font size based on device type.
 * On iPad, we significantly increase font sizes to ensure readability.
 */
export const fontScale = (size: number) => {
  if (isTablet) {
    // Increase by 1.6x for iPad as a base
    return size * 1.6;
  }
  // Moderate scaling for phones
  return moderateScale(size, 0.2);
};
