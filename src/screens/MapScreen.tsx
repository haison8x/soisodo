import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import MapLibre, {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  LineLayer,
  UserLocation,
  setConnected,
} from '@maplibre/maplibre-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Layers, Target, Plus, Minus, Map as MapIcon, Share2, MapPin, Save } from 'lucide-react-native';
import SaveProjectModal from '../components/HomeScreen/SaveProjectModal';
import { CITIES } from '../constants/mockDataHomeScreen';
import { getAddressFromCoordinates } from '../utils/geocoding';
import type { MapData, Project } from '../types';
import type { RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../types/navigation';
import { Colors, Spacing, Typography, Radius } from '../theme';
import { useToast } from '../components/shared/ToastProvider';
import { triggerSuccess } from '../utils/haptics';

const MAPTILER_KEY = '8DY7FmNFHpdvQiaVc2gb';

setConnected(true);

interface MapStyle {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const STYLES: MapStyle[] = [
  { id: 'streets-v2', name: 'Đường phố', icon: <MapIcon size={20} color={Colors.textOnDark} /> },
  { id: 'hybrid', name: 'Vệ tinh', icon: <Layers size={20} color={Colors.textOnDark} /> },
  { id: 'dataviz-light', name: 'Tối giản', icon: <Target size={20} color={Colors.textOnDark} /> },
];

type GeoJSONPointCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: Record<string, never>;
  }>;
};

type GeoJSONLine = {
  type: 'Feature';
  geometry: { type: 'LineString'; coordinates: [number, number][] };
  properties: Record<string, never>;
};

