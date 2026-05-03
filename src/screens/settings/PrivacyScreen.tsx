import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ShieldCheck } from 'lucide-react-native';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { useTheme } from '../../theme/ThemeProvider';

const LAST_UPDATED = '03/05/2026';

const SECTIONS = [
  {
    title: '1. Thông tin thu thập',
    body: 'Chúng tôi chỉ yêu cầu các quyền hạn cần thiết để cung cấp tính năng cốt lõi: Hình ảnh/Máy ảnh để quét tọa độ và Vị trí để hiển thị trên bản đồ. Dữ liệu hình ảnh được xử lý trực tiếp trên thiết bị của bạn.',
  },
  {
    title: '2. Sử dụng thông tin',
    body: 'Thông tin thu thập được chỉ dùng để thực hiện các tính năng trong ứng dụng như chuyển đổi tọa độ, hiển thị bản đồ và quản lý gói Premium của bạn thông qua hệ thống của Apple.',
  },
  {
    title: '3. Quảng cáo và Bên thứ ba',
    body: 'Chúng tôi sử dụng Google AdMob để hiển thị quảng cáo trong phiên bản miễn phí. Google có thể sử dụng mã nhận dạng thiết bị để cá nhân hóa quảng cáo. Các giao dịch mua hàng được xử lý bảo mật bởi Apple.',
  },
  {
    title: '4. Bảo mật dữ liệu',
    body: 'Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn để bảo vệ thông tin của bạn. Dữ liệu tọa độ của bạn được lưu trữ cục bộ trên thiết bị và không được tải lên máy chủ của chúng tôi.',
  },
  {
    title: '5. Quyền của người dùng',
    body: 'Bạn có toàn quyền từ chối các quyền truy cập hoặc xóa toàn bộ dữ liệu đã lưu trong ứng dụng bất cứ lúc nào thông qua phần cài đặt thiết bị.',
  },
] as const;

const PrivacyScreen = () => {
  const navigation = useNavigation();
  const t = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: t.colors.backgroundGrouped }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader title="Chính sách bảo mật" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        alwaysBounceVertical
      >
        {/* Privacy highlight intro card */}
        <View
          style={[
            styles.card,
            styles.privacyCard,
            {
              backgroundColor: t.colors.primaryLight,
              borderColor: t.colors.hintBorder,
            },
          ]}
          accessible
          accessibilityLabel={`Quyền riêng tư được bảo vệ. Chúng tôi cam kết bảo mật thông tin cá nhân của bạn. Cập nhật lần cuối: ${LAST_UPDATED}`}
        >
          <View style={styles.privacyHeader}>
            <ShieldCheck size={22} color={t.colors.primary} />
            <Text
              style={[t.typography.headline, styles.privacyTitle, { color: t.colors.primary, fontFamily: t.fontFamily }]}
              accessibilityRole="header"
            >
              Quyền riêng tư được bảo vệ
            </Text>
          </View>

          <Text style={[t.typography.callout, { color: t.colors.hintText, fontFamily: t.fontFamily, marginTop: 6 }]}>
            Chúng tôi cam kết minh bạch và bảo mật tuyệt đối dữ liệu tọa độ của bạn.
          </Text>

          <View style={[styles.divider, { backgroundColor: t.colors.hintBorder, marginVertical: 12 }]} />

          <Text style={[t.typography.caption1, styles.metaLabel, { color: t.colors.hintText, fontFamily: t.fontFamily }]}>
            CẬP NHẬT LẦN CUỐI
          </Text>
          <Text style={[t.typography.callout, { color: t.colors.hintText, fontFamily: t.fontFamily, marginTop: 2 }]}>
            {LAST_UPDATED}
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
  privacyCard: {
    borderWidth: 1,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyTitle: {
    flex: 1,
  },
  metaLabel: {
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});

export default PrivacyScreen;
