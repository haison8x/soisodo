import { useState, useEffect, useCallback, useRef } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import AdFreeService from '../services/AdFreeService';

export const useRewardedAd = (adUnitId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const adRef = useRef<ReturnType<typeof RewardedAd.createForAdRequest> | null>(null);
  const earnedFlagRef = useRef(false);
  const onRewardedRef = useRef<(() => void) | null>(null);
  const onDismissedRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unitId = __DEV__ ? TestIds.REWARDED : adUnitId;
    const ad = RewardedAd.createForAdRequest(unitId, { requestNonPersonalizedAdsOnly: true });
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    const unsubEarned = ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earnedFlagRef.current = true;
    });

    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      if (earnedFlagRef.current) {
        earnedFlagRef.current = false;
        onRewardedRef.current?.();
      } else {
        onDismissedRef.current?.();
      }
      onRewardedRef.current = null;
      onDismissedRef.current = null;
      setIsLoaded(false);
      ad.load();
    });

    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Rewarded ad error:', error.message);
      // Fallback: If ad fails, still consider it earned to not block user
      earnedFlagRef.current = true;
      setIsLoaded(false);
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
    };
  }, [adUnitId]);

  const showAd = useCallback(
    (onRewarded: () => void, onDismissed?: () => void) => {
      if (AdFreeService.isAdSuppressed()) {
        onRewarded();
        return;
      }

      if (!isLoaded || !adRef.current) {
        // Fallback: If ad not loaded or error, grant reward anyway for better UX
        onRewarded();
        return;
      }
      onRewardedRef.current = onRewarded;
      onDismissedRef.current = onDismissed ?? null;
      adRef.current.show();
    },
    [isLoaded],
  );

  return { showAd, isLoaded };
};
