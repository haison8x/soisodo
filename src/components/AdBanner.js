import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual Ad Unit ID from AdMob
const AD_UNIT_ID = Platform.select({
    android: 'ca-app-pub-8386795729138351/5993605118',
    ios: 'ca-app-pub-8386795729138351/5993605118', // Use test ID or real ID if available for iOS
}) || TestIds.BANNER;

const AdBanner = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        checkPremiumStatus();
    }, []);

    const checkPremiumStatus = async () => {
        try {
            const status = await AsyncStorage.getItem('is_premium');
            setIsPremium(status === 'true');
        } catch (error) {
            console.error('Error checking premium status:', error);
        }
    };

    if (isPremium) {
        return null;
    }

    return (
        <View style={styles.container}>
            <BannerAd
                unitId={__DEV__ ? TestIds.BANNER : AD_UNIT_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                onAdLoaded={() => setAdLoaded(true)}
                onAdFailedToLoad={(error) => {
                    console.error('Ad failed to load: ', error);
                    setAdLoaded(false);
                }}
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
