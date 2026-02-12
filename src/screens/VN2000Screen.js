import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Info } from 'lucide-react-native';

const VN2000Screen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chuyển Đổi VN2000</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Compass size={48} color="#0084FF" strokeWidth={1.5} style={styles.mainIcon} />
                    <Text style={styles.welcomeText}>Công cụ chuyển đổi VN2000 đang được phát triển</Text>
                    <Text style={styles.subText}>
                        Tính năng này sẽ giúp bạn chuyển đổi tọa độ VN2000 sang WGS84 và ngược lại một cách chính xác nhất.
                    </Text>
                </View>

                <View style={[styles.card, styles.hintCard]}>
                    <View style={styles.hintHeader}>
                        <Info size={20} color="#0369A1" />
                        <Text style={styles.hintTitle}>Thông tin</Text>
                    </View>
                    <Text style={styles.hintDescription}>
                        Hệ tọa độ VN-2000 là hệ tọa độ quốc gia của Việt Nam. Việc chuyển đổi chính xác giữa các hệ tọa độ là rất quan trọng trong đo đạc và bản đồ.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    mainIcon: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#334155',
        textAlign: 'center',
        marginBottom: 12,
    },
    subText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
    },
    hintCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
        borderWidth: 1,
        alignItems: 'flex-start',
    },
    hintHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    hintTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0369A1',
    },
    hintDescription: {
        fontSize: 13,
        color: '#0369A1',
        lineHeight: 18,
    },
});

export default VN2000Screen;
