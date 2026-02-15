import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Info, ShoppingCart, RotateCcw, Trash2, Shield, FileText, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const [isPremium, setIsPremium] = useState(false);
    const [cacheSize, setCacheSize] = useState('Tính toán...');

    useEffect(() => {
        checkPremiumStatus();
        calculateCacheSize();
    }, []);

    const checkPremiumStatus = async () => {
        try {
            const status = await AsyncStorage.getItem('is_premium');
            setIsPremium(status === 'true');
        } catch (error) {
            console.error('Error checking premium status:', error);
        }
    };

    const calculateCacheSize = async () => {
        try {
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) {
                setCacheSize('0 MB');
                return;
            }

            const files = await FileSystem.readDirectoryAsync(cacheDir);
            let totalSize = 0;

            for (const file of files) {
                try {
                    // Try to get file info, ignore if it fails (e.g. permission or deprecated)
                    const fileInfo = await FileSystem.getInfoAsync(cacheDir + file);
                    if (!fileInfo.isDirectory) {
                        totalSize += fileInfo.size;
                    }
                } catch (err) {
                    console.warn('Skipping file size check:', file, err);
                }
            }

            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
            setCacheSize(`${sizeInMB} MB`);
        } catch (error) {
            console.error('Error calculating cache size:', error);
            setCacheSize('Unknown');
        }
    };

    const handleRateApp = () => {
        const storeLink = Platform.OS === 'ios'
            ? 'itms-apps://itunes.apple.com/app/idYOUR_APP_ID?action=write-review'
            : 'market://details?id=com.tranhiepgold.ketquaxosoonline'; // Update with actual package name later

        Linking.canOpenURL(storeLink).then(supported => {
            if (supported) {
                Linking.openURL(storeLink);
            } else {
                // Fallback to web link
                const webLink = Platform.OS === 'ios'
                    ? 'https://apps.apple.com/app/idYOUR_APP_ID'
                    : 'https://play.google.com/store/apps/details?id=com.tranhiepgold.ketquaxosoonline';
                Linking.openURL(webLink);
            }
        }).catch(err => console.error('An error occurred', err));
    };

    const handlePurchase = async () => {
        if (isPremium) {
            Alert.alert('Thông báo', 'Bạn đã là thành viên Premium!');
            return;
        }

        // Simulate purchase flow
        Alert.alert(
            "Xác nhận mua hàng",
            "Mua gói Premium với giá 99.000đ để xóa quảng cáo vĩnh viễn?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Mua ngay",
                    onPress: async () => {
                        try {
                            await AsyncStorage.setItem('is_premium', 'true');
                            setIsPremium(true);
                            Alert.alert('Thành công', 'Cảm ơn bạn đã mua hàng! Đã kích hoạt Premium.');
                        } catch (error) {
                            console.error('Purchase error:', error);
                        }
                    }
                }
            ]
        );
    };

    const handleRestorePurchase = async () => {
        // Simulate restore flow
        try {
            // In a real app, we would check the store receipt here.
            // For now, we just check our local "server" (AsyncStorage) or assume success if logic dictates.
            // If we rely purely on local storage for this mock, it's the same as checkPremiumStatus.
            const status = await AsyncStorage.getItem('is_premium');
            if (status === 'true') {
                setIsPremium(true);
                Alert.alert('Khôi phục thành công', 'Gói Premium của bạn đã được khôi phục.');
            } else {
                Alert.alert('Thông báo', 'Không tìm thấy giao dịch mua hàng nào trước đây.');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể khôi phục mua hàng lúc này.');
        }
    };

    const handleClearCache = async () => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc chắn muốn xóa bộ nhớ tạm không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const cacheDir = FileSystem.cacheDirectory;
                            const files = await FileSystem.readDirectoryAsync(cacheDir);
                            for (const file of files) {
                                await FileSystem.deleteAsync(cacheDir + file, { idempotent: true });
                            }
                            calculateCacheSize(); // Recalculate
                            Alert.alert('Thành công', 'Đã dọn dẹp bộ nhớ tạm.');
                        } catch (error) {
                            console.error('Error clearing cache:', error);
                            Alert.alert('Lỗi', 'Không thể xóa bộ nhớ tạm.');
                        }
                    }
                }
            ]
        );
    };

    const renderSectionHeader = (title) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const renderItem = (icon, title, onPress, rightElement = null, subtitle = null) => (
        <TouchableOpacity style={styles.itemContainer} onPress={onPress}>
            <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                    {icon}
                </View>
                <View>
                    <Text style={styles.itemTitle}>{title}</Text>
                    {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            {rightElement ? rightElement : <ChevronRight size={20} color="#C7C7CC" />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cài đặt</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

                {renderSectionHeader('Hỗ trợ')}
                <View style={styles.sectionContainer}>
                    {renderItem(
                        <Star size={22} color="#007AFF" />,
                        "Đánh giá ứng dụng",
                        handleRateApp,
                        <View style={{ flexDirection: 'row' }}><Star size={16} color="#FFD700" fill="#FFD700" /><Star size={16} color="#FFD700" fill="#FFD700" /><Star size={16} color="#FFD700" fill="#FFD700" /><Star size={16} color="#FFD700" fill="#FFD700" /><Star size={16} color="#FFD700" fill="#FFD700" /></View>
                    )}
                    <View style={styles.separator} />
                    {renderItem(
                        <Info size={22} color="#000" />,
                        "Hướng dẫn sử dụng",
                        () => navigation.navigate('UserManual')
                    )}
                </View>

                {renderSectionHeader('Mua hàng')}
                <View style={styles.sectionContainer}>
                    {isPremium ? (
                        <View style={styles.premiumContainer}>
                            <Text style={styles.premiumText}>Bạn đang sử dụng gói Premium</Text>
                            <Shield size={20} color="#34C759" fill="#34C759" />
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.purchaseItem} onPress={handlePurchase}>
                            <View style={styles.itemLeft}>
                                <View style={styles.iconContainer}>
                                    <ShoppingCart size={22} color="#007AFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.purchaseTitle}>Mua hàng [In-App Billing]</Text>
                                    <Text style={styles.itemSubtitle}>Mua 1 lần xóa quảng cáo vĩnh viễn</Text>
                                </View>
                                <Text style={styles.purchasePrice}>99.000 đ</Text>
                            </View>
                        </TouchableOpacity>
                    )}

                    {!isPremium && <View style={styles.separator} />}

                    {!isPremium && renderItem(
                        <RotateCcw size={22} color="#000" />,
                        "Khôi phục mua hàng",
                        handleRestorePurchase,
                        null,
                        "Nếu bạn đã mua trước đây!\nNhấn vào đây để khôi phục miễn phí!"
                    )}
                </View>

                {renderSectionHeader('Cài đặt')}
                <View style={styles.sectionContainer}>
                    {renderItem(
                        <Trash2 size={22} color="#000" />,
                        "Dọn dẹp bộ nhớ tạm",
                        handleClearCache,
                        <Text style={styles.cacheSize}>{cacheSize}</Text>
                    )}
                </View>

                {renderSectionHeader('Thông tin')}
                <View style={styles.sectionContainer}>
                    {renderItem(
                        <Info size={22} color="#000" />,
                        "Thông tin ứng dụng",
                        () => navigation.navigate('AppInfo')
                    )}
                    <View style={styles.separator} />
                    {renderItem(
                        <FileText size={22} color="#000" />,
                        "Điều khoản sử dụng",
                        () => navigation.navigate('Terms')
                    )}
                    <View style={styles.separator} />
                    {renderItem(
                        <Shield size={22} color="#000" />,
                        "Chính sách bảo mật",
                        () => navigation.navigate('Privacy')
                    )}
                </View>

                <Text style={styles.versionText}>Phiên bản 1.0.0 (Build 1)</Text>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7', // iOS grouped background color
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6E6E73',
        marginBottom: 8,
        marginLeft: 10,
        marginTop: 10,
        textTransform: 'uppercase',
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },
    itemTitle: {
        fontSize: 17,
        color: '#000',
    },
    itemSubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E5EA', // iOS separator color
        marginLeft: 56, // Indent separator to align with text
    },
    purchaseItem: {
        padding: 16,
    },
    purchaseTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#007AFF',
    },
    purchasePrice: {
        fontSize: 17,
        fontWeight: '700',
        color: '#000',
        marginLeft: 8,
    },
    premiumContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#F0FFF4',
    },
    premiumText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2F855A',
    },
    cacheSize: {
        fontSize: 17,
        color: '#8E8E93',
    },
    versionText: {
        textAlign: 'center',
        color: '#8E8E93',
        fontSize: 13,
        marginTop: 10,
        marginBottom: 30,
    }
});

export default SettingsScreen;
