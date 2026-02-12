import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const UserManualScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hướng dẫn sử dụng</Text>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Giới thiệu</Text>
                    <Text style={styles.text}>
                        Ứng dụng Soi Tọa Độ giúp bạn quản lý, lưu trữ và tra cứu thông tin đất đai một cách dễ dàng.
                        Bạn có thể nhập tọa độ từ giấy chứng nhận quyền sử dụng đất (Sổ đỏ/Sổ hồng) để xem vị trí trên bản đồ.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Nhập tọa độ</Text>
                    <Text style={styles.text}>
                        - <Text style={{ fontWeight: 'bold' }}>Nhập thủ công:</Text> Tại màn hình chính, bạn có thể nhập từng cặp tọa độ X và Y. Nhấn "Thêm Tọa Độ" để lưu vào danh sách.
                        {'\n'}- <Text style={{ fontWeight: 'bold' }}>Quét ảnh (Scan):</Text> Nhấn vào nút "Scan" để chụp ảnh hoặc chọn ảnh từ thư viện. Ứng dụng sẽ tự động nhận diện bảng tọa độ.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Xem Bản Đồ</Text>
                    <Text style={styles.text}>
                        Sau khi đã có danh sách tọa độ, nhấn "Xem Bản Đồ" để hiển thị hình dạng thửa đất trên bản đồ vệ tinh hoặc bản đồ đường phố.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Lưu Dự Án</Text>
                    <Text style={styles.text}>
                        Nhấn "Lưu Lại" để lưu thông tin thửa đất vào danh sách "Sổ đỏ" của bạn. Bạn có thể xem lại, chỉnh sửa hoặc xóa các dự án đã lưu tại tab "Sổ đỏ".
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Tra cứu Quy hoạch</Text>
                    <Text style={styles.text}>
                        Chuyển sang tab "Quy hoạch" để truy cập nhanh các cổng thông tin quy hoạch chính thức của các tỉnh thành.
                    </Text>
                </View>
            </ScrollView>
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
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 8,
    },
    text: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
    }
});

export default UserManualScreen;
