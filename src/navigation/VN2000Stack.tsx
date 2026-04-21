import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VN2000Screen from '../screens/VN2000Screen';
import ConvertGoogleScreen from '../screens/ConvertGoogleScreen';
import type { VN2000StackParamList } from '../types/navigation';

const Stack = createStackNavigator<VN2000StackParamList>();

const VN2000Stack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="VN2000Main" component={VN2000Screen} />
    <Stack.Screen name="ConvertGoogle" component={ConvertGoogleScreen} />
  </Stack.Navigator>
);

export default VN2000Stack;
