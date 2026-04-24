import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ShieldCheck } from 'lucide-react-native';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { useTheme } from '../../theme/ThemeProvider';

const LAST_UPDATED = '01/01/2025';

const SECTIONS = [
  {
    title: '1. Thu thập thông tin',
    body: 'Chúng tôi cam kết không thu thập bất kỳ thông tin cá nhân hay dữ liệu người dùng nào khi bạn sử dụng ứng dụng.',
  },
  {
    title: '2. Sử dụng thông tin',
    body: 'Vì không thu thập dữ liệu, chúng tôi cũng không sử dụng bất kỳ thông tin nào của bạn cho mục đích bên ngoài ứng dụng.',
  },
  {
    title: '3. Chia sẻ thông tin',
    body: 'Chúng tôi không chia sẻ bất kỳ dữ liệu nào với bên thứ ba.',
  },
  {
    title: '4. Bảo mật dữ liệu',
    body: 'Mọi thao tác tính toán tọa độ được thực hiện trực tiếp trên thiết bị của bạn.',
  },
  {
    title: '5. Quyền của người dùng',
    body: 'Quyền riêng tư của bạn được bảo mật tuyệt đối vì ứng dụng hoạt động hoàn toàn ngoại tuyến với dữ liệu người dùng.',
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
        {/* Privacy highlight intro card — Apple HIG iOS 14+ privacy pattern */}
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
          accessibilityLabel={`Quyền riêng tư được bảo vệ. Ứng dụng hoạt động hoàn toàn offline — dữ liệu của bạn không bao giờ rời khỏi thiết bị. Cập nhật lần cuối: ${LAST_UPDATED}`}
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
            Ứng dụng hoạt động hoàn toàn offline — dữ liệu của bạn không bao giờ rời khỏi thiết bị.
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
