import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../constants/adUnits';
import AdFreeService from '../services/AdFreeService';

interface Props {
  style?: ViewStyle;
  size?: BannerAdSize;
}

const AdBanner = ({ style, size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER }: Props) => {
  if (AdFreeService.isAdSuppressed()) return null;

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : AD_UNITS.banner}
        size={size}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdLoaded={() => {}}
        onAdFailedToLoad={error => console.error('Ad failed to load: ', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});

export default AdBanner;
