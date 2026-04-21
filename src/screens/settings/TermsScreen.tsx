import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../../theme';
import ScreenHeader from '../../components/shared/ScreenHeader';

const TermsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Điều khoản sử dụng" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.text}>
          <Text style={styles.bold}>1. Chấp nhận điều khoản</Text>{'\n'}
          Bằng việc tải về, cài đặt và sử dụng ứng dụng Định Vị Nhà Đất - VN2000, bạn đồng ý tuân
          thủ các điều khoản và điều kiện được quy định tại đây.{'\n\n'}
          <Text style={styles.bold}>2. Mục đích sử dụng</Text>{'\n'}
          Ứng dụng được thiết kế để hỗ trợ người dùng chuyển đổi tọa độ VN-2000 sang hệ tọa độ
          WGS-84 và hiển thị trên bản đồ. Thông tin chỉ mang tính chất tham khảo.{'\n\n'}
          <Text style={styles.bold}>3. Giới hạn trách nhiệm</Text>{'\n'}
          Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng thông
          tin do ứng dụng cung cấp. Người dùng cần kiểm tra đối chiếu với các nguồn chính thức
          trước khi ra quyết định giao dịch.{'\n\n'}
          <Text style={styles.bold}>4. Quyền sở hữu trí tuệ</Text>{'\n'}
          Mọi nội dung, hình ảnh, mã nguồn của ứng dụng đều thuộc quyền sở hữu của nhà phát triển.
          Nghiêm cấm sao chép dưới mọi hình thức.{'\n\n'}
          <Text style={styles.bold}>5. Thay đổi điều khoản</Text>{'\n'}
          Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào mà không cần báo trước.
          Việc tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các
          thay đổi đó.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl },
  text: { fontSize: 15, color: Colors.textPrimary, lineHeight: 24 },
  bold: { fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
});

export default TermsScreen;
