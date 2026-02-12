import React from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, TouchableOpacity, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Globe, Smartphone, Info, Map as MapIcon, ExternalLink } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const PLANNING_DATA = [
    {
        province: 'Bình Dương',
        name: 'Cổng thông tin Quy hoạch Bình Dương',
        web: 'http://qkhsdd.binhduong.gov.vn',
        app: 'Quy hoạch xây dựng Bình Dương',
        features: 'Cho phép nhập chính xác số tờ, số thửa.'
    },
    {
        province: 'Đồng Nai',
        name: 'DNAILIS (Rất phổ biến)',
        web: 'https://atlas.dongnai.gov.vn',
        app: 'DNAILIS',
        features: 'App này rất mạnh, tra cứu tờ/thửa cực nhanh.'
    },
    {
        province: 'Hà Nội',
        name: 'Quy hoạch Hà Nội',
        web: 'https://quyhoach.hanoi.vn',
        app: 'Quy hoạch Hà Nội',
        features: 'Dữ liệu đôi khi cập nhật chậm hơn so với thực tế biến động đất đai.'
    },
    {
        province: 'Đà Nẵng',
        name: 'Cổng thông tin đất đai Đà Nẵng',
        web: 'https://ttdd.tnmt.danang.gov.vn',
        app: null,
        features: 'Có mục "Tra cứu thông tin thửa đất" bằng số tờ, số thửa.'
    },
    {
        province: 'Long An',
        name: 'QHSDD.LA',
        web: null,
        app: 'QHSDD.LA',
        features: 'Tra cứu theo tờ thửa, định vị GPS.'
    },
    {
        province: 'Khánh Hòa',
        name: 'Quy hoạch Khánh Hòa',
        web: null,
        app: 'Quy hoạch Khánh Hòa',
        features: 'Tra cứu bản đồ quy hoạch sử dụng đất.'
    }
];

const PlanningScreen = () => {
    const navigation = useNavigation();

    const renderCard = (item, index) => (
        <View key={index} style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.provinceBadge}>
                    <Text style={styles.provinceText}>{item.province}</Text>
                </View>
                <Text style={styles.appName}>{item.name}</Text>
            </View>

            <View style={styles.cardBody}>
                {item.web && (
                    <View style={styles.infoRow}>
                        <Globe size={16} color="#007AFF" />
                        <Text style={styles.infoLabel}>Web:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>{item.web}</Text>
                    </View>
                )}

                {item.app && (
                    <View style={styles.infoRow}>
                        <Smartphone size={16} color="#34C759" />
                        <Text style={styles.infoLabel}>App:</Text>
                        <Text style={styles.infoValue}>{item.app}</Text>
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.featureRow}>
                    <Info size={16} color="#8E8E93" />
                    <Text style={styles.featureText}>{item.features}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                {navigation.canGoBack() && (
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <ChevronLeft size={28} color="#1C1C1E" />
                    </TouchableOpacity>
                )}
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Tra cứu Quy hoạch</Text>
                    <Text style={styles.headerSubtitle}>Thông tin ứng dụng & website chính thống</Text>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.introCard}>
                    <MapIcon size={32} color="#8B5CF6" />
                    <Text style={styles.introText}>
                        Dưới đây là danh sách các cổng thông tin và ứng dụng quy hoạch chính thức của các tỉnh thành.
                        Bạn có thể tìm kiếm các ứng dụng này trên App Store hoặc CH Play.
                    </Text>
                </View>

                {PLANNING_DATA.map((item, index) => renderCard(item, index))}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Thông tin được tổng hợp cho mục đích tham khảo.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backBtn: {
        marginRight: 10,
        marginLeft: -5,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 2,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    introCard: {
        backgroundColor: '#F0F7FF',
        padding: 20,
        borderRadius: 20,
        marginBottom: 25,
        flexDirection: 'row',
        alignItems: 'center',
    },
    introText: {
        flex: 1,
        marginLeft: 15,
        fontSize: 14,
        color: '#334155',
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    cardHeader: {
        marginBottom: 15,
    },
    provinceBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    provinceText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#475569',
        textTransform: 'uppercase',
    },
    appName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    cardBody: {
        gap: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginLeft: 8,
        width: 45,
    },
    infoValue: {
        fontSize: 14,
        color: '#007AFF',
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: 4,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    featureText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 10,
        flex: 1,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    footer: {
        marginTop: 10,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
    }
});

export default PlanningScreen;
