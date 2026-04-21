import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { Colors, Spacing, Typography, Radius } from '../theme';
import { useToast } from '../components/shared/ToastProvider';
import { triggerMedium, triggerSuccess } from '../utils/haptics';
import type { City, Coordinate, Project } from '../types';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAd } = useInterstitialAd();
  const tabBarHeight = useBottomTabBarHeight();
  const { showToast } = useToast();

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
    const tokens = text.trim().split(/\s+/).filter(t => t !== '');
    const newCoordinates: Coordinate[] = [];
    for (let i = 0; i < tokens.length - 1; i += 2) {
      newCoordinates.push({ id: nanoid(), x: tokens[i], y: tokens[i + 1] });
    }
    if (newCoordinates.length > 0) setCoordinates(newCoordinates);
  };

  const swapXY = () => {
    setCoordinates(prev => prev.map(coord => ({ ...coord, x: coord.y, y: coord.x })));
    const tempX = newX;
    setNewX(newY);
    setNewY(tempX);
  };

  const handleViewMap = () => {
    if (coordinates.length > 0) {
      triggerMedium();
      const mapData = toMapPoints(title, selectedCity.value, coordinates);
      showAd(() => navigation.navigate('Map' as never, { mapData } as never));
    }
  };

  const handleSaveProject = async (saveTitle: string) => {
    try {
      let address = '';
      if (coordinates.length > 0) {
        const mapData = toMapPoints(title, selectedCity.value, coordinates);
        if (mapData?.wgs84Points && mapData.wgs84Points.length > 0) {
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
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert('Lỗi', 'Lỗi khi lưu dự án');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.lg }}
        >
          <ProjectTitleInput value={title} onChangeText={setTitle} />

          <CitySelector selectedCity={selectedCity} onPress={() => setModalVisible(true)} />

          <CityModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            searchText={searchText}
            onSearchChange={setSearchText}
            onSelectCity={item => {
              setSelectedCity(item);
              setModalVisible(false);
              setSearchText('');
            }}
            selectedCity={selectedCity}
          />

          <CoordinateEditModal
            visible={editModalVisible}
            onClose={() => setEditModalVisible(false)}
            onSave={handleSaveEdit}
            initialValue={editText}
          />

          <View style={styles.scanRow}>
            <Text style={styles.scanText}>Nhập tọa độ hoặc</Text>
            <TouchableOpacity
              style={[styles.scanButton, isScanning && { opacity: 0.6 }]}
              onPress={handleScan}
              disabled={isScanning}
            >
              <Text style={styles.scanButtonText}>{isScanning ? 'Đang xử lý...' : 'Scan'}</Text>
            </TouchableOpacity>
            <Text style={styles.scanText}>từ bộ sưu tập ảnh</Text>
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

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setEditText(formatCoordinatesForEdit());
                setEditModalVisible(true);
              }}
            >
              <Text style={styles.secondaryButtonText}>Sửa X&Y</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={swapXY}>
              <Text style={styles.buttonText}>Hoán đổi X↔Y</Text>
            </TouchableOpacity>
          </View>

          <CoordinateRow
            index={coordinates.length}
            x={newX}
            y={newY}
            onChangeX={setNewX}
            onChangeY={setNewY}
            isNew
          />

          <TouchableOpacity
            style={[styles.fullWidthButton, styles.primaryButton, { marginTop: Spacing.lg }]}
            onPress={handleViewMap}
          >
            <Text style={styles.buttonText}>Xem Bản Đồ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.fullWidthButton, styles.successButton, { marginTop: Spacing.sm }]}
            onPress={() => setSaveModalVisible(true)}
          >
            <Text style={styles.buttonText}>Lưu Lại</Text>
          </TouchableOpacity>

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={addCoordinate}>
              <Text style={styles.outlineButtonText}>+ Thêm Tọa Độ</Text>
            </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: Colors.surface },
  scrollView: { flex: 1, paddingHorizontal: Spacing.xl },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    backgroundColor: Colors.surfaceSecondary,
    padding: Spacing.sm + 2,
    borderRadius: Radius.sm + 2,
  },
  scanText: { fontSize: Typography.fontSizes.md, color: Colors.textSecondary },
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    marginHorizontal: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  scanButtonText: { color: Colors.textOnPrimary, fontWeight: Typography.fontWeights.bold, fontSize: Typography.fontSizes.md },
  fullWidthButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 },
  button: {
    flex: 0.48,
    paddingVertical: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButton: { backgroundColor: Colors.primary },
  successButton: { backgroundColor: Colors.success },
  secondaryButton: { backgroundColor: Colors.surfaceSecondary },
  warningButton: { backgroundColor: Colors.warning },
  outlineButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.surface,
  },
  buttonText: { color: Colors.textOnPrimary, fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold },
  secondaryButtonText: { color: Colors.textSecondary, fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold },
  outlineButtonText: { color: Colors.primary, fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold },
});

export default HomeScreen;