const MapScreen = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'Map'>>();
  const navigation = useNavigation();
  const mapData: MapData | undefined = route.params?.mapData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [styleIndex, setStyleIndex] = useState(0);
  const styleMode = STYLES[styleIndex].id;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setPermissionGranted(true);
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  const { pointShape, lineShape } = useMemo<{
    pointShape: GeoJSONPointCollection | null;
    lineShape: GeoJSONLine | null;
  }>(() => {
    if (!mapData?.wgs84Points?.length) return { pointShape: null, lineShape: null };

    const coords = mapData.wgs84Points.map<[number, number]>(p => [p.longitude, p.latitude]);

    const pShape: GeoJSONPointCollection = {
      type: 'FeatureCollection',
      features: coords.map(c => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: c },
        properties: {},
      })),
    };

    let lShape: GeoJSONLine | null = null;
    if (coords.length >= 2) {
      const lineCoords: [number, number][] = [...coords];
      if (coords.length > 2) lineCoords.push(coords[0]);
      lShape = {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: lineCoords },
        properties: {},
      };
    }

    return { pointShape: pShape, lineShape: lShape };
  }, [mapData]);

  const fitPolygon = (duration = 1500) => {
    if (cameraRef.current && mapData?.wgs84Points?.length) {
      const lons = mapData.wgs84Points.map(p => p.longitude);
      const lats = mapData.wgs84Points.map(p => p.latitude);

      if (lons.length === 1) {
        cameraRef.current.setCamera({ centerCoordinate: [lons[0], lats[0]], zoomLevel: 17, duration });
      } else {
        cameraRef.current.setCamera({
          bounds: {
            ne: [Math.max(...lons), Math.max(...lats)],
            sw: [Math.min(...lons), Math.min(...lats)],
          },
          padding: { top: 100, bottom: 100, left: 60, right: 60 },
          duration,
        });
      }
    }
  };

  const zoomRef = useRef(17);

  useEffect(() => {
    if (cameraRef.current && mapData?.wgs84Points?.length) {
      setTimeout(() => fitPolygon(2000), 1000);
    }
  }, [mapData]);

  const changeZoom = (delta: number) => {
    if (cameraRef.current) {
      zoomRef.current = Math.max(1, Math.min(22, zoomRef.current + delta));
      cameraRef.current.setCamera({ zoomLevel: zoomRef.current, duration: 300 });
    }
  };

  const toggleStyle = () => setStyleIndex(prev => (prev + 1) % STYLES.length);

  const openGeoJsonIO = () => {
    if (!lineShape && !pointShape) return;
    try {
      const geojsonData = {
        type: 'FeatureCollection',
        features: [] as object[],
      };

      if (lineShape && lineShape.geometry.coordinates.length >= 3) {
        geojsonData.features.push({
          type: 'Feature',
          properties: {},
          geometry: { type: 'Polygon', coordinates: [lineShape.geometry.coordinates] },
        });
      } else if (lineShape) {
        geojsonData.features.push(lineShape);
      }

      if (pointShape?.features) geojsonData.features.push(...pointShape.features);

      const url = `https://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geojsonData))}`;
      Linking.openURL(url);
    } catch (error) {
      console.error('[MapScreen] Error opening geojson.io:', error);
    }
  };

  const initialCityLabel = useMemo(() => {
    if (!mapData?.province) return '';
    const cityObj = CITIES.find(c => c.value === mapData.province);
    return cityObj?.label ?? '';
  }, [mapData]);

  const handleSaveProject = async (saveTitle: string) => {
    try {
      let address = '';
      if (mapData?.wgs84Points?.length) {
        const firstPoint = mapData.wgs84Points[0];
        address = (await getAddressFromCoordinates(firstPoint.latitude, firstPoint.longitude)) ?? '';
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
          city: initialCityLabel,
          cityValue: mapData?.province ?? '',
          coordinates: mapData?.points ?? [],
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

  const openGoogleMaps = () => {
    if (!mapData?.wgs84Points?.length) return;
    const lats = mapData.wgs84Points.map(p => p.latitude);
    const lons = mapData.wgs84Points.map(p => p.longitude);
    const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
    const centerLon = (Math.max(...lons) + Math.min(...lons)) / 2;

    const url =
      Platform.OS === 'ios'
        ? `maps://0,0?q=${centerLat},${centerLon}`
        : `geo:0,0?q=${centerLat},${centerLon}(${encodeURIComponent(mapData.name ?? 'Dự án')})`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLon}`;

    Linking.canOpenURL(url)
      .then(supported => Linking.openURL(supported ? url : webUrl))
      .catch(() => Linking.openURL(webUrl));
  };

  const firstPoint = mapData?.wgs84Points?.[0];
  const currentStyleURL = `https://api.maptiler.com/maps/${styleMode}/style.json?key=${MAPTILER_KEY}`;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        logoEnabled={false}
        attributionEnabled={false}
        mapStyle={currentStyleURL}
      >
        <Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: firstPoint
              ? [firstPoint.longitude, firstPoint.latitude]
              : [106.660172, 10.762622],
            zoomLevel: 17,
          }}
          onCameraChanged={(e: { properties: { zoomLevel: number } }) => {
            zoomRef.current = e.properties.zoomLevel;
          }}
        />

        {permissionGranted && location && <UserLocation visible animated />}

        {pointShape && (
          <ShapeSource id="pointsSource" shape={pointShape}>
            <CircleLayer
              id="circleLayer"
              style={{
                circleRadius: 6,
                circleColor: Colors.danger,
                circleStrokeWidth: 2,
                circleStrokeColor: Colors.surface,
              }}
            />
          </ShapeSource>
        )}

        {lineShape && (
          <ShapeSource id="lineSource" shape={lineShape}>
            <LineLayer
              id="lineLayer"
              style={{
                lineColor: styleMode.includes('streets') ? Colors.primary : Colors.mapLineSatellite,
                lineWidth: 4,
                lineJoin: 'round',
                lineCap: 'round',
                lineOpacity: 0.9,
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      <View style={styles.headerContainer}>
        <View style={styles.glassInfo}>
          <Text style={styles.infoTitle} numberOfLines={1}>
            {mapData?.name ?? 'Vị trí dự án'}
          </Text>
          {firstPoint && (
            <Text style={styles.infoCoords}>
              {firstPoint.latitude.toFixed(6)}, {firstPoint.longitude.toFixed(6)}
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.sideControls, { bottom: insets.bottom + Spacing.xxl }]}>
        <TouchableOpacity style={styles.glassBtn} onPress={() => changeZoom(1)}>
          <Plus size={22} color={Colors.textOnDark} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={() => changeZoom(-1)}>
          <Minus size={22} color={Colors.textOnDark} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.glassBtn} onPress={toggleStyle}>
          {STYLES[styleIndex].icon}
          <Text style={styles.btnLabel}>{STYLES[styleIndex].name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={openGeoJsonIO}>
          <Share2 size={22} color={Colors.textOnDark} />
          <Text style={styles.btnLabel}>GeoJSON</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={openGoogleMaps}>
          <MapPin size={22} color={Colors.textOnDark} />
          <Text style={styles.btnLabel}>Google Map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.glassBtn, styles.glassBtnSuccess]}
          onPress={() => setSaveModalVisible(true)}
        >
          <Save size={22} color={Colors.textOnDark} />
          <Text style={styles.btnLabel}>Lưu Lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={() => fitPolygon(1000)}>
          <Target size={22} color={Colors.textOnDark} />
        </TouchableOpacity>

        <SaveProjectModal
          visible={saveModalVisible}
          onClose={() => setSaveModalVisible(false)}
          onSave={handleSaveProject}
          initialTitle={mapData?.name}
          initialCity={initialCityLabel}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surfaceMap },
  map: { flex: 1 },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'center',
  },
  glassInfo: {
    backgroundColor: Colors.glassLight,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.xl,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  infoTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  infoCoords: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  sideControls: { position: 'absolute', right: Spacing.lg, gap: 10 },
  glassBtn: {
    width: 56,
    paddingVertical: 12,
    backgroundColor: Colors.glassDark,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  glassBtnSuccess: { backgroundColor: Colors.success },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  btnLabel: {
    color: Colors.textOnDark,
    fontSize: 9,
    fontWeight: Typography.fontWeights.semibold,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default MapScreen;
