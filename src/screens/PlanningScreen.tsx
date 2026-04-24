import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Globe, Smartphone, Info, Map as MapIcon, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

interface PlanningItem {
  province: string;
  name: string;
  web: string | null;
  app: string | null;
  features: string;
}

const PLANNING_DATA: PlanningItem[] = [
  {
    province: 'Bình Dương',
    name: 'Cổng thông tin Quy hoạch Bình Dương',
    web: 'http://qkhsdd.binhduong.gov.vn',
    app: 'Quy hoạch xây dựng Bình Dương',
    features: 'Cho phép nhập chính xác số tờ, số thửa.',
  },
  {
    province: 'Đồng Nai',
    name: 'DNAILIS (Rất phổ biến)',
    web: 'https://atlas.dongnai.gov.vn',
    app: 'DNAILIS',
    features: 'App này rất mạnh, tra cứu tờ/thửa cực nhanh.',
  },
  {
    province: 'Hà Nội',
    name: 'Quy hoạch Hà Nội',
    web: 'https://quyhoach.hanoi.vn',
    app: 'Quy hoạch Hà Nội',
    features: 'Dữ liệu đôi khi cập nhật chậm hơn so với thực tế biến động đất đai.',
  },
  {
    province: 'Đà Nẵng',
    name: 'Cổng thông tin đất đai Đà Nẵng',
    web: 'https://ttdd.tnmt.danang.gov.vn',
    app: null,
    features: 'Có mục "Tra cứu thông tin thửa đất" bằng số tờ, số thửa.',
  },
  {
    province: 'Long An',
    name: 'QHSDD.LA',
    web: null,
    app: 'QHSDD.LA',
    features: 'Tra cứu theo tờ thửa, định vị GPS.',
  },
  {
    province: 'Khánh Hòa',
    name: 'Quy hoạch Khánh Hòa',
    web: null,
    app: 'Quy hoạch Khánh Hòa',
    features: 'Tra cứu bản đồ quy hoạch sử dụng đất.',
  },
];

const getDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

const openURL = (url: string) => Linking.openURL(url).catch(() => null);

const openAppSearch = (appName: string) => {
  const q = encodeURIComponent(appName);
  const url = Platform.OS === 'ios'
    ? `https://apps.apple.com/search?term=${q}&country=vn`
    : `https://play.google.com/store/search?q=${q}&hl=vi`;
  openURL(url);
};

const PlanningCard = ({ item }: { item: PlanningItem }) => {
  const t = useTheme();
  const hasActions = !!(item.web || item.app);

  return (
    <View style={[styles.card, { backgroundColor: t.colors.surface }, t.shadow.sm]}>
      {/* Province badge + name */}
      <View style={styles.cardHeader}>
        <View style={[styles.provinceBadge, { backgroundColor: t.colors.fillSecondary, borderRadius: t.radius.sm }]}>
          <Text style={[t.typography.caption2, styles.provinceBadgeText, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
            {item.province.toUpperCase()}
          </Text>
        </View>
        <Text
          style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]}
          accessibilityRole="header"
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </View>

      {hasActions && <View style={[styles.divider, { backgroundColor: t.colors.separator }]} />}

      {/* Website row — iOS Settings link style */}
      {item.web && (
        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            pressed && Platform.OS === 'ios' && { opacity: 0.6 },
          ]}
          android_ripple={{ color: t.colors.fillTertiary }}
          onPress={() => openURL(item.web!)}
          accessibilityRole="link"
          accessibilityLabel={`Mở website ${item.name}: ${getDomain(item.web)}`}
        >
          <Globe size={17} color={t.colors.primary} />
          <View style={styles.actionContent}>
            <Text style={[t.typography.callout, { color: t.colors.label, fontFamily: t.fontFamily }]}>
              Mở website
            </Text>
            <Text style={[t.typography.caption1, { color: t.colors.labelTertiary, fontFamily: t.fontFamily, marginTop: 1 }]} numberOfLines={1}>
              {getDomain(item.web)}
            </Text>
          </View>
          <ChevronRight size={16} color={t.colors.labelTertiary} />
        </Pressable>
      )}

      {/* Indented separator between two action rows */}
      {item.web && item.app && (
        <View style={[styles.divider, { backgroundColor: t.colors.separator, marginLeft: 43 }]} />
      )}

      {/* App store row — tappable, opens App Store / CH Play search */}
      {item.app && (
        <Pressable
          style={({ pressed }) => [
            styles.actionRow,
            pressed && Platform.OS === 'ios' && { opacity: 0.6 },
          ]}
          android_ripple={{ color: t.colors.fillTertiary }}
          onPress={() => openAppSearch(item.app!)}
          accessibilityRole="button"
          accessibilityLabel={`Tìm ứng dụng ${item.app} trên cửa hàng ứng dụng`}
        >
          <Smartphone size={17} color={t.colors.success} />
          <View style={styles.actionContent}>
            <Text style={[t.typography.callout, { color: t.colors.label, fontFamily: t.fontFamily }]}>
              {item.app}
            </Text>
            <Text style={[t.typography.caption1, { color: t.colors.labelTertiary, fontFamily: t.fontFamily, marginTop: 1 }]}>
              {Platform.OS === 'ios' ? 'Tìm trên App Store' : 'Tìm trên CH Play'}
            </Text>
          </View>
          <ChevronRight size={16} color={t.colors.labelTertiary} />
        </Pressable>
      )}

      {/* Feature note */}
      <View style={[styles.divider, { backgroundColor: t.colors.separator }]} />
      <View style={styles.featureRow}>
        <Info size={14} color={t.colors.labelTertiary} style={{ marginTop: 1 }} />
        <Text style={[t.typography.footnote, styles.featureText, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
          {item.features}
        </Text>
      </View>
    </View>
  );
};

const PlanningScreen = () => {
  const t = useTheme();
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.colors.backgroundGrouped }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.separator }]}>
        <Text style={[t.typography.title2, { color: t.colors.label, fontFamily: t.fontFamily }]}>
          Tra cứu Quy hoạch
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + t.spacing.base }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro banner — primary tint, icon in rounded square */}
        <View style={[styles.introBanner, { backgroundColor: t.colors.primaryLight, borderRadius: t.radius.lg }]}>
          <View style={[styles.introIconWrap, { backgroundColor: t.colors.fillPrimary, borderRadius: t.radius.md }]}>
            <MapIcon size={24} color={t.colors.primary} />
          </View>
          <Text style={[t.typography.callout, { color: t.colors.label, flex: 1, fontFamily: t.fontFamily }]}>
            Danh sách cổng thông tin và ứng dụng quy hoạch chính thức. Nhấn để truy cập hoặc tìm trên{' '}
            <Text style={{ fontWeight: '600' }}>
              {Platform.OS === 'ios' ? 'App Store' : 'CH Play'}
            </Text>.
          </Text>
        </View>

        {PLANNING_DATA.map((item, index) => (
          <PlanningCard key={index} item={item} />
        ))}

        <Text style={[t.typography.caption1, styles.footer, { color: t.colors.labelTertiary, fontFamily: t.fontFamily }]}>
          Thông tin được tổng hợp cho mục đích tham khảo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  introBanner: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  introIconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 16,
    gap: 6,
  },
  provinceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  provinceBadgeText: {
    letterSpacing: 0.4,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
    gap: 10,
  },
  actionContent: {
    flex: 1,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  featureText: {
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    textAlign: 'center',
    paddingVertical: 8,
  },
});

export default PlanningScreen;
