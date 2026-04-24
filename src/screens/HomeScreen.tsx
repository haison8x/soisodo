import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';

import ProjectTitleInput from '../components/HomeScreen/ProjectTitleInput';
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
import { useToast } from '../components/shared/ToastProvider';
import { triggerMedium, triggerSuccess } from '../utils/haptics';
import { useTheme } from '../theme/ThemeProvider';
import type { City, Coordinate, Project } from '../types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAd } = useInterstitialAd();
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

  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');

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
    setCoordinates(coordinates.filter(coord => coord.id !== id));
  };

  const addCoordinate = () => {
    if (newX && newY) {
      setCoordinates([...coordinates, { id: nanoid(), x: newX, y: newY }]);
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
    setIsViewingMap(true);
    triggerMedium();
    const mapData = toMapPoints(title, selectedCity.value, coordinates);
    showAd(() => {
      setIsViewingMap(false);
      (navigation as any).navigate('Map', { mapData });
    });
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
        saveData(false);
      }
    } catch {
      Alert.alert('Lỗi', 'Lỗi khi lưu dự án');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.colors.surface }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: tabBarHeight + t.spacing.base }}
        >
          <ProjectTitleInput value={title} onChangeText={setTitle} />
          <CitySelector selectedCity={selectedCity} onPress={() => setModalVisible(true)} />

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

          {/* Scan row */}
          <View style={[styles.scanRow, {
            backgroundColor: t.colors.surfaceSecondary,
            borderRadius: t.radius.md,
            padding: t.spacing.md,
          }]}>
            <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
              Nhập tọa độ hoặc
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.scanButton,
                { backgroundColor: t.colors.primary, borderRadius: t.radius.sm },
                pressed && Platform.OS === 'ios' && { opacity: 0.75 },
                isScanning && { opacity: 0.6 },
              ]}
              android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
              onPress={handleScan}
              disabled={isScanning}
              accessibilityRole="button"
              accessibilityLabel="Quét ảnh tọa độ"
            >
              {isScanning
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={[t.typography.callout, { color: '#fff', fontWeight: '700', fontFamily: t.fontFamily }]}>Scan</Text>
              }
            </Pressable>
            <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
              từ bộ sưu tập ảnh
            </Text>
          </View>

          {coordinates.map((coord, index) => (
            <CoordinateRow
              key={coord.id}
              index={index}
              x={coord.x}
              y={coord.y}
              onDelete={() => deleteCoordinate(coord.id)}
            />
          ))}

          {/* Utility action row — both neutral secondary style, not warning orange */}
          <View style={[styles.actionRow, { marginVertical: t.spacing.base }]}>
            <Pressable
              style={({ pressed }) => [styles.halfButton, {
                backgroundColor: t.colors.surfaceSecondary,
                borderRadius: t.radius.md,
                opacity: pressed && Platform.OS === 'ios' ? 0.75 : 1,
              }]}
              android_ripple={{ color: t.colors.fillTertiary }}
              onPress={() => { setEditText(formatCoordinatesForEdit()); setEditModalVisible(true); }}
              accessibilityRole="button"
              accessibilityLabel="Sửa tọa độ X và Y"
            >
              <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontWeight: '600', fontFamily: t.fontFamily }]}>
                Sửa X&Y
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.halfButton, {
                backgroundColor: t.colors.surfaceSecondary,
                borderRadius: t.radius.md,
                opacity: pressed && Platform.OS === 'ios' ? 0.75 : 1,
              }]}
              android_ripple={{ color: t.colors.fillTertiary }}
              onPress={swapXY}
              accessibilityRole="button"
              accessibilityLabel="Hoán đổi tọa độ X và Y"
            >
              <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontWeight: '600', fontFamily: t.fontFamily }]}>
                Hoán đổi X↔Y
              </Text>
            </Pressable>
          </View>

          <CoordinateRow
            index={coordinates.length}
            x={newX}
            y={newY}
            onChangeX={setNewX}
            onChangeY={setNewY}
            isNew
          />

          {/* Primary CTA */}
          <Pressable
            style={({ pressed }) => [styles.fullButton, {
              backgroundColor: t.colors.primary,
              borderRadius: t.radius.md,
              marginTop: t.spacing.base,
              opacity: pressed && Platform.OS === 'ios' ? 0.75 : 1,
            }]}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            onPress={handleViewMap}
            disabled={coordinates.length === 0 || isViewingMap}
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
            style={({ pressed }) => [styles.fullButton, {
              backgroundColor: t.colors.success,
              borderRadius: t.radius.md,
              marginTop: t.spacing.sm,
              opacity: pressed && Platform.OS === 'ios' ? 0.75 : 1,
            }]}
            android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
            onPress={() => setSaveModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Lưu dự án"
          >
            <Text style={[t.typography.headline, { color: '#fff', fontFamily: t.fontFamily }]}>Lưu Lại</Text>
          </Pressable>

          {/* Ghost CTA */}
          <View style={[styles.actionRow, { marginVertical: t.spacing.base }]}>
            <Pressable
              style={({ pressed }) => [styles.outlineButton, {
                borderColor: t.colors.primary,
                borderRadius: t.radius.md,
                opacity: pressed && Platform.OS === 'ios' ? 0.75 : 1,
              }]}
              android_ripple={{ color: t.colors.fillPrimary }}
              onPress={addCoordinate}
              accessibilityRole="button"
              accessibilityLabel="Thêm tọa độ mới"
            >
              <Text style={[t.typography.callout, { color: t.colors.primary, fontWeight: '700', fontFamily: t.fontFamily }]}>
                + Thêm Tọa Độ
              </Text>
            </Pressable>
          </View>

          <SaveProjectModal
            visible={saveModalVisible}
            onClose={() => setSaveModalVisible(false)}
            onSave={handleSaveProject}
            initialTitle={title}
            initialCity={selectedCity?.label}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  scanButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullButton: {
    width: '100%',
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfButton: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  outlineButton: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
