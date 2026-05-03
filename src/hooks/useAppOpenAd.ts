import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { AppOpenAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { AD_UNITS } from '../constants/adUnits';
import AdFreeService from '../services/AdFreeService';

// Show at most once per 4 hours when returning from background
const THROTTLE_MS = 4 * 60 * 60 * 1000;

export const useAppOpenAd = () => {
  const isLoadedRef = useRef(false);
  const lastShownRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (AdFreeService.isAdSuppressed()) return;

    const unitId = __DEV__ ? TestIds.APP_OPEN : AD_UNITS.appOpen;
    const ad = AppOpenAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: true });

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      isLoadedRef.current = true;
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      isLoadedRef.current = false;
      lastShownRef.current = Date.now();
      if (!AdFreeService.isAdSuppressed()) {
        ad.load();
      }
    });

    ad.load();

    const tryShowAd = () => {
      if (AdFreeService.isAdSuppressed()) return;
      if (!isLoadedRef.current) return;
      if (Date.now() - lastShownRef.current < THROTTLE_MS) return;
      
      try {
        ad.show();
      } catch (error) {
        console.warn('AppOpenAd show error:', error);
        isLoadedRef.current = false;
      }
    };

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        tryShowAd();
      }
      appStateRef.current = nextState;
    });

    return () => {
      unsubLoaded();
      unsubClosed();
      subscription.remove();
    };
  }, []);
};
