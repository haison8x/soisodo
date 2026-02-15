import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AD_UNIT_ID = Platform.select({
    android: 'ca-app-pub-8386795729138351/9741278432',
    ios: 'ca-app-pub-8386795729138351/9741278432', // Use same for now or test ID
}) || TestIds.INTERSTITIAL;

const interstitial = InterstitialAd.createForAdRequest(__DEV__ ? TestIds.INTERSTITIAL : AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: true,
});

export const useInterstitialAd = () => {
    const [loaded, setLoaded] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const checkPremium = async () => {
            const status = await AsyncStorage.getItem('is_premium');
            setIsPremium(status === 'true');
        };
        checkPremium();

        const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setLoaded(true);
        });

        const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            setLoaded(false);
            interstitial.load(); // Load next ad
        });

        // Start loading the first ad
        interstitial.load();

        return () => {
            unsubscribeLoaded();
            unsubscribeClosed();
        };
    }, []);

    const showAd = useCallback((onComplete) => {
        if (isPremium) {
            if (onComplete) onComplete();
            return;
        }

        if (loaded) {
            const unsubscribeEarned = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                if (onComplete) onComplete();
                unsubscribeEarned(); // Important: remove this specific listener
            });
            interstitial.show();
        } else {
            // Ad not loaded, just proceed
            if (onComplete) onComplete();
            interstitial.load();
        }
    }, [loaded, isPremium]);

    return { showAd, loaded };
};
