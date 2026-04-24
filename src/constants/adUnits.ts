import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

export const AD_UNITS = {
  banner: Platform.select({
    android: 'ca-app-pub-8386795729138351/5993605118',
    ios: 'ca-app-pub-8386795729138351/7987829516',
  }) ?? TestIds.BANNER,
  appOpen: Platform.select({
    android: 'ca-app-pub-8386795729138351/6888167193',
    ios: 'ca-app-pub-8386795729138351/3605731374',
  }) ?? TestIds.APP_OPEN,
  rewarded: Platform.select({
    android: 'ca-app-pub-8386795729138351/1847234719',
    ios: 'ca-app-pub-8386795729138351/5361666173',
  }) ?? TestIds.REWARDED,
  nativeAdvanced: Platform.select({
    android: 'ca-app-pub-8386795729138351/4122403052',
    ios: 'ca-app-pub-8386795729138351/4918813042',
  }) ?? TestIds.NATIVE,
  rewardedInterstitial: Platform.select({
    android: 'ca-app-pub-8386795729138351/2809321388',
    ios: 'ca-app-pub-8386795729138351/6231894714',
  }) ?? TestIds.REWARDED_INTERSTITIAL,
  interstitial: Platform.select({
    android: 'ca-app-pub-8386795729138351/97412784',
    ios: 'ca-app-pub-8386795729138351/6674747843',
  }) ?? TestIds.INTERSTITIAL,
} as const;

export type AdUnitKey = keyof typeof AD_UNITS;

export const AD_FREE_DURATION_MS = 72 * 60 * 60 * 1000;
export const SODO_REWARDED_THROTTLE_MS = 10 * 60 * 1000;
export const SODO_REWARDED_MIN_COUNT = 10;
