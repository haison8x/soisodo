import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, FileText, Settings as SettingsIcon, Map, Compass } from 'lucide-react-native';

// Import navigation stacks
import HomeStack from './HomeStack';
import SettingsStack from './SettingsStack';

// Import screens
import SoDoScreen from '../screens/SoDoScreen';
import PlanningScreen from '../screens/PlanningScreen';
import VN2000Stack from './VN2000Stack';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AdBanner from '../components/AdBanner';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    const insets = useSafeAreaInsets();

    // Calculate adaptive bottom position
    const safeBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 25 : 20);
    const tabBarHeight = 80;
    const adBannerBottom = safeBottom + tabBarHeight + 12;

    return (
        <View style={{ flex: 1 }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let IconComponent;

                        if (route.name === 'Trang chủ') {
                            IconComponent = Home;
                        } else if (route.name === 'Sổ đỏ') {
                            IconComponent = FileText;
                        } else if (route.name === 'Quy hoạch') {
                            IconComponent = Map;
                        } else if (route.name === 'VN2000') {
                            IconComponent = Compass;
                        } else if (route.name === 'Cài đặt') {
                            IconComponent = SettingsIcon;
                        }

                        return (
                            <View style={[
                                styles.iconContainer,
                                focused && styles.activeIconContainer
                            ]}>
                                <IconComponent
                                    size={22}
                                    color={color}
                                    strokeWidth={focused ? 2.5 : 2}
                                />
                            </View>
                        );
                    },
                    tabBarActiveTintColor: '#0084FF',
                    tabBarInactiveTintColor: '#8E8E93',
                    headerShown: false,
                    tabBarShowLabel: true,
                    tabBarLabelPosition: 'below-icon',
                    tabBarLabelStyle: {
                        fontSize: 11,
                        fontWeight: '600',
                        marginBottom: 8,
                    },
                    tabBarItemStyle: {
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingTop: 8,
                    },
                    tabBarTransparent: true,
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
                        <View style={{
                            flex: 1,
                            backgroundColor: '#FFFFFF',
                            borderRadius: 10,
                            shadowColor: '#000',
                            shadowOffset: {
                                width: 0,
                                height: 4,
                            },
                            shadowOpacity: 0.15,
                            shadowRadius: 12,
                            elevation: 8,
                        }} />
                    ),

                })}
            >
                <Tab.Screen name="Trang chủ" component={HomeStack} />
                <Tab.Screen name="VN2000" component={VN2000Stack} />
                <Tab.Screen name="Sổ đỏ" component={SoDoScreen} />
                <Tab.Screen name="Quy hoạch" component={PlanningScreen} />
                <Tab.Screen name="Cài đặt" component={SettingsStack} />
            </Tab.Navigator>

            {/* AdBanner positioned above the Bottom Tab Bar */}
            <View style={{
                position: 'absolute',
                bottom: adBannerBottom,
                left: 0,
                right: 0,
                alignItems: 'center',
                pointerEvents: 'box-none'
            }}>
                <AdBanner />
            </View>
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
    activeIconContainer: {
        backgroundColor: '#F0F7FF',
    }
});

export default TabNavigator;

