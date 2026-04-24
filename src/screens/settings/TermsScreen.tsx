import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { useTheme } from '../../theme/ThemeProvider';

const LAST_UPDATED = '01/01/2025';

const SECTIONS = [
  {
    title: '1. Chấp nhận điều khoản',
    body: 'Bằng việc tải về, cài đặt và sử dụng ứng dụng Định Vị Nhà Đất – VN2000, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định tại đây.',
  },
  {
    title: '2. Mục đích sử dụng',
    body: 'Ứng dụng được thiết kế để hỗ trợ người dùng chuyển đổi tọa độ VN-2000 sang hệ tọa độ WGS-84 và hiển thị trên bản đồ. Thông tin chỉ mang tính chất tham khảo.',
  },
  {
    title: '3. Giới hạn trách nhiệm',
    body: 'Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng thông tin do ứng dụng cung cấp. Người dùng cần kiểm tra đối chiếu với các nguồn chính thức trước khi ra quyết định giao dịch.',
  },
  {
    title: '4. Quyền sở hữu trí tuệ',
    body: 'Mọi nội dung, hình ảnh, mã nguồn của ứng dụng đều thuộc quyền sở hữu của nhà phát triển. Nghiêm cấm sao chép dưới mọi hình thức.',
  },
  {
    title: '5. Thay đổi điều khoản',
    body: 'Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào mà không cần báo trước. Việc tiếp tục sử dụng ứng dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.',
  },
] as const;

const TermsScreen = () => {
  const navigation = useNavigation();
  const t = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: t.colors.backgroundGrouped }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader title="Điều khoản sử dụng" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        alwaysBounceVertical
      >
        {/* Metadata intro */}
        <View
          style={[styles.card, { backgroundColor: t.colors.surface }, t.shadow.sm]}
          accessible
          accessibilityLabel={`Cập nhật lần cuối: ${LAST_UPDATED}. Vui lòng đọc kỹ các điều khoản trước khi sử dụng ứng dụng.`}
        >
          <Text style={[t.typography.caption1, styles.metaLabel, { color: t.colors.labelTertiary, fontFamily: t.fontFamily }]}>
            CẬP NHẬT LẦN CUỐI
          </Text>
          <Text style={[t.typography.callout, { color: t.colors.label, fontFamily: t.fontFamily, marginTop: 2 }]}>
            {LAST_UPDATED}
          </Text>
          <View style={[styles.divider, { backgroundColor: t.colors.separator, marginVertical: 12 }]} />
          <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
            Vui lòng đọc kỹ các điều khoản trước khi sử dụng ứng dụng.
          </Text>
        </View>

        {/* Section cards */}
        {SECTIONS.map((section, index) => (
          <View
            key={index}
            style={[styles.card, { backgroundColor: t.colors.surface }, t.shadow.sm]}
            accessible
            accessibilityLabel={`${section.title}: ${section.body}`}
          >
            <Text
              style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]}
              accessibilityRole="header"
            >
              {section.title}
            </Text>
            <View style={[styles.divider, { backgroundColor: t.colors.separator, marginVertical: 10 }]} />
            <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
              {section.body}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  metaLabel: {
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});

export default TermsScreen;
