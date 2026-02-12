import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const TermsScreen = () => {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft size={28} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Điều khoản sử dụng</Text>
            </View>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text style={styles.text}>
                    <Text style={styles.bold}>1. Chấp nhận điều khoản</Text>{'\n'}
                    Bằng việc tải về, cài đặt và sử dụng ứng dụng Soi Tọa Độ, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định tại đây.{'\n\n'}

                    <Text style={styles.bold}>2. Mục đích sử dụng</Text>{'\n'}
                    Ứng dụng được thiết kế để hỗ trợ người dùng chuyển đổi tọa độ VN-2000 sang hệ tọa độ WGS-84 và hiển thị trên bản đồ. Thông tin chỉ mang tính chất tham khảo.{'\n\n'}

                    <Text style={styles.bold}>3. Giới hạn trách nhiệm</Text>{'\n'}
                    Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng thông tin do ứng dụng cung cấp. Người dùng cần kiểm tra đối chiếu với các nguồn chính thức trước khi ra quyết định giao dịch.{'\n\n'}

                    <Text style={styles.bold}>4. Quyền sở hữu trí tuệ</Text>{'\n'}
                    Mọi nội dung, hình ảnh, mã nguồn của ứng dụng đều thuộc quyền sở hữu của nhà phát triển. Nghiêm cấm sao chép dưới mọi hình thức.{'\n\n'}

                    <Text style={styles.bold}>5. Thay đổi điều khoản</Text>{'\n'}
                    Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào mà không cần báo trước. Việc tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.
                </Text>
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
        padding: 20,
    },
    text: {
        fontSize: 15,
        color: '#334155',
        lineHeight: 24,
    },
    bold: {
        fontWeight: '700',
        color: '#1E293B',
    }
});

export default TermsScreen;
