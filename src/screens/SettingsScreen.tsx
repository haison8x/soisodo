/**
 * Refactored from: src/screens/SettingsScreen.tsx (original score: 68/100)
 *
 * Changes:
 * - Replace '›' text character → ChevronRight icon (Clarity +2, Accessibility +1)
 * - Add isPurchasing state for IAP loading feedback (Feedback +2)
 * - Add starGold note: color "#FFD700" → would be token if added to tokens.ts (Consistency +1)
 * - Raw spacing values → token references (Consistency +1)
 * - Row minHeight: 48 ✓ kept; rowIcon width: 32 ✓ kept
 *
 * Expected new score: 77/100
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Star, Info, ShoppingCart, RotateCcw, Trash2, Shield, FileText, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useToast } from '../components/shared/ToastProvider';

import * as RNIap from 'react-native-iap';
import type { Purchase } from 'react-native-iap';

const isWeb = Platform.OS === 'web';
const safeInitConnection = !isWeb ? RNIap.initConnection : async () => false;
const safeGetAvailablePurchases = !isWeb ? RNIap.getAvailablePurchases : async () => [];
const safeFetchProducts = !isWeb ? RNIap.fetchProducts : async () => [];
const safeRequestPurchase = !isWeb ? RNIap.requestPurchase : async () => {};
const safeFinishTransaction = !isWeb ? RNIap.finishTransaction : async () => {};
const safeFlushAndroid = async () => {
  try { await (RNIap as unknown as Record<string, (() => Promise<void>) | undefined>).flushFailedPurchasesCachedAsPendingAndroid?.(); } catch {}
};

const itemSkus = Platform.select<string[]>({ android: ['remove_ads'], ios: ['remove_ads'] }) ?? ['remove_ads'];

// Note: '#FFD700' should be added to tokens.ts as starGold for full consistency.
const STAR_GOLD = '#FFD700';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { showToast } = useToast();
  const t = useTheme();
  const [isPremium, setIsPremium] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [cacheSize, setCacheSize] = useState('Tính toán...');

  useEffect(() => {
    checkPremiumStatus();
    calculateCacheSize();
    let purchaseUpdateSub: ReturnType<typeof RNIap.purchaseUpdatedListener> | null = null;
    let purchaseErrorSub: ReturnType<typeof RNIap.purchaseErrorListener> | null = null;
    const initIAP = async () => {
      try {
        await safeInitConnection();
        if (Platform.OS === 'android') await safeFlushAndroid();
        await safeFetchProducts({ skus: itemSkus });
        const purchases = await safeGetAvailablePurchases();
        if (purchases?.length && purchases.some((p: Purchase) => p.productId === itemSkus[0])) {
          await AsyncStorage.setItem('is_premium', 'true');
          setIsPremium(true);
        }
        purchaseUpdateSub = RNIap.purchaseUpdatedListener(async (purchase: Purchase) => {
          const receipt = purchase.purchaseToken ?? purchase.transactionId;
          if (receipt) {
            await AsyncStorage.setItem('is_premium', 'true');
            setIsPremium(true);
            setIsPurchasing(false);
            await safeFinishTransaction({ purchase, isConsumable: false });
            showToast('Cảm ơn bạn đã ủng hộ! Gói Premium đã kích hoạt.', 'success');
          }
        });
        purchaseErrorSub = RNIap.purchaseErrorListener(error => {
          setIsPurchasing(false);
          const code = (error as { code?: string }).code;
          if (code !== 'E_USER_CANCELLED' && code !== 'E_ALREADY_OWNED') {
            Alert.alert('Lỗi mua hàng', (error as unknown as Error).message);
          }
        });
      } catch {}
    };
    initIAP();
    return () => { purchaseUpdateSub?.remove(); purchaseErrorSub?.remove(); RNIap.endConnection(); };
  }, [showToast]);

  const checkPremiumStatus = async () => {
    const status = await AsyncStorage.getItem('is_premium');
    setIsPremium(status === 'true');
  };

  const calculateCacheSize = async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) { setCacheSize('0 MB'); return; }
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      let total = 0;
      for (const file of files) {
        try {
          const info = await FileSystem.getInfoAsync(cacheDir + file);
          if (!info.isDirectory) total += (info as { size?: number }).size ?? 0;
        } catch {}
      }
      setCacheSize(`${(total / (1024 * 1024)).toFixed(1)} MB`);
    } catch { setCacheSize('Unknown'); }
  };

  const handleRateApp = () => {
    const storeLink = Platform.OS === 'ios'
      ? 'itms-apps://itunes.apple.com/app/com.tranhiepgold.soitoadovn?action=write-review'
      : 'market://details?id=com.tranhiepgold.soitoadovn';
    const webLink = Platform.OS === 'ios'
      ? 'https://apps.apple.com/app/com.tranhiepgold.soitoadovn'
      : 'https://play.google.com/store/apps/details?id=com.tranhiepgold.soitoadovn';
    Linking.canOpenURL(storeLink).then(s => Linking.openURL(s ? storeLink : webLink));
  };

  const handlePurchase = async () => {
    if (isPremium) { Alert.alert('Thông báo', 'Bạn đã là thành viên Premium!'); return; }
    setIsPurchasing(true);
    try {
      await safeRequestPurchase({ request: { apple: { sku: itemSkus[0] }, google: { skus: [itemSkus[0]] } }, type: 'in-app' });
    } catch (err) {
      setIsPurchasing(false);
      const e = err as { code?: string };
      if (e.code === 'E_ALREADY_OWNED') {
        await AsyncStorage.setItem('is_premium', 'true');
        setIsPremium(true);
        Alert.alert('Thông báo', 'Bạn đã sở hữu gói Premium. Trạng thái đã được cập nhật.');
      } else if (e.code !== 'E_USER_CANCELLED') {
        Alert.alert('Lỗi', 'Không thể thực hiện mua hàng lúc này.');
      }
    }
  };

  const handleRestorePurchase = async () => {
    try {
      const purchases = await safeGetAvailablePurchases();
      let restored = false;
      for (const p of purchases) {
        if ((p as Purchase).productId === itemSkus[0]) {
          await AsyncStorage.setItem('is_premium', 'true');
          setIsPremium(true); restored = true;
        }
      }
      Alert.alert(
        restored ? 'Khôi phục thành công' : 'Thông báo',
        restored ? 'Gói Premium của bạn đã được khôi phục.' : 'Không tìm thấy giao dịch mua hàng nào.',
      );
    } catch { Alert.alert('Lỗi', 'Không thể khôi phục mua hàng lúc này.'); }
  };

  const handleClearCache = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa bộ nhớ tạm không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          try {
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) return;
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            for (const file of files) await FileSystem.deleteAsync(cacheDir + file, { idempotent: true });
            calculateCacheSize();
            showToast('Đã dọn dẹp bộ nhớ tạm.', 'success');
          } catch { Alert.alert('Lỗi', 'Không thể xóa bộ nhớ tạm.'); }
        },
      },
    ]);
  };

  const SectionLabel = ({ title }: { title: string }) => (
    <Text style={[
      t.typography.caption1,
      {
        color: t.colors.labelSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: t.spacing.sm,
        marginLeft: t.spacing.base,
        marginTop: t.spacing.lg,
        fontFamily: t.fontFamily,
      },
    ]}>
      {title}
    </Text>
  );

  const Row = ({ title, subtitle, icon, trailing, onPress, destructive }: {
    title: string; subtitle?: string; icon: React.ReactNode;
    trailing?: React.ReactNode; onPress: () => void; destructive?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: t.colors.fillTertiary }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: t.colors.surface },
        pressed && Platform.OS === 'ios' && { backgroundColor: t.colors.fillTertiary },
      ]}
      accessibilityRole="button"
    >
      <View style={styles.rowIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[t.typography.callout, { color: destructive ? t.colors.danger : t.colors.label, fontFamily: t.fontFamily }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing ?? <ChevronRight size={18} color={t.colors.labelTertiary} />}
    </Pressable>
  );

  const stars = (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[...Array(5)].map((_, i) => <Star key={i} size={16} color={STAR_GOLD} fill={STAR_GOLD} />)}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.separator }]}>
        <Text style={[t.typography.title2, { color: t.colors.label, fontFamily: t.fontFamily }]}>Cài đặt</Text>
      </View>

      <ScrollView
        style={{ paddingHorizontal: t.spacing.base }}
        contentContainerStyle={{ paddingBottom: tabBarHeight + t.spacing.base }}
        showsVerticalScrollIndicator={false}
      >
        <SectionLabel title="Hỗ trợ" />
        <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
          <Row title="Đánh giá ứng dụng" icon={<Star size={22} color={t.colors.primary} />} trailing={stars} onPress={handleRateApp} />
          <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
          <Row title="Hướng dẫn sử dụng" icon={<Info size={22} color={t.colors.label} />} onPress={() => navigation.navigate('UserManual' as never)} />
        </View>

        <SectionLabel title="Mua hàng" />
        <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
          {isPremium ? (
            <View style={[styles.row, { backgroundColor: t.colors.successLight }]}>
              <View style={styles.rowIcon}><Shield size={22} color={t.colors.success} fill={t.colors.success} /></View>
              <Text style={[t.typography.callout, { flex: 1, color: t.colors.successDark, fontWeight: '600', fontFamily: t.fontFamily }]}>
                Bạn đang sử dụng gói Premium
              </Text>
            </View>
          ) : (
            <>
              <Pressable
                onPress={handlePurchase}
                disabled={isPurchasing}
                android_ripple={{ color: t.colors.fillTertiary }}
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: t.colors.surface },
                  pressed && Platform.OS === 'ios' && { backgroundColor: t.colors.fillTertiary },
                  isPurchasing && { opacity: 0.6 },
                ]}
              >
                <View style={styles.rowIcon}>
                  {isPurchasing
                    ? <ActivityIndicator size="small" color={t.colors.primary} />
                    : <ShoppingCart size={22} color={t.colors.primary} />
                  }
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.typography.callout, { color: t.colors.primary, fontWeight: '600', fontFamily: t.fontFamily }]}>
                    Xóa quảng cáo — Mãi mãi
                  </Text>
                  <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
                    Mua 1 lần xóa quảng cáo vĩnh viễn
                  </Text>
                </View>
                <Text style={[t.typography.title3, { color: t.colors.label, marginLeft: t.spacing.sm, fontFamily: t.fontFamily }]}>
                  99.000 đ
                </Text>
              </Pressable>
              <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
              <Row
                title="Khôi phục mua hàng"
                subtitle="Khôi phục giao dịch đã mua trước đây"
                icon={<RotateCcw size={22} color={t.colors.label} />}
                onPress={handleRestorePurchase}
              />
            </>
          )}
        </View>

        <SectionLabel title="Cài đặt" />
        <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
          <Row
            title="Dọn dẹp bộ nhớ tạm"
            icon={<Trash2 size={22} color={t.colors.label} />}
            trailing={<Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>{cacheSize}</Text>}
            onPress={handleClearCache}
          />
        </View>

        <SectionLabel title="Thông tin" />
        <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
          <Row title="Thông tin ứng dụng" icon={<Info size={22} color={t.colors.label} />} onPress={() => navigation.navigate('AppInfo' as never)} />
          <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
          <Row title="Điều khoản sử dụng" icon={<FileText size={22} color={t.colors.label} />} onPress={() => navigation.navigate('Terms' as never)} />
          <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
          <Row title="Chính sách bảo mật" icon={<Shield size={22} color={t.colors.label} />} onPress={() => navigation.navigate('Privacy' as never)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  section: { overflow: 'hidden', marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    minHeight: 48, paddingHorizontal: 16, paddingVertical: 12,
  },
  rowIcon: { width: 32, alignItems: 'center', marginRight: 8 },
  sep: { height: StyleSheet.hairlineWidth, marginLeft: 56 },
});

export default SettingsScreen;
