import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../constants/adUnits';
import AdFreeService from '../services/AdFreeService';

const AdBanner = () => {
  if (AdFreeService.isAdSuppressed()) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : AD_UNITS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
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
    backgroundColor: 'transparent',
  },
});

export default AdBanner;
