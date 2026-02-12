import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const AppInfoScreen = () => {
    const navigation = useNavigation();
    const version = Constants.expoConfig?.version || '1.0.0';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thông tin ứng dụng</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    {/* Placeholder for App Icon */}
                    <View style={styles.logoPlaceholder}>
                        <Text style={styles.logoText}>Soi Tọa Độ</Text>
                    </View>
                    <Text style={styles.appName}>Soi Tọa Độ VN</Text>
                    <Text style={styles.version}>Phiên bản {version}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Nhà phát triển</Text>
                    <Text style={styles.infoValue}>TranHiepGold</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.infoLabel}>Liên hệ</Text>
                    <Text style={styles.infoValue}>hiepgoldtran@gmail.com</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.copyright}>© 2024 Soi Tọa Độ VN. All rights reserved.</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    content: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
        marginTop: 20,
    },
    logoPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logoText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    appName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    version: {
        fontSize: 16,
        color: '#64748B',
    },
    infoSection: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    infoLabel: {
        fontSize: 16,
        color: '#64748B',
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
    },
    footer: {
        marginTop: 'auto',
        marginBottom: 20,
    },
    copyright: {
        fontSize: 12,
        color: '#94A3B8',
    }
});

export default AppInfoScreen;
