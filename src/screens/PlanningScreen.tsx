import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Globe, Smartphone, Info, Map as MapIcon } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius, Shadows } from '../theme';

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

const PlanningScreen = () => {
  const tabBarHeight = useBottomTabBarHeight();

  const renderCard = (item: PlanningItem, index: number) => (
    <View key={index} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.provinceBadge}>
          <Text style={styles.provinceText}>{item.province}</Text>
        </View>
        <Text style={styles.appName}>{item.name}</Text>
      </View>

      <View style={styles.cardBody}>
        {item.web && (
          <TouchableOpacity style={styles.infoRow} onPress={() => item.web && Linking.openURL(item.web)}>
            <Globe size={16} color={Colors.primary} />
            <Text style={styles.infoLabel}>Web:</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.web}
            </Text>
          </TouchableOpacity>
        )}

        {item.app && (
          <View style={styles.infoRow}>
            <Smartphone size={16} color={Colors.success} />
            <Text style={styles.infoLabel}>App:</Text>
            <Text style={styles.infoValuePlain}>{item.app}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.featureRow}>
          <Info size={16} color={Colors.textTertiary} />
          <Text style={styles.featureText}>{item.features}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Tra cứu Quy hoạch</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <MapIcon size={32} color="#8B5CF6" />
          <Text style={styles.introText}>
            Dưới đây là danh sách các cổng thông tin và ứng dụng quy hoạch chính thức của các tỉnh
            thành. Bạn có thể tìm kiếm các ứng dụng này trên App Store hoặc CH Play.
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: { fontSize: Typography.fontSizes.xxl - 2, fontWeight: Typography.fontWeights.heavy, color: Colors.textPrimary },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.xl },
  introCard: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  introText: { flex: 1, marginLeft: 15, fontSize: Typography.fontSizes.md, color: Colors.textPrimary, lineHeight: 20 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
    ...Shadows.sm,
  },
  cardHeader: { marginBottom: 15 },
  provinceBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  provinceText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  appName: { fontSize: Typography.fontSizes.lg + 1, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  cardBody: { gap: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.semibold, color: Colors.textSecondary, marginLeft: Spacing.sm, width: 45 },
  infoValue: { fontSize: Typography.fontSizes.md, color: Colors.primary, flex: 1 },
  infoValuePlain: { fontSize: Typography.fontSizes.md, color: Colors.textPrimary, flex: 1 },
  divider: { height: 1, backgroundColor: Colors.surfaceSecondary, marginVertical: 4 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start' },
  featureText: {
    fontSize: Typography.fontSizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: { marginTop: Spacing.sm, alignItems: 'center' },
  footerText: { fontSize: Typography.fontSizes.sm, color: Colors.textTertiary, textAlign: 'center' },
});

export default PlanningScreen;
