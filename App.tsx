import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/components/shared/ToastProvider';
import AdFreeService from './src/services/AdFreeService';
import { useAppOpenAd } from './src/hooks/useAppOpenAd';
import { requestTrackingPermissionsAsync, getTrackingPermissionsAsync, isAvailable } from 'expo-tracking-transparency';
import { TrackingPermissionModal } from './src/components/shared/TrackingPermissionModal';

const AppContent = () => {
  const [isTrackingModalVisible, setIsTrackingModalVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initApp = async () => {
      try {
        if (Platform.OS === 'ios' && isAvailable()) {
          const { status } = await getTrackingPermissionsAsync();
          if (status === 'undetermined') {
            setIsTrackingModalVisible(true);
            // Don't set isReady yet, wait for modal
            return;
          }
        }
        
        await initializeAds();
        setIsReady(true);
      } catch (error) {
        console.error('Initialization error:', error);
        setIsReady(true); // Proceed anyway
      }
    };

    initApp();
  }, []);

  const initializeAds = async () => {
    try {
      await mobileAds().initialize();
      await AdFreeService.initialize();
    } catch (error) {
      await AdFreeService.initialize();
    }
  };

  const handleContinueTracking = async () => {
    setIsTrackingModalVisible(false);
    await requestTrackingPermissionsAsync();
    await initializeAds();
    setIsReady(true);
  };

  useAppOpenAd();

  return (
    <>
      <StatusBar style="auto" />
      {isReady && <TabNavigator />}
      <TrackingPermissionModal 
        isVisible={isTrackingModalVisible}
        onContinue={handleContinueTracking}
      />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
