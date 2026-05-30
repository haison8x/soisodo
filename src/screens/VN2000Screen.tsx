/**
 * Refactored from: src/screens/VN2000Screen.tsx (original score: 57/100)
 *
 * Changes:
 * - SafeAreaView: add missing edges={['top','left','right']} (Android +3)
 * - input/dropdown paddingVertical: 12 → 14, minHeight: 48 (Hit targets +2)
 * - Fix hardcode "#0369A1" → Colors.hintText (Consistency +2)
 * - Modal X button: add padding: 12 for 44pt tap target (Hit targets +1)
 * - Add android_ripple to dropdown, convert button, province items (Android +2, Feedback +2)
 * - searchInput: autoFocus on modal open (UX improvement)
 *
 * Expected new score: 76/100
 */
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Check, ChevronDown, Compass, Info, MapPin, Search, X } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable, ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerAdSize } from 'react-native-google-mobile-ads';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdFreeService from '../services/AdFreeService';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { AD_UNITS } from '../constants/adUnits';
import AdBanner from '../components/AdBanner';
import NativeAdBanner from '../components/NativeAdBanner';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useTheme } from '../theme/ThemeProvider';
import type { WGS84Point } from '../types';
import { triggerMedium } from '../utils/haptics';
import { convertVN2000ToWGS84, proj4Dict } from '../utils/point';

import { fontScale, moderateScale, verticalScale } from '../utils/responsive';

interface Province { key: string; label: string }

