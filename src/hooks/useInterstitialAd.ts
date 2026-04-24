import { useState, useEffect, useCallback } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../constants/adUnits';
import AdFreeService from '../services/AdFreeService';

const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : AD_UNITS.interstitial,
  { requestNonPersonalizedAdsOnly: true },
);

export const useInterstitialAd = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      interstitial.load();
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showAd = useCallback(
    (onComplete?: () => void) => {
      if (AdFreeService.isAdSuppressed()) {
        onComplete?.();
        return;
      }

      if (loaded) {
        const unsubscribeEarned = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          onComplete?.();
          unsubscribeEarned();
        });
        interstitial.show();
      } else {
        onComplete?.();
        interstitial.load();
      }
    },
    [loaded],
  );

  return { showAd, loaded };
};
