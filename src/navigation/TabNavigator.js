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
import VN2000Screen from '../screens/VN2000Screen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
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
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 10,
                },
                tabBarTransparent: true,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 25 : 15,
                    left: 10,
                    right: 10,
                    height: 65,
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
            <Tab.Screen name="VN2000" component={VN2000Screen} />
            <Tab.Screen name="Sổ đỏ" component={SoDoScreen} />
            <Tab.Screen name="Quy hoạch" component={PlanningScreen} />
            <Tab.Screen name="Cài đặt" component={SettingsStack} />
        </Tab.Navigator>
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

