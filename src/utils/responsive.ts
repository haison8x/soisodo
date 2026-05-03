import { Dimensions, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

// Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

export const isTablet = width >= 768;

export const scale = (size: number) => wp((size / guidelineBaseWidth) * 100);
export const verticalScale = (size: number) => hp((size / guidelineBaseHeight) * 100);
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Scale font size based on device type.
 * On iPad, we significantly increase font sizes to ensure readability.
 */
export const fontScale = (size: number) => {
  if (isTablet) {
    // Further reduce to 0.45 for the perfect balance on iPad
    return moderateScale(size, 0.45);
  }
  // Moderate scaling for phones
  return moderateScale(size, 0.3);
};

export { wp, hp };
