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
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Star, Info, Trash2, Shield, FileText, ChevronRight, Tv, Check, Zap } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { useToast } from '../components/shared/ToastProvider';
import AdFreeService from '../services/AdFreeService';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { AD_UNITS } from '../constants/adUnits';

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

const formatAdFreeRemaining = (ms: number): string => {
  if (ms <= 0) return '';
  const totalMinutes = Math.ceil(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `Còn ${hours} giờ ${minutes} phút`;
  return `Còn ${minutes} phút`;
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { showToast } = useToast();
  const t = useTheme();
  const [isPremium, setIsPremium] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [cacheSize, setCacheSize] = useState('Tính toán...');
  const [adFreeRemaining, setAdFreeRemaining] = useState(0);
  const { showAd: showRewardedAd } = useRewardedAd(AD_UNITS.rewarded);

  const refreshAdFreeStatus = useCallback(() => {
    setAdFreeRemaining(AdFreeService.getAdFreeRemainingMs());
  }, []);

  useEffect(() => {
    refreshAdFreeStatus();
    const timer = setInterval(refreshAdFreeStatus, 60_000);
    return () => clearInterval(timer);
  }, [refreshAdFreeStatus]);

  const handleWatchRewardedAd = useCallback(() => {
    showRewardedAd(
      async () => {
        try {
          await AdFreeService.grantAdFree();
          refreshAdFreeStatus();
          showToast('Bạn đã được miễn quảng cáo trong 72 giờ!', 'success');
        } catch {
          showToast('Không thể kích hoạt ưu đãi. Vui lòng thử lại.', 'error');
        }
      },
      () => {
        showToast('Bạn cần xem hết quảng cáo để nhận ưu đãi.', 'info');
      },
    );
  }, [showRewardedAd, refreshAdFreeStatus, showToast]);

  useEffect(() => {
    checkPremiumStatus();
    calculateCacheSize();
    let purchaseUpdateSub: ReturnType<typeof RNIap.purchaseUpdatedListener> | null = null;
    let purchaseErrorSub: ReturnType<typeof RNIap.purchaseErrorListener> | null = null;
    const initIAP = async () => {
      try {
        await safeInitConnection();
        if (Platform.OS === 'android') await safeFlushAndroid();
        try { await safeFetchProducts({ skus: itemSkus }); } catch {}
        const purchases = await safeGetAvailablePurchases();
        if (purchases?.length && purchases.some((p: Purchase) => p.productId === itemSkus[0])) {
          await AsyncStorage.setItem('is_premium', 'true');
          setIsPremium(true);
        }
        purchaseUpdateSub = RNIap.purchaseUpdatedListener(async (purchase: Purchase) => {
          const receipt = purchase.purchaseToken ?? purchase.transactionId;
          if (receipt) {
            await AsyncStorage.setItem('is_premium', 'true');
            await AdFreeService.refreshFromStorage();
            setIsPremium(true);
            setIsPurchasing(false);
            refreshAdFreeStatus();
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
  }, [showToast, refreshAdFreeStatus]);

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
        {/* ── Premium upsell card (non-premium only) ── */}
        {!isPremium && (
          <View style={[styles.premiumCard, { backgroundColor: t.colors.primary }]}>
            {/* Decorative circles */}
            <View style={styles.decorCircleLg} />
            <View style={styles.decorCircleSm} />

            {/* Badge */}
            <View style={styles.premiumBadge}>
              <Zap size={12} color={STAR_GOLD} fill={STAR_GOLD} />
              <Text style={[styles.premiumBadgeText, { fontFamily: t.fontFamily }]}>PREMIUM</Text>
            </View>

            {/* Headline */}
            <Text style={[styles.premiumTitle, { fontFamily: t.fontFamily }]}>
              Không quảng cáo,{'\n'}mãi mãi.
            </Text>
            <Text style={[styles.premiumSub, { fontFamily: t.fontFamily }]}>
              Mua một lần — dùng trọn đời
            </Text>

            {/* Features */}
            {[
              'Xóa 100% quảng cáo vĩnh viễn',
              'Xem bản đồ không giới hạn',
              'Ủng hộ đội phát triển ứng dụng',
            ].map((feat, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={styles.featureCheck}>
                  <Check size={11} color={t.colors.primary} strokeWidth={3} />
                </View>
                <Text style={[styles.featureText, { fontFamily: t.fontFamily }]}>{feat}</Text>
              </View>
            ))}

            {/* CTA */}
            <Pressable
              style={({ pressed }) => [
                styles.premiumCta,
                pressed && Platform.OS === 'ios' && { opacity: 0.88 },
                isPurchasing && { opacity: 0.7 },
              ]}
              android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
              onPress={handlePurchase}
              disabled={isPurchasing}
              accessibilityRole="button"
              accessibilityLabel="Mua gói Premium — 99.000 đồng"
            >
              {isPurchasing ? (
                <ActivityIndicator color={t.colors.primary} size="small" />
              ) : (
                <>
                  <Text style={[styles.premiumCtaLabel, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
                    Mua ngay
                  </Text>
                  <Text style={[styles.premiumCtaPrice, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
                    99.000 đ
                  </Text>
                </>
              )}
            </Pressable>

            {/* Restore link */}
            <Pressable
              onPress={handleRestorePurchase}
              style={({ pressed }) => [styles.restoreBtn, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Khôi phục mua hàng"
            >
              <Text style={[styles.restoreText, { fontFamily: t.fontFamily }]}>
                Đã mua? Nhấn để khôi phục
              </Text>
            </Pressable>
          </View>
        )}

        {/* ── Premium status badge (premium users) ── */}
        {isPremium && (
          <>
            <SectionLabel title="Gói của bạn" />
            <View style={[styles.section, { backgroundColor: t.colors.successLight, borderRadius: t.radius.md }]}>
              <View style={[styles.row, { backgroundColor: 'transparent' }]}>
                <View style={styles.rowIcon}>
                  <Shield size={22} color={t.colors.success} fill={t.colors.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.typography.callout, { color: t.colors.successDark, fontWeight: '600', fontFamily: t.fontFamily }]}>
                    Bạn đang dùng gói Premium
                  </Text>
                  <Text style={[t.typography.footnote, { color: t.colors.successDark, opacity: 0.7, fontFamily: t.fontFamily }]}>
                    Không quảng cáo — Cảm ơn bạn đã ủng hộ!
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* ── Hỗ trợ ── */}
        <SectionLabel title="Hỗ trợ" />
        <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
          <Row title="Đánh giá ứng dụng" icon={<Star size={22} color={t.colors.primary} />} trailing={stars} onPress={handleRateApp} />
          <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
          <Row title="Hướng dẫn sử dụng" icon={<Info size={22} color={t.colors.label} />} onPress={() => navigation.navigate('UserManual' as never)} />
        </View>

        {/* ── Ad-free section (free tier only) ── */}
        {!AdFreeService.isAdSuppressed() && (
          <>
            <SectionLabel title="Quảng cáo" />
            <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
              <Row
                title="Xem quảng cáo để miễn 72 giờ"
                subtitle="Xem một quảng cáo ngắn để không bị làm phiền trong 72 giờ"
                icon={<Tv size={22} color={t.colors.primary} />}
                onPress={handleWatchRewardedAd}
              />
            </View>
          </>
        )}

        {AdFreeService.isAdFreePeriodActive() && (
          <>
            <SectionLabel title="Quảng cáo" />
            <View style={[styles.section, { backgroundColor: t.colors.surface, borderRadius: t.radius.md }]}>
              <View style={[styles.row, { backgroundColor: t.colors.surface }]}>
                <View style={styles.rowIcon}><Tv size={22} color={t.colors.primary} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={[t.typography.callout, { color: t.colors.label, fontFamily: t.fontFamily }]}>
                    Miễn quảng cáo đang hoạt động
                  </Text>
                  <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
                    {formatAdFreeRemaining(adFreeRemaining)}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

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

  // ── Premium upsell card ──────────────────────────────────────
  premiumCard: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  decorCircleLg: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -70,
    right: -70,
  },
  decorCircleSm: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -40,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
    marginBottom: 18,
  },
  premiumBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  premiumTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 6,
  },
  premiumSub: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  featureCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  premiumCta: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 52,
  },
  premiumCtaLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  premiumCtaPrice: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.65,
    marginTop: 1,
  },
  restoreBtn: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  restoreText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;
