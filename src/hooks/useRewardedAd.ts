import { useState, useEffect, useCallback, useRef } from 'react';
import { RewardedAd, RewardedAdEventType, AdEventType, TestIds } from 'react-native-google-mobile-ads';

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

    ad.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
    };
  }, [adUnitId]);

  const showAd = useCallback(
    (onRewarded: () => void, onDismissed?: () => void) => {
      if (!isLoaded || !adRef.current) {
        onDismissed?.();
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
