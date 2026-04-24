import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TabNavigator from './src/navigation/TabNavigator';
import { StatusBar } from 'expo-status-bar';
import mobileAds from 'react-native-google-mobile-ads';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/components/shared/ToastProvider';
import AdFreeService from './src/services/AdFreeService';

mobileAds()
  .initialize()
  .then(() => AdFreeService.initialize())
  .catch(() => AdFreeService.initialize());

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <ToastProvider>
            <StatusBar style="auto" />
            <TabNavigator />
          </ToastProvider>
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
