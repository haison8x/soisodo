import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/components/shared/ToastProvider';
import AdFreeService from './src/services/AdFreeService';
import { useAppOpenAd } from './src/hooks/useAppOpenAd';

mobileAds()
  .initialize()
  .then(() => AdFreeService.initialize())
  .catch(() => AdFreeService.initialize());

const AppContent = () => {
  useAppOpenAd();
  return (
    <>
      <StatusBar style="auto" />
      <TabNavigator />
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
