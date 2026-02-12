import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import VN2000Screen from '../screens/VN2000Screen';
import ConvertGoogleScreen from '../screens/ConvertGoogleScreen';

const Stack = createStackNavigator();

const VN2000Stack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="VN2000Main" component={VN2000Screen} />
            <Stack.Screen name="ConvertGoogle" component={ConvertGoogleScreen} />
        </Stack.Navigator>
    );
};

export default VN2000Stack;
