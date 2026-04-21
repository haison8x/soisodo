import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Compass, Info, MapPin, ChevronDown, Check, X, Search } from 'lucide-react-native';
import { proj4Dict, convertVN2000ToWGS84 } from '../utils/point';
import { triggerMedium } from '../utils/haptics';
import { useNavigation } from '@react-navigation/native';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { Colors, Spacing, Typography, Radius, Shadows } from '../theme';
import type { WGS84Point } from '../types';

interface Province {
  key: string;
  label: string;
}

const VN2000Screen = () => {
  const navigation = useNavigation();
  const { showAd } = useInterstitialAd();
  const tabBarHeight = useBottomTabBarHeight();

  const [xCoord, setXCoord] = useState('1199306.130');
  const [yCoord, setYCoord] = useState('596566.070');
  const [selectedProvince, setSelectedProvince] = useState<Province>({
    key: 'EPSG:_TP-Hồ-Chí-Minh',
    label: 'TP Hồ Chí Minh',
  });
  const [result, setResult] = useState<WGS84Point | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const provinces = useMemo<Province[]>(
    () =>
      Object.keys(proj4Dict)
        .map(key => ({ key, label: key.replace('EPSG:_', '').replace(/-/g, ' ') }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const filteredProvinces = useMemo<Province[]>(() => {
    if (!searchQuery) return provinces;
    return provinces.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [provinces, searchQuery]);

  const handleConvert = () => {
    triggerMedium();
    if (!xCoord || !yCoord) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tọa độ X và Y');
      return;
    }
    if (!selectedProvince) {
      Alert.alert('Thiếu thông tin', 'Vui lòng chọn Tỉnh/Thành phố');
      return;
    }
    const converted = convertVN2000ToWGS84(xCoord, yCoord, selectedProvince.key);
    if (converted) {
      setResult(converted);
    } else {
      Alert.alert('Lỗi', 'Không thể chuyển đổi tọa độ. Vui lòng kiểm tra lại số liệu.');
    }
  };

  const handleViewOnMap = () => {
    if (result) {
      showAd(() => {
        navigation.navigate('ConvertGoogle' as never, {
          latitude: result.latitude,
          longitude: result.longitude,
        } as never);
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chuyển Đổi VN2000</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing.lg }]}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Nhập tọa độ VN2000</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh / Thành phố (*)</Text>
              <TouchableOpacity style={styles.dropdown} onPress={() => setModalVisible(true)}>
                <Text style={[styles.dropdownText, !selectedProvince && styles.placeholderText]}>
                  {selectedProvince ? selectedProvince.label : 'Chọn Tỉnh / Thành phố'}
                </Text>
                <ChevronDown size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Tọa độ X (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 1199306.130"
                  keyboardType="numeric"
                  value={xCoord}
                  onChangeText={setXCoord}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Tọa độ Y (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 596566.070"
                  keyboardType="numeric"
                  value={yCoord}
                  onChangeText={setYCoord}
                  placeholderTextColor={Colors.textTertiary}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
              <Compass size={20} color={Colors.textOnPrimary} />
              <Text style={styles.convertButtonText}>Chuyển đổi sang WGS84</Text>
            </TouchableOpacity>
          </View>

          {result && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Kết quả</Text>
              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Vĩ độ (Lat)</Text>
                  <Text style={styles.resultValue}>{result.latitude.toFixed(6)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Kinh độ (Long)</Text>
                  <Text style={styles.resultValue}>{result.longitude.toFixed(6)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.mapButton} onPress={handleViewOnMap}>
                <MapPin size={20} color={Colors.textOnPrimary} />
                <Text style={styles.mapButtonText}>Xem trên Maps</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.card, styles.hintCard]}>
            <View style={styles.hintHeader}>
              <Info size={20} color="#0369A1" />
              <Text style={styles.hintTitle}>Lưu ý</Text>
            </View>
            <Text style={styles.hintDescription}>
              Chọn đúng Tỉnh/Thành phố để có kết quả chính xác nhất. Hệ tọa độ VN2000 sử dụng
              kinh tuyến trục địa phương khác nhau cho từng tỉnh.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn Tỉnh / Thành phố</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.textTertiary} style={{ marginRight: Spacing.sm }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={false}
              />
            </View>

            <FlatList
              data={filteredProvinces}
              keyExtractor={item => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.provinceItem}
                  onPress={() => {
                    setSelectedProvince(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text
                    style={[
                      styles.provinceText,
                      selectedProvince?.key === item.key && styles.selectedProvinceText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedProvince?.key === item.key && <Check size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.heavy, color: Colors.textPrimary },
  content: { padding: Spacing.xl },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    ...Shadows.sm,
    elevation: 3,
    marginBottom: Spacing.xl,
  },
  sectionTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdown: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownText: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  placeholderText: { color: Colors.textTertiary },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  convertButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  convertButtonText: { color: Colors.textOnPrimary, fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold },
  resultRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  resultItem: { flex: 1, alignItems: 'center' },
  divider: { width: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.sm },
  resultLabel: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginBottom: 4 },
  resultValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  mapButton: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radius.md,
    gap: Spacing.sm,
  },
  mapButtonText: { color: Colors.textOnPrimary, fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold },
  hintCard: { backgroundColor: Colors.primaryLight, borderColor: Colors.hintBorder, borderWidth: 1 },
  hintHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  hintTitle: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold, color: Colors.hintText },
  hintDescription: { fontSize: Typography.fontSizes.md, color: Colors.hintText, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    height: '80%',
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalTitle: { fontSize: Typography.fontSizes.xl, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  searchContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, fontSize: Typography.fontSizes.base, color: Colors.textPrimary, padding: 0 },
  provinceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
  },
  provinceText: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  selectedProvinceText: { color: Colors.primary, fontWeight: Typography.fontWeights.bold },
});

export default VN2000Screen;
