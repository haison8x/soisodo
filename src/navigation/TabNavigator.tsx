import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, FileText, Settings as SettingsIcon, Map, Compass } from 'lucide-react-native';
import { Colors, Radius, Typography } from '../theme';

import HomeStack from './HomeStack';
import SettingsStack from './SettingsStack';
import SoDoScreen from '../screens/SoDoScreen';
import PlanningScreen from '../screens/PlanningScreen';
import VN2000Stack from './VN2000Stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 20);
  const tabBarHeight = 80;

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          unmountOnBlur: true,
          tabBarIcon: ({ focused, color }) => {
            let IconComponent: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;

            if (route.name === 'Trang chủ') IconComponent = Home;
            else if (route.name === 'Sổ đỏ') IconComponent = FileText;
            else if (route.name === 'Quy hoạch') IconComponent = Map;
            else if (route.name === 'VN2000') IconComponent = Compass;
            else IconComponent = SettingsIcon;

            return (
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <IconComponent size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
              </View>
            );
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textSecondary,
          headerShown: false,
          tabBarShowLabel: true,
          tabBarLabelPosition: 'below-icon',
          tabBarLabelStyle: {
            fontSize: Typography.fontSizes.xs,
            fontWeight: Typography.fontWeights.semibold,
            marginBottom: 8,
          },
          tabBarItemStyle: {
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 8,
          },
          tabBarStyle: {
            height: tabBarHeight + insets.bottom,
            backgroundColor: Colors.surface,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: Colors.separator,
            paddingBottom: insets.bottom,
          },
          tabBarBackground: () => null,
        })}
      >
        <Tab.Screen 
          name="Trang chủ" 
          component={HomeStack} 
          options={{ unmountOnBlur: true }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Trang chủ', { screen: 'HomeMain' });
            },
          })}
        />
        <Tab.Screen 
          name="VN2000" 
          component={VN2000Stack} 
          options={{ unmountOnBlur: true }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('VN2000', { screen: 'VN2000Main' });
            },
          })}
        />
        <Tab.Screen 
          name="Sổ đỏ" 
          component={SoDoScreen} 
          options={{ unmountOnBlur: true }}
        />
        <Tab.Screen 
          name="Quy hoạch" 
          component={PlanningScreen} 
          options={{ unmountOnBlur: true }}
        />
        <Tab.Screen 
          name="Cài đặt" 
          component={SettingsStack} 
          options={{ unmountOnBlur: true }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Cài đặt', { screen: 'SettingsMain' });
            },
          })}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginTop: 5,
  },
  activeIconContainer: { backgroundColor: Colors.primaryLight },
});

export default TabNavigator;
