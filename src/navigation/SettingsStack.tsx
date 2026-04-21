import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import UserManualScreen from '../screens/settings/UserManualScreen';
import AppInfoScreen from '../screens/settings/AppInfoScreen';
import TermsScreen from '../screens/settings/TermsScreen';
import PrivacyScreen from '../screens/settings/PrivacyScreen';
import type { SettingsStackParamList } from '../types/navigation';

const Stack = createStackNavigator<SettingsStackParamList>();

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="UserManual" component={UserManualScreen} />
    <Stack.Screen name="AppInfo" component={AppInfoScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
  </Stack.Navigator>
);

export default SettingsStack;