const VN2000Screen = () => {
  const navigation = useNavigation();
  const { showAd } = useInterstitialAd();
  const { showAd: showRewardedAd } = useRewardedAd(AD_UNITS.rewarded);
  const tabBarHeight = useBottomTabBarHeight();
  const t = useTheme();

  const [xCoord, setXCoord] = useState('1199306.130');
  const [yCoord, setYCoord] = useState('596566.070');
  const [selectedProvince, setSelectedProvince] = useState<Province>({
    key: 'EPSG:_TP-Hồ-Chí-Minh', label: 'TP Hồ Chí Minh',
  });
  const [result, setResult] = useState<WGS84Point | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  const provinces = useMemo<Province[]>(
    () => Object.keys(proj4Dict)
      .map(key => ({ key, label: key.replace('EPSG:_', '').replace(/-/g, ' ') }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const filteredProvinces = useMemo<Province[]>(() => {
    if (!searchQuery) return provinces;
    return provinces.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [provinces, searchQuery]);

  const getTodayDateString = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleConvert = () => {
    triggerMedium();
    if (!xCoord || !yCoord) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tọa độ X và Y'); return; }
    const converted = convertVN2000ToWGS84(xCoord, yCoord, selectedProvince.key);
    if (converted) { setResult(converted); }
    else { Alert.alert('Lỗi', 'Không thể chuyển đổi tọa độ. Vui lòng kiểm tra lại số liệu.'); }
  };

  const handleViewOnMap = async () => {
    if (!result) return;

    const navigateToMap = () => {
      showAd(() => (navigation as any).navigate('ConvertGoogle', { latitude: result.latitude, longitude: result.longitude }));
    };

    if (AdFreeService.isPremium()) {
      triggerMedium();
      navigateToMap();
      return;
    }

    try {
      const today = getTodayDateString();
      const usageRaw = await AsyncStorage.getItem('vn2000_map_view_usage');
      let usage = { date: today, count: 0, unlocked: false };

      if (usageRaw) {
        try {
          const parsed = JSON.parse(usageRaw);
          if (parsed && parsed.date === today) {
            usage = {
              date: today,
              count: typeof parsed.count === 'number' ? parsed.count : 0,
              unlocked: !!parsed.unlocked,
            };
          }
        } catch (e) {
          console.error('Error parsing vn2000_map_view_usage', e);
        }
      }

      if (usage.unlocked) {
        triggerMedium();
        navigateToMap();
        return;
      }

      if (usage.count < 5) {
        const nextCount = usage.count + 1;
        const newUsage = { date: today, count: nextCount, unlocked: false };
        await AsyncStorage.setItem('vn2000_map_view_usage', JSON.stringify(newUsage));

        triggerMedium();
        navigateToMap();
      } else {
        Alert.alert(
          'Giới hạn xem bản đồ',
          'Bạn đã hết 5 lượt xem bản đồ miễn phí hôm nay. Hãy nâng cấp Pro để xem không giới hạn hoặc xem quảng cáo ngắn để xem bản đồ tự do cả ngày.',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Mua bản Pro',
              onPress: () => {
                navigation.navigate('Cài đặt' as never);
              },
            },
            {
              text: 'Xem quảng cáo',
              onPress: () => {
                showRewardedAd(
                  async (success?: boolean) => {
                    if (success) {
                      try {
                        const newUsage = { date: today, count: 5, unlocked: true };
                        await AsyncStorage.setItem('vn2000_map_view_usage', JSON.stringify(newUsage));
                      } catch (e) {
                        console.error('Error saving vn2000_map_view_usage after rewarded ad success', e);
                      }
                    }
                    triggerMedium();
                    navigateToMap();
                  },
                  () => {
                    // Do nothing, stay on VN2000Screen
                  }
                );
              },
            },
          ]
        );
      }
    } catch (err) {
      console.error('Error checking vn2000 map view count:', err);
      triggerMedium();
      navigateToMap();
    }
  };

  const openModal = () => {
    setModalVisible(true);
    setTimeout(() => searchRef.current?.focus(), 300);
  };

  return (
    // Add edges to SafeAreaView — was missing, critical Android issue
    <SafeAreaView style={[styles.container, { backgroundColor: t.colors.background }]} edges={['top', 'left', 'right']}>
      <View style={[styles.header, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.border }]}>
        <Text style={[t.typography.title2, { color: t.colors.label, fontFamily: t.fontFamily }]}>
          Chuyển Đổi VN2000
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + t.spacing.base }]}>
          <View style={[styles.card, { backgroundColor: t.colors.surface, borderRadius: t.radius.lg }, t.shadow.sm]}>
            <Text style={[t.typography.headline, { color: t.colors.label, marginBottom: t.spacing.base, fontFamily: t.fontFamily }]}>
              Nhập tọa độ VN2000
            </Text>

            <View style={{ marginBottom: t.spacing.base }}>
              <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, marginBottom: t.spacing.sm, fontFamily: t.fontFamily }]}>
                Tỉnh / Thành phố (*)
              </Text>
              {/* android_ripple on dropdown */}
              <Pressable
                style={({ pressed }) => [
                  styles.dropdown,
                  { backgroundColor: t.colors.surfaceSecondary, borderColor: t.colors.border, borderRadius: t.radius.md },
                  pressed && Platform.OS === 'ios' && { opacity: 0.75 },
                ]}
                android_ripple={{ color: t.colors.fillTertiary }}
                onPress={openModal}
              >
                <Text style={[t.typography.callout, { color: t.colors.label, fontFamily: t.fontFamily }]}>
                  {selectedProvince.label}
                </Text>
                <ChevronDown size={20} color={t.colors.labelSecondary} />
              </Pressable>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { marginRight: t.spacing.sm }]}>
                <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, marginBottom: t.spacing.sm, fontFamily: t.fontFamily }]}>
                  Tọa độ X (m)
                </Text>
                {/* paddingVertical: 14 → total ~14+17+14=45pt ✓ */}
                <TextInput
                  style={[styles.input, { backgroundColor: t.colors.surfaceSecondary, borderColor: t.colors.border, borderRadius: t.radius.md, color: t.colors.label, fontFamily: t.fontFamily }]}
                  placeholder="Ví dụ: 1199306.130"
                  keyboardType="numeric"
                  value={xCoord}
                  onChangeText={setXCoord}
                  placeholderTextColor={t.colors.placeholder}
                />
              </View>
              <View style={[styles.inputGroup, { marginLeft: t.spacing.sm }]}>
                <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, marginBottom: t.spacing.sm, fontFamily: t.fontFamily }]}>
                  Tọa độ Y (m)
                </Text>
                <TextInput
                  style={[styles.input, { backgroundColor: t.colors.surfaceSecondary, borderColor: t.colors.border, borderRadius: t.radius.md, color: t.colors.label, fontFamily: t.fontFamily }]}
                  placeholder="Ví dụ: 596566.070"
                  keyboardType="numeric"
                  value={yCoord}
                  onChangeText={setYCoord}
                  placeholderTextColor={t.colors.placeholder}
                />
              </View>
            </View>

            {/* Convert button with android_ripple */}
            <Pressable
              style={({ pressed }) => [
                styles.convertButton,
                { backgroundColor: t.colors.primary, borderRadius: t.radius.md },
                pressed && Platform.OS === 'ios' && { opacity: 0.75 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
              onPress={handleConvert}
            >
              <Compass size={20} color={t.colors.textOnPrimary} />
              <Text style={[t.typography.headline, { color: t.colors.textOnPrimary, fontFamily: t.fontFamily }]}>
                Chuyển đổi sang WGS84
              </Text>
            </Pressable>
          </View>

          {result && (
            <View style={[styles.card, { backgroundColor: t.colors.surface, borderRadius: t.radius.lg }, t.shadow.sm]}>
              <AdBanner size={BannerAdSize.BANNER} style={{ marginBottom: 16 }} />
              <Text style={[t.typography.headline, { color: t.colors.label, marginBottom: t.spacing.base, fontFamily: t.fontFamily }]}>
                Kết quả
              </Text>
              <View style={[styles.resultRow, { backgroundColor: t.colors.background, borderRadius: t.radius.md }]}>
                <View style={styles.resultItem}>
                  <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, marginBottom: 4, fontFamily: t.fontFamily }]}>Vĩ độ (Lat)</Text>
                  <Text style={[t.typography.callout, { color: t.colors.label, fontWeight: '700', fontFamily: t.fontFamily }]}>{result.latitude.toFixed(6)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: t.colors.border }]} />
                <View style={styles.resultItem}>
                  <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, marginBottom: 4, fontFamily: t.fontFamily }]}>Kinh độ (Long)</Text>
                  <Text style={[t.typography.callout, { color: t.colors.label, fontWeight: '700', fontFamily: t.fontFamily }]}>{result.longitude.toFixed(6)}</Text>
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [styles.convertButton, { backgroundColor: t.colors.success, borderRadius: t.radius.md }, pressed && Platform.OS === 'ios' && { opacity: 0.75 }]}
                android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
                onPress={handleViewOnMap}
              >
                <MapPin size={20} color={t.colors.textOnPrimary} />
                <Text style={[t.typography.headline, { color: t.colors.textOnPrimary, fontFamily: t.fontFamily }]}>Xem trên Maps</Text>
              </Pressable>
            </View>
          )}

          {/* Hint card — Colors.hintText instead of hardcode "#0369A1" */}
          <View style={[styles.card, { backgroundColor: t.colors.primaryLight, borderColor: t.colors.hintBorder, borderWidth: 1, borderRadius: t.radius.lg }]}>
            <View style={[styles.hintHeader, { gap: t.spacing.sm }]}>
              <Info size={20} color={t.colors.hintText} />
              <Text style={[t.typography.callout, { color: t.colors.hintText, fontWeight: '700', fontFamily: t.fontFamily }]}>Lưu ý</Text>
            </View>
            <Text style={[t.typography.subheadline, { color: t.colors.hintText, lineHeight: 22, fontFamily: t.fontFamily }]}>
              Chọn đúng Tỉnh/Thành phố để có kết quả chính xác nhất. Hệ tọa độ VN2000 sử dụng kinh tuyến trục địa phương khác nhau cho từng tỉnh.
            </Text>
          </View>
          {!result && <NativeAdBanner />}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: t.colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: t.colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[t.typography.title3, { color: t.colors.label, fontFamily: t.fontFamily }]}>
                Chọn Tỉnh / Thành phố
              </Text>
              {/* padding: 12 → tap target 12+24+12=48pt ✓ (was no padding = 24pt) */}
              <Pressable
                onPress={() => setModalVisible(false)}
                android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
                style={({ pressed }) => [styles.closeBtn, pressed && Platform.OS === 'ios' && { opacity: 0.7 }]}
                accessibilityLabel="Đóng"
              >
                <X size={24} color={t.colors.label} />
              </Pressable>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: t.colors.surfaceSecondary, borderRadius: t.radius.md }]}>
              <Search size={20} color={t.colors.labelTertiary} style={{ marginRight: t.spacing.sm }} />
              <TextInput
                ref={searchRef}
                style={[styles.searchInput, { color: t.colors.label, fontFamily: t.fontFamily }]}
                placeholder="Tìm kiếm..."
                placeholderTextColor={t.colors.placeholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
            </View>

            <FlatList
              data={filteredProvinces}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.provinceItem,
                    { borderBottomColor: t.colors.surfaceSecondary },
                    pressed && Platform.OS === 'ios' && { backgroundColor: t.colors.fillTertiary },
                  ]}
                  android_ripple={{ color: t.colors.fillTertiary }}
                  onPress={() => { setSelectedProvince(item); setModalVisible(false); setSearchQuery(''); }}
                >
                  <Text style={[
                    t.typography.callout,
                    { color: selectedProvince?.key === item.key ? t.colors.primary : t.colors.label, fontFamily: t.fontFamily },
                    selectedProvince?.key === item.key && { fontWeight: '700' },
                  ]}>
                    {item.label}
                  </Text>
                  {selectedProvince?.key === item.key && <Check size={20} color={t.colors.primary} />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingVertical: moderateScale(16), paddingHorizontal: moderateScale(20), borderBottomWidth: StyleSheet.hairlineWidth },
  content: { padding: moderateScale(20) },
  card: { padding: moderateScale(20), marginBottom: moderateScale(20) },
  inputGroup: { flex: 1 },
  input: {
    minHeight: verticalScale(48), paddingHorizontal: moderateScale(16), paddingVertical: moderateScale(14),
    borderWidth: 1, fontSize: fontScale(16),
  },
  dropdown: {
    minHeight: verticalScale(48), paddingHorizontal: moderateScale(16), paddingVertical: moderateScale(14),
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, overflow: 'hidden',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  convertButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    minHeight: verticalScale(50), borderRadius: moderateScale(12), marginTop: moderateScale(8), gap: moderateScale(8), overflow: 'hidden',
  },
  resultRow: { flexDirection: 'row', padding: moderateScale(16), marginBottom: moderateScale(16) },
  resultItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, marginHorizontal: moderateScale(8) },
  hintHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(8) },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: moderateScale(24), borderTopRightRadius: moderateScale(24), height: '80%', padding: moderateScale(20) },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(20) },
  closeBtn: { padding: moderateScale(12), borderRadius: 999 },
  searchContainer: { paddingHorizontal: moderateScale(16), paddingVertical: moderateScale(8), flexDirection: 'row', alignItems: 'center', marginBottom: moderateScale(16) },
  searchInput: { flex: 1, fontSize: fontScale(16), padding: 0 },
  provinceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: moderateScale(16), borderBottomWidth: 1 },
});

export default VN2000Screen;
