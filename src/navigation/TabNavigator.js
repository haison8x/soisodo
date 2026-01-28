import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import SoDoScreen from '../screens/SoDoScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Trang chủ') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Chat') {
                        iconName = focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline';
                    } else if (route.name === 'Sổ đỏ') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    } else if (route.name === 'Cài đặt') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 10,
                    left: 20,
                    right: 20,
                    elevation: 10,
                    backgroundColor: '#ffffff',
                    borderRadius: 20,
                    height: 70,
                    paddingBottom: 0,
                    paddingTop: 10,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 5,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginBottom: 5,
                }
            })}
        >
            <Tab.Screen name="Trang chủ" component={HomeScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Sổ đỏ" component={SoDoScreen} />
            <Tab.Screen name="Cài đặt" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
