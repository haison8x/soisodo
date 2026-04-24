import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { useTheme } from '../../theme/ThemeProvider';

type StepItem = {
  label: string;
  description: string;
};

type Section = {
  number: string;
  title: string;
  body?: string;
  steps?: readonly StepItem[];
};

const SECTIONS: readonly Section[] = [
  {
    number: '1',
    title: 'Giới thiệu',
    body: 'Ứng dụng Định Vị Nhà Đất – VN2000 giúp bạn quản lý, lưu trữ và tra cứu thông tin đất đai một cách dễ dàng. Bạn có thể nhập tọa độ từ giấy chứng nhận quyền sử dụng đất (Sổ đỏ/Sổ hồng) để xem vị trí trên bản đồ.',
  },
  {
    number: '2',
    title: 'Nhập tọa độ',
    steps: [
      {
        label: 'Nhập thủ công',
        description: 'Tại màn hình chính, nhập từng cặp tọa độ X và Y. Nhấn "Thêm Tọa Độ" để lưu vào danh sách.',
      },
      {
        label: 'Quét ảnh (Scan)',
        description: 'Nhấn nút "Scan" để chụp hoặc chọn ảnh từ thư viện. Ứng dụng tự động nhận diện bảng tọa độ.',
      },
    ],
  },
  {
    number: '3',
    title: 'Xem Bản Đồ',
    body: 'Sau khi có danh sách tọa độ, nhấn "Xem Bản Đồ" để hiển thị hình dạng thửa đất trên bản đồ vệ tinh hoặc bản đồ đường phố.',
  },
  {
    number: '4',
    title: 'Lưu Dự Án',
    body: 'Nhấn "Lưu Lại" để lưu thông tin thửa đất vào danh sách "Sổ đỏ". Bạn có thể xem lại, chỉnh sửa hoặc xóa các dự án đã lưu tại tab "Sổ đỏ".',
  },
  {
    number: '5',
    title: 'Tra cứu Quy hoạch',
    body: 'Chuyển sang tab "Quy hoạch" để truy cập nhanh các cổng thông tin quy hoạch chính thức của các tỉnh thành.',
  },
];

const SectionCard = ({ section }: { section: Section }) => {
  const t = useTheme();

  const a11yLabel = `Bước ${section.number}: ${section.title}. ${
    section.steps
      ? section.steps.map(s => `${s.label}: ${s.description}`).join('. ')
      : (section.body ?? '')
  }`;

  return (
    <View
      style={[styles.card, { backgroundColor: t.colors.surface }, t.shadow.sm]}
      accessible
      accessibilityLabel={a11yLabel}
    >
      {/* Step badge + title row */}
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: t.colors.primary }]}>
          <Text style={[styles.badgeText, { fontFamily: t.fontFamily }]}>
            {section.number}
          </Text>
        </View>
        <Text
          style={[t.typography.headline, styles.cardTitle, { color: t.colors.label, fontFamily: t.fontFamily }]}
          accessibilityRole="header"
        >
          {section.title}
        </Text>
      </View>

      {/* Simple body */}
      {section.body ? (
        <>
          <View style={[styles.divider, { backgroundColor: t.colors.separator, marginVertical: 10 }]} />
          <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
            {section.body}
          </Text>
        </>
      ) : null}

      {/* Structured sub-steps */}
      {section.steps ? (
        <>
          <View style={[styles.divider, { backgroundColor: t.colors.separator, marginVertical: 10 }]} />
          {section.steps.map((step, i) => (
            <View key={i} style={[styles.stepItem, i > 0 && styles.stepItemSpacing]}>
              <View style={[styles.bullet, { backgroundColor: t.colors.primary }]} />
              <View style={styles.stepContent}>
                <Text style={[t.typography.subheadline, styles.stepLabel, { color: t.colors.label, fontFamily: t.fontFamily }]}>
                  {step.label}
                </Text>
                <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontFamily: t.fontFamily, marginTop: 2 }]}>
                  {step.description}
                </Text>
              </View>
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
};

const UserManualScreen = () => {
  const navigation = useNavigation();
  const t = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: t.colors.backgroundGrouped }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader title="Hướng dẫn sử dụng" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        alwaysBounceVertical
      >
        {SECTIONS.map(section => (
          <SectionCard key={section.number} section={section} />
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepItemSpacing: {
    marginTop: 12,
  },
  stepContent: {
    flex: 1,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 6,
    marginRight: 10,
    flexShrink: 0,
  },
  stepLabel: {
    fontWeight: '600',
  },
});

export default UserManualScreen;
