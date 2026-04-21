import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Star, Info, ShoppingCart, RotateCcw, Trash2, Shield, FileText } from 'lucide-react-native';
import SettingsSection from '../components/shared/SettingsSection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { useToast } from '../components/shared/ToastProvider';

import {
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  endConnection,
  flushFailedPurchasesCachedAsPendingAndroid,
  type Purchase,
} from 'react-native-iap';

const isWeb = Platform.OS === 'web';
const safeInitConnection = !isWeb ? initConnection : async () => false;
const safeGetAvailablePurchases = !isWeb ? getAvailablePurchases : async () => [];
const safeFetchProducts = !isWeb ? fetchProducts : async () => [];
const safeRequestPurchase = !isWeb ? requestPurchase : async () => {};
const safeFinishTransaction = !isWeb ? finishTransaction : async () => {};
const safeFlushAndroid =
  !isWeb && typeof flushFailedPurchasesCachedAsPendingAndroid === 'function'
    ? flushFailedPurchasesCachedAsPendingAndroid
    : async () => {};

const itemSkus = Platform.select<string[]>({
  android: ['remove_ads'],
  ios: ['remove_ads'],
}) ?? ['remove_ads'];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const tabBarHeight = useBottomTabBarHeight();
  const { showToast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [cacheSize, setCacheSize] = useState('Tính toán...');

  useEffect(() => {
    checkPremiumStatus();
    calculateCacheSize();

    let purchaseUpdateSubscription: ReturnType<typeof purchaseUpdatedListener> | null = null;
    let purchaseErrorSubscription: ReturnType<typeof purchaseErrorListener> | null = null;

    const initIAP = async () => {
      try {
        await safeInitConnection();
        if (Platform.OS === 'android') await safeFlushAndroid();

        await safeFetchProducts({ skus: itemSkus });

        const purchases = await safeGetAvailablePurchases();
        if (purchases && purchases.length > 0) {
          const hasPremium = purchases.some((p: Purchase) => p.productId === itemSkus[0]);
          if (hasPremium) {
            await AsyncStorage.setItem('is_premium', 'true');
            setIsPremium(true);
          }
        }

        purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
          const receipt = purchase.transactionReceipt ?? (purchase as unknown as { purchaseToken?: string }).purchaseToken;
          if (receipt) {
            try {
              await AsyncStorage.setItem('is_premium', 'true');
              setIsPremium(true);
              await safeFinishTransaction({ purchase, isConsumable: false });
              showToast('Cảm ơn bạn đã ủng hộ! Gói Premium đã kích hoạt.', 'success');
            } catch (ackErr) {
              console.warn('ackErr', ackErr);
            }
          }
        });

        purchaseErrorSubscription = purchaseErrorListener(error => {
          console.warn('purchaseErrorListener', error);
          const code = (error as { code?: string }).code;
          if (code !== 'E_USER_CANCELLED' && code !== 'E_ALREADY_OWNED') {
            Alert.alert('Lỗi mua hàng', (error as Error).message);
          }
        });
      } catch (err) {
        console.warn('initIAP error', err);
      }
    };

    initIAP();

    return () => {
      purchaseUpdateSubscription?.remove();
      purchaseErrorSubscription?.remove();
      endConnection();
    };
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('is_premium');
      setIsPremium(status === 'true');
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const calculateCacheSize = async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) { setCacheSize('0 MB'); return; }

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      let totalSize = 0;

      for (const file of files) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(cacheDir + file);
          if (!fileInfo.isDirectory) totalSize += (fileInfo as { size?: number }).size ?? 0;
        } catch (err) {
          console.warn('Skipping file size check:', file, err);
        }
      }

      setCacheSize(`${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
    } catch (error) {
      console.error('Error calculating cache size:', error);
      setCacheSize('Unknown');
    }
  };

  const handleRateApp = () => {
    const storeLink =
      Platform.OS === 'ios'
        ? 'itms-apps://itunes.apple.com/app/com.tranhiepgold.soitoadovn?action=write-review'
        : 'market://details?id=com.tranhiepgold.soitoadovn';

    Linking.canOpenURL(storeLink)
      .then(supported => {
        const webLink =
          Platform.OS === 'ios'
            ? 'https://apps.apple.com/app/com.tranhiepgold.soitoadovn'
            : 'https://play.google.com/store/apps/details?id=com.tranhiepgold.soitoadovn';
        Linking.openURL(supported ? storeLink : webLink);
      })
      .catch(err => console.error('An error occurred', err));
  };

  const handlePurchase = async () => {
    if (isPremium) {
      Alert.alert('Thông báo', 'Bạn đã là thành viên Premium!');
      return;
    }
    try {
      await safeRequestPurchase({
        request: {
          apple: { sku: itemSkus[0] },
          google: { skus: [itemSkus[0]] },
        },
        type: 'in-app',
      });
    } catch (err) {
      const e = err as { code?: string; message?: string };
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
      let isRestored = false;

      for (const purchase of purchases) {
        if ((purchase as Purchase).productId === itemSkus[0]) {
          await AsyncStorage.setItem('is_premium', 'true');
          setIsPremium(true);
          isRestored = true;
        }
      }

      Alert.alert(
        isRestored ? 'Khôi phục thành công' : 'Thông báo',
        isRestored
          ? 'Gói Premium của bạn đã được khôi phục.'
          : 'Không tìm thấy giao dịch mua hàng nào trước đây.',
      );
    } catch (error) {
      console.warn('Restore error', error);
      Alert.alert('Lỗi', 'Không thể khôi phục mua hàng lúc này.');
    }
  };

  const handleClearCache = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa bộ nhớ tạm không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const cacheDir = FileSystem.cacheDirectory;
            if (!cacheDir) return;
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            for (const file of files) {
              await FileSystem.deleteAsync(cacheDir + file, { idempotent: true });
            }
            calculateCacheSize();
            showToast('Đã dọn dẹp bộ nhớ tạm.', 'success');
          } catch (error) {
            console.error('Error clearing cache:', error);
            Alert.alert('Lỗi', 'Không thể xóa bộ nhớ tạm.');
          }
        },
      },
    ]);
  };

  const starsRightElement = (
    <View style={{ flexDirection: 'row' }}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={16} color="#FFD700" fill="#FFD700" />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài đặt</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection
          title="Hỗ trợ"
          rows={[
            {
              label: 'Đánh giá ứng dụng',
              leftIcon: <Star size={22} color={Colors.primary} />,
              rightElement: starsRightElement,
              onPress: handleRateApp,
            },
            {
              label: 'Hướng dẫn sử dụng',
              leftIcon: <Info size={22} color={Colors.textPrimary} />,
              onPress: () => navigation.navigate('UserManual' as never),
            },
          ]}
        />

        <View style={styles.sectionLabel}>
          <Text style={styles.sectionHeader}>Mua hàng</Text>
        </View>
        <View style={styles.sectionContainer}>
          {isPremium ? (
            <View style={styles.premiumContainer}>
              <Text style={styles.premiumText}>Bạn đang sử dụng gói Premium</Text>
              <Shield size={20} color={Colors.success} fill={Colors.success} />
            </View>
          ) : (
            <TouchableOpacity style={styles.purchaseItem} onPress={handlePurchase}>
              <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                  <ShoppingCart size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.purchaseTitle}>Xóa quảng cáo — Mãi mãi</Text>
                  <Text style={styles.itemSubtitle}>Mua 1 lần xóa quảng cáo vĩnh viễn</Text>
                </View>
                <Text style={styles.purchasePrice}>99.000 đ</Text>
              </View>
            </TouchableOpacity>
          )}
          {!isPremium && <View style={styles.separator} />}
          {!isPremium && (
            <SettingsSection
              title=""
              rows={[
                {
                  label: 'Khôi phục mua hàng',
                  subtitle: 'Khôi phục giao dịch đã mua trước đây',
                  leftIcon: <RotateCcw size={22} color={Colors.textPrimary} />,
                  onPress: handleRestorePurchase,
                },
              ]}
            />
          )}
        </View>

        <SettingsSection
          title="Cài đặt"
          rows={[
            {
              label: 'Dọn dẹp bộ nhớ tạm',
              leftIcon: <Trash2 size={22} color={Colors.textPrimary} />,
              rightElement: <Text style={styles.cacheSize}>{cacheSize}</Text>,
              onPress: handleClearCache,
            },
          ]}
        />

        <SettingsSection
          title="Thông tin"
          rows={[
            {
              label: 'Thông tin ứng dụng',
              leftIcon: <Info size={22} color={Colors.textPrimary} />,
              onPress: () => navigation.navigate('AppInfo' as never),
            },
            {
              label: 'Điều khoản sử dụng',
              leftIcon: <FileText size={22} color={Colors.textPrimary} />,
              onPress: () => navigation.navigate('Terms' as never),
            },
            {
              label: 'Chính sách bảo mật',
              leftIcon: <Shield size={22} color={Colors.textPrimary} />,
              onPress: () => navigation.navigate('Privacy' as never),
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 15,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  sectionHeader: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: 10,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  sectionLabel: { marginBottom: 0 },
  sectionContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 30, alignItems: 'center', marginRight: 10 },
  itemSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  separator: { height: 1, backgroundColor: Colors.separator, marginLeft: 56 },
  purchaseItem: { padding: Spacing.lg },
  purchaseTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.primary,
  },
  purchasePrice: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  premiumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    backgroundColor: Colors.successLight,
  },
  premiumText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.successDark,
  },
  cacheSize: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
});

export default SettingsScreen;
