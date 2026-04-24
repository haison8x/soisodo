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
            position: 'absolute',
            bottom: safeBottom,
            left: 10,
            right: 10,
            height: tabBarHeight,
            borderTopWidth: 0,
            elevation: 0,
            backgroundColor: 'transparent',
          },
          tabBarBackground: () => (
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surface,
                borderRadius: Radius.md,
                shadowColor: Colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            />
          ),
        })}
      >
        <Tab.Screen name="Trang chủ" component={HomeStack} />
        <Tab.Screen name="VN2000" component={VN2000Stack} />
        <Tab.Screen name="Sổ đỏ" component={SoDoScreen} />
        <Tab.Screen name="Quy hoạch" component={PlanningScreen} />
        <Tab.Screen name="Cài đặt" component={SettingsStack} />
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
