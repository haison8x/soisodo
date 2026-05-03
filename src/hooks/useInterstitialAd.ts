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
    if (AdFreeService.isAdSuppressed()) return;

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      if (!AdFreeService.isAdSuppressed()) {
        interstitial.load();
      }
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      setLoaded(false);
      // Try reload later if not suppressed
      setTimeout(() => {
        if (!AdFreeService.isAdSuppressed()) interstitial.load();
      }, 10000);
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const showAd = useCallback(
    (onComplete?: () => void) => {
      if (AdFreeService.isAdSuppressed()) {
        onComplete?.();
        return;
      }

      if (loaded) {
        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
          onComplete?.();
          unsubscribeClosed();
        });
        interstitial.show();
      } else {
        // Fallback: If not loaded, proceed anyway
        onComplete?.();
        interstitial.load();
      }
    },
    [loaded],
  );

  return { showAd, loaded };
};
