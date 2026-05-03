import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import { Camera, ChevronRight, ArrowLeftRight, Pencil } from 'lucide-react-native';

import AdBanner from '../components/AdBanner';
import CitySelector from '../components/HomeScreen/CitySelector';
import CityModal from '../components/HomeScreen/CityModal';
import CoordinateRow from '../components/HomeScreen/CoordinateRow';
import CoordinateEditModal from '../components/HomeScreen/CoordinateEditModal';
import SaveProjectModal from '../components/HomeScreen/SaveProjectModal';

import { CITIES, INITIAL_COORDINATES } from '../constants/mockDataHomeScreen';
import { pickImageAndSave, exrtactTextFromImage } from '../utils/imageUtils';
import { toMapPoints } from '../utils/point';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAddressFromCoordinates } from '../utils/geocoding';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { AD_UNITS, SODO_REWARDED_MIN_COUNT } from '../constants/adUnits';
import AdFreeService from '../services/AdFreeService';
import { useToast } from '../components/shared/ToastProvider';
import { triggerMedium, triggerSuccess } from '../utils/haptics';
import { useTheme } from '../theme/ThemeProvider';
import type { City, Coordinate, Project } from '../types';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAd } = useInterstitialAd();
  const { showAd: showRewardedAd } = useRewardedAd(AD_UNITS.rewarded);
  const tabBarHeight = useBottomTabBarHeight();
  const { showToast } = useToast();
  const t = useTheme();

  const [title, setTitle] = useState('Nhà Tôi');
  const [selectedCity, setSelectedCity] = useState<City>(
    CITIES.find(c => c.label === 'Hồ Chí Minh') ?? CITIES[0],
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editText, setEditText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinate[]>(INITIAL_COORDINATES);
  const [isScanning, setIsScanning] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [isViewingMap, setIsViewingMap] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');

  const scrollY = useRef(new Animated.Value(0)).current;
  const navTitleOpacity = scrollY.interpolate({
    inputRange: [40, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const params = (route.params as { projectData?: Project } | undefined);
    if (params?.projectData) {
      const { title: pTitle, cityValue, coordinates: pCoords } = params.projectData;
      if (pTitle) setTitle(pTitle);
      if (cityValue) {
        const cityObj = CITIES.find(c => c.value === cityValue);
        if (cityObj) setSelectedCity(cityObj);
      }
      if (pCoords && Array.isArray(pCoords)) setCoordinates(pCoords);
      navigation.setParams({ projectData: undefined } as never);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(route.params as { projectData?: Project } | undefined)?.projectData]);

  // Reset screen when user leaves (switches tab)
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // This runs when the screen is blurred (unfocused)
        // We only reset if we're NOT going to the Map screen
        const state = navigation.getState();
        const currentRoute = state?.routes[state.index];
        const isGoingToMap = currentRoute?.name === 'Map';

        if (!isGoingToMap) {
          setTitle('Nhà Tôi');
          setCoordinates(INITIAL_COORDINATES);
          setModalVisible(false);
          setEditModalVisible(false);
          setSaveModalVisible(false);
          setIsEditMode(false);
        }
      };
    }, [navigation])
  );

  const handleScan = async () => {
    setIsScanning(true);
    const savedUri = await pickImageAndSave();
    if (!savedUri) { setIsScanning(false); return; }
    const text = await exrtactTextFromImage(savedUri);
    setIsScanning(false);
    if (text) {
      setEditText(text);
      setEditModalVisible(true);
    }
  };

  const deleteCoordinate = (id: string) => {
    setCoordinates(prev => prev.filter(coord => coord.id !== id));
  };

  const updateCoordinate = (id: string, field: 'x' | 'y', value: string) => {
    setCoordinates(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addCoordinate = () => {
    if (newX.trim() && newY.trim()) {
      setCoordinates(prev => [...prev, { id: nanoid(), x: newX.trim(), y: newY.trim() }]);
      setNewX('');
      setNewY('');
    }
  };

  const formatCoordinatesForEdit = () =>
    coordinates.map(c => `${c.x}\n${c.y}`).join('\n');

  const handleSaveEdit = (text: string) => {
    if (!text.trim()) { setCoordinates([]); return; }
    const tokens = text.trim().split(/\s+/).filter(tok => tok !== '');
    const newCoords: Coordinate[] = [];
    for (let i = 0; i < tokens.length - 1; i += 2) {
      newCoords.push({ id: nanoid(), x: tokens[i], y: tokens[i + 1] });
    }
    if (newCoords.length > 0) setCoordinates(newCoords);
  };

  const swapXY = () => {
    setCoordinates(prev => prev.map(coord => ({ ...coord, x: coord.y, y: coord.x })));
    const tmp = newX; setNewX(newY); setNewY(tmp);
  };

  const handleViewMap = () => {
    if (coordinates.length === 0) return;
    triggerMedium();
    const mapData = toMapPoints(title, selectedCity.value, coordinates);
    (navigation as any).navigate('Map', { mapData });
  };

  const handleSaveProject = async (saveTitle: string) => {
    try {
      let address = '';
      if (coordinates.length > 0) {
        const mapData = toMapPoints(title, selectedCity.value, coordinates);
        if (mapData?.wgs84Points?.length) {
          const firstPoint = mapData.wgs84Points[0];
          address = (await getAddressFromCoordinates(firstPoint.latitude, firstPoint.longitude)) ?? '';
        }
      }
      const existingProjectsJson = await AsyncStorage.getItem('saved_projects');
      const existingProjects: Project[] = existingProjectsJson ? JSON.parse(existingProjectsJson) : [];
      const existingIndex = existingProjects.findIndex(
        p => p.title.toLowerCase() === saveTitle.toLowerCase(),
      );

      const saveData = (isOverwrite = false) => {
        const projectData: Project = {
          id: isOverwrite ? existingProjects[existingIndex].id : nanoid(),
          title: saveTitle,
          city: selectedCity.label,
          cityValue: selectedCity.value,
          coordinates,
          address,
          createdAt: isOverwrite ? existingProjects[existingIndex].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updatedProjects = isOverwrite
          ? existingProjects.map((p, i) => (i === existingIndex ? projectData : p))
          : [projectData, ...existingProjects];
        AsyncStorage.setItem('saved_projects', JSON.stringify(updatedProjects))
          .then(() => { triggerSuccess(); showToast('Đã lưu dự án thành công!', 'success'); })
          .catch(e => console.error(e));
      };

      if (existingIndex !== -1) {
        Alert.alert('Trùng tên dự án', `Dự án "${saveTitle}" đã tồn tại. Bạn có muốn ghi đè không?`, [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Ghi đè', onPress: () => saveData(true) },
        ]);
      } else {
        // Kiểm tra giới hạn 10 sổ đỏ
        if (existingProjects.length >= SODO_REWARDED_MIN_COUNT && !AdFreeService.isPremium()) {
          Alert.alert(
            'Giới hạn sổ đỏ',
            `Bạn đã lưu ${existingProjects.length} sổ đỏ. Hãy xem một quảng cáo ngắn để lưu thêm hoặc nâng cấp bản Pro để lưu không giới hạn.`,
            [
              { text: 'Hủy', style: 'cancel' },
              {
                text: 'Mua bản Pro',
                onPress: () => {
                  // Chuyển đến màn hình Settings (Tab thứ 5)
                  navigation.navigate('Cài đặt' as never);
                },
              },
              {
                text: 'Xem quảng cáo',
                onPress: () => {
                  showRewardedAd(() => {
                    saveData(false);
                  });
                },
              },
            ],
          );
        } else {
          saveData(false);
        }
      }
    } catch {
      Alert.alert('Lỗi', 'Lỗi khi lưu dự án');
    }
  };

  const hasCoordinates = coordinates.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: t.colors.backgroundGrouped }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* ── Navigation bar ── */}
        <View style={[styles.navBar, { borderBottomColor: t.colors.separator }]}>
          <Animated.Text
            style={[t.typography.headline, styles.navTitle, { color: t.colors.label, opacity: navTitleOpacity, fontFamily: t.fontFamily }]}
            numberOfLines={1}
          >
            {title}
          </Animated.Text>
          <Pressable
            onPress={() => setIsEditMode(e => !e)}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel={isEditMode ? 'Xong chỉnh sửa' : 'Chỉnh sửa danh sách tọa độ'}
          >
            <Text style={[t.typography.body, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
              {isEditMode ? 'Xong' : 'Sửa'}
            </Text>
          </Pressable>
        </View>

        {/* ── Scroll content ── */}
        <Animated.ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 20 }]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
        >
          {/* Large title */}
          <TextInput
            style={[t.typography.largeTitle, styles.largeTitle, { color: t.colors.label, fontFamily: t.fontFamily }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Tên dự án"
            placeholderTextColor={t.colors.placeholder}
          />

          {/* Scan card */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              t.shadow.sm,
              { backgroundColor: t.colors.surface },
              pressed && Platform.OS === 'ios' && { opacity: 0.85 },
            ]}
            android_ripple={{ color: t.colors.fillTertiary }}
            onPress={handleScan}
            disabled={isScanning}
            accessibilityRole="button"
            accessibilityLabel="Quét tọa độ từ ảnh"
          >
            <View style={[styles.scanIconWrap, { backgroundColor: t.colors.primaryLight }]}>
              {isScanning
                ? <ActivityIndicator size="small" color={t.colors.primary} />
                : <Camera size={22} color={t.colors.primary} />
              }
            </View>
            <View style={styles.scanText}>
              <Text style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]}>
                Quét tọa độ từ ảnh
              </Text>
              <Text style={[t.typography.subheadline, styles.scanSub, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
                Tự động nhận dạng từ sổ đỏ
              </Text>
            </View>
            <ChevronRight size={18} color={t.colors.labelTertiary} />
          </Pressable>

          {/* City card */}
          <View style={[styles.cardNoPad, t.shadow.sm, { backgroundColor: t.colors.surface }]}>
            <CitySelector selectedCity={selectedCity} onPress={() => setModalVisible(true)} />
          </View>

          {/* Coordinates section */}
          <Text style={[styles.sectionHeader, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
            Tọa độ{coordinates.length > 0 ? ` · ${coordinates.length} điểm` : ''}
          </Text>
          <View style={[styles.cardNoPad, t.shadow.sm, { backgroundColor: t.colors.surface }]}>
            {coordinates.map((coord, index) => (
              <React.Fragment key={coord.id}>
                <CoordinateRow
                  index={index}
                  x={coord.x}
                  y={coord.y}
                  isEditMode={isEditMode}
                  onChangeX={val => updateCoordinate(coord.id, 'x', val)}
                  onChangeY={val => updateCoordinate(coord.id, 'y', val)}
                  onDelete={() => deleteCoordinate(coord.id)}
                />
                <View style={[styles.rowSep, { backgroundColor: t.colors.separator, marginLeft: isEditMode ? 54 : 16 }]} />
              </React.Fragment>
            ))}
            <CoordinateRow
              index={coordinates.length}
              x={newX}
              y={newY}
              onChangeX={setNewX}
              onChangeY={setNewY}
              onAdd={addCoordinate}
              isNew
            />
          </View>

          {/* In-feed ad — cuối danh sách tọa độ */}
          <AdBanner style={{ borderRadius: 10, marginBottom: 12 }} />

          {/* Utility row */}
          <View style={[styles.utilityRow, t.shadow.sm, { backgroundColor: t.colors.surface }]}>
            <Pressable
              style={({ pressed }) => [styles.utilityBtn, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
              android_ripple={{ color: t.colors.fillPrimary }}
              onPress={() => { setEditText(formatCoordinatesForEdit()); setEditModalVisible(true); }}
              accessibilityRole="button"
              accessibilityLabel="Sửa tọa độ X và Y"
            >
              <Pencil size={15} color={t.colors.primary} />
              <Text style={[t.typography.callout, styles.utilityLabel, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
                Sửa X&Y
              </Text>
            </Pressable>
            <View style={[styles.utilityDivider, { backgroundColor: t.colors.separator }]} />
            <Pressable
              style={({ pressed }) => [styles.utilityBtn, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
              android_ripple={{ color: t.colors.fillPrimary }}
              onPress={swapXY}
              accessibilityRole="button"
              accessibilityLabel="Hoán đổi X và Y"
            >
              <ArrowLeftRight size={15} color={t.colors.primary} />
              <Text style={[t.typography.callout, styles.utilityLabel, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
                Hoán đổi X↔Y
              </Text>
            </Pressable>
          </View>

          {/* Primary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: hasCoordinates ? t.colors.primary : t.colors.labelTertiary,
                borderRadius: t.radius.lg,
                marginTop: 20,
                opacity: pressed && Platform.OS === 'ios' ? 0.8 : 1,
              },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            onPress={handleViewMap}
            disabled={!hasCoordinates || isViewingMap}
            accessibilityRole="button"
            accessibilityLabel="Xem thửa đất trên bản đồ"
          >
            {isViewingMap
              ? <ActivityIndicator color="#fff" />
              : <Text style={[t.typography.headline, { color: '#fff', fontFamily: t.fontFamily }]}>Xem Bản Đồ</Text>
            }
          </Pressable>

          {/* Secondary CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: t.colors.success,
                borderRadius: t.radius.lg,
                marginTop: 10,
                opacity: pressed && Platform.OS === 'ios' ? 0.8 : 1,
              },
            ]}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            onPress={() => setSaveModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Lưu dự án"
          >
            <Text style={[t.typography.headline, { color: '#fff', fontFamily: t.fontFamily }]}>Lưu Lại</Text>
          </Pressable>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <CityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        searchText={searchText}
        onSearchChange={setSearchText}
        onSelectCity={item => { setSelectedCity(item); setModalVisible(false); setSearchText(''); }}
        selectedCity={selectedCity}
      />
      <CoordinateEditModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveEdit}
        initialValue={editText}
      />
      <SaveProjectModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSaveProject}
        initialTitle={title}
        initialCity={selectedCity?.label}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  navBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navTitle: {
    flex: 1,
  },
  navButton: {
    minWidth: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },

  scrollContent: {
    paddingHorizontal: 16,
  },

  largeTitle: {
    marginTop: 8,
    marginBottom: 20,
    padding: 0,
  },

  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardNoPad: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },

  scanIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    flex: 1,
    marginLeft: 14,
  },
  scanSub: {
    marginTop: 2,
  },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 4,
    marginBottom: 6,
    marginHorizontal: 4,
  },

  rowSep: {
    height: StyleSheet.hairlineWidth,
    marginRight: 16,
  },

  utilityRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  utilityLabel: {
    fontWeight: '500',
  },
  utilityDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },

  primaryButton: {
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default HomeScreen;
