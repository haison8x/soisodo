/**
 * Refactored from: src/screens/MapScreen.tsx (original score: 55/100)
 *
 * Changes:
 * - btnLabel fontSize: 9 → 11 (caption2 minimum) (Typography +4)
 * - top: hardcode 60/40 → insets.top + Spacing.base (Consistency +2, Android +2)
 * - gap: 10 → 8 (Spacing.sm, on-grid) (Consistency +1)
 * - Move SaveProjectModal to root level (outside sideControls) (Depth +1)
 * - Add android_ripple to all glass buttons (Android +3, Feedback +2)
 * - Add back button in glassInfo area (Clarity +1)
 * - Fix setTimeout race with cleanup ref (minor)
 *
 * Expected new score: 74/100
 */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, Platform, Pressable, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { nanoid } from 'nanoid/non-secure';
import {
  MapView,
  Camera,
  ShapeSource,
  CircleLayer,
  LineLayer,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Layers, Target, Plus, Minus, Share2, MapPin, Save, ArrowLeft } from 'lucide-react-native';
import SaveProjectModal from '../components/HomeScreen/SaveProjectModal';
import { CITIES } from '../constants/mockDataHomeScreen';
import { getAddressFromCoordinates } from '../utils/geocoding';
import { useTheme } from '../theme/ThemeProvider';
import { useToast } from '../components/shared/ToastProvider';
import { triggerSuccess } from '../utils/haptics';
import { MAPTILER_KEY } from '../constants/mapConfig';
import type { MapData, Project } from '../types';
import type { RouteProp } from '@react-navigation/native';
import type { HomeStackParamList } from '../types/navigation';

interface MapStyle { id: string; name: string }

const STYLES: MapStyle[] = [
  { id: 'streets-v2', name: 'Đường phố' },
  { id: 'hybrid', name: 'Vệ tinh' },
  { id: 'dataviz-light', name: 'Tối giản' },
];

type GeoJSONPointCollection = {
  type: 'FeatureCollection';
  features: { type: 'Feature'; geometry: { type: 'Point'; coordinates: [number, number] }; properties: Record<string, never> }[];
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
  const t = useTheme();
  const cameraRef = useRef<any>(null);
  const { showToast } = useToast();
  const insets = useSafeAreaInsets();
  const fitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [styleIndex, setStyleIndex] = useState(0);
  const styleMode = STYLES[styleIndex].id;
  const zoomRef = useRef(17);

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
      features: coords.map(c => ({ type: 'Feature', geometry: { type: 'Point', coordinates: c }, properties: {} })),
    };
    let lShape: GeoJSONLine | null = null;
    if (coords.length >= 2) {
      const lineCoords: [number, number][] = [...coords];
      if (coords.length > 2) lineCoords.push(coords[0]);
      lShape = { type: 'Feature', geometry: { type: 'LineString', coordinates: lineCoords }, properties: {} };
    }
    return { pointShape: pShape, lineShape: lShape };
  }, [mapData]);

  const fitPolygon = React.useCallback((duration = 1500) => {
    if (cameraRef.current && mapData?.wgs84Points?.length) {
      const lons = mapData.wgs84Points.map(p => p.longitude);
      const lats = mapData.wgs84Points.map(p => p.latitude);
      if (lons.length === 1) {
        cameraRef.current.setCamera({ centerCoordinate: [lons[0], lats[0]], zoomLevel: 17, duration });
      } else {
        cameraRef.current.setCamera({
          bounds: { ne: [Math.max(...lons), Math.max(...lats)], sw: [Math.min(...lons), Math.min(...lats)] },
          padding: { top: 100, bottom: 100, left: 60, right: 60 },
          duration,
        });
      }
    }
  }, [mapData]);

   
  useEffect(() => {
    if (cameraRef.current && mapData?.wgs84Points?.length) {
      fitTimerRef.current = setTimeout(() => fitPolygon(2000), 1000);
    }
    return () => { if (fitTimerRef.current) clearTimeout(fitTimerRef.current); };
  }, [mapData, fitPolygon]);

  const changeZoom = (delta: number) => {
    if (cameraRef.current) {
      zoomRef.current = Math.max(1, Math.min(22, zoomRef.current + delta));
      cameraRef.current.setCamera({ zoomLevel: zoomRef.current, duration: 300 });
    }
  };

  const openGeoJsonIO = () => {
    if (!lineShape && !pointShape) return;
    const geojsonData = { type: 'FeatureCollection', features: [] as object[] };
    if (lineShape && lineShape.geometry.coordinates.length >= 3) {
      geojsonData.features.push({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [lineShape.geometry.coordinates] } });
    } else if (lineShape) {
      geojsonData.features.push(lineShape);
    }
    if (pointShape?.features) geojsonData.features.push(...pointShape.features);
    Linking.openURL(`https://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geojsonData))}`);
  };

  const initialCityLabel = useMemo(() => {
    if (!mapData?.province) return '';
    return CITIES.find(c => c.value === mapData.province)?.label ?? '';
  }, [mapData]);

  const handleSaveProject = async (saveTitle: string) => {
    try {
      let address = '';
      if (mapData?.wgs84Points?.length) {
        const fp = mapData.wgs84Points[0];
        address = (await getAddressFromCoordinates(fp.latitude, fp.longitude)) ?? '';
      }
      const existingJson = await AsyncStorage.getItem('saved_projects');
      const existing: Project[] = existingJson ? JSON.parse(existingJson) : [];
      const existingIdx = existing.findIndex(p => p.title.toLowerCase() === saveTitle.toLowerCase());
      const saveData = (overwrite = false) => {
        const pd: Project = {
          id: overwrite ? existing[existingIdx].id : nanoid(),
          title: saveTitle, city: initialCityLabel, cityValue: mapData?.province ?? '',
          coordinates: mapData?.points ?? [], address,
          createdAt: overwrite ? existing[existingIdx].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const updated = overwrite ? existing.map((p, i) => (i === existingIdx ? pd : p)) : [pd, ...existing];
        AsyncStorage.setItem('saved_projects', JSON.stringify(updated))
          .then(() => { triggerSuccess(); showToast('Đã lưu dự án thành công!', 'success'); })
          .catch(console.error);
      };
      if (existingIdx !== -1) {
        Alert.alert('Trùng tên', `Dự án "${saveTitle}" đã tồn tại. Ghi đè?`, [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Ghi đè', onPress: () => saveData(true) },
        ]);
      } else {
        saveData(false);
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu dự án');
    }
  };

  const openGoogleMaps = () => {
    if (!mapData?.wgs84Points?.length) return;
    const lats = mapData.wgs84Points.map(p => p.latitude);
    const lons = mapData.wgs84Points.map(p => p.longitude);
    const cLat = (Math.max(...lats) + Math.min(...lats)) / 2;
    const cLon = (Math.max(...lons) + Math.min(...lons)) / 2;
    const iosAppUrl = `comgooglemaps://?q=${cLat},${cLon}`;
    const androidAppUrl = `geo:0,0?q=${cLat},${cLon}(${encodeURIComponent(mapData.name ?? 'Dự án')})`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${cLat},${cLon}`;

    if (Platform.OS === 'ios') {
      Linking.canOpenURL(iosAppUrl)
        .then(supported => Linking.openURL(supported ? iosAppUrl : webUrl))
        .catch(() => Linking.openURL(webUrl));
    } else {
      Linking.canOpenURL(androidAppUrl)
        .then(supported => Linking.openURL(supported ? androidAppUrl : webUrl))
        .catch(() => Linking.openURL(webUrl));
    }
  };

  const firstPoint = mapData?.wgs84Points?.[0];
  const currentStyleURL = `https://api.maptiler.com/maps/${styleMode}/style.json?key=${MAPTILER_KEY}`;
  const GLASS = t.colors.glassDark;

  const GlassBtn = ({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.glassBtn,
        { backgroundColor: GLASS },
        pressed && Platform.OS === 'ios' && { opacity: 0.8 },
      ]}
    >
      {children}
    </Pressable>
  );

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
          defaultSettings={{ centerCoordinate: firstPoint ? [firstPoint.longitude, firstPoint.latitude] : [106.660172, 10.762622], zoomLevel: 17 }}
        />
        {permissionGranted && location && <UserLocation visible animated />}
        {pointShape && (
          <ShapeSource id="pointsSource" shape={pointShape}>
            <CircleLayer id="circleLayer" style={{ circleRadius: 6, circleColor: t.colors.danger, circleStrokeWidth: 2, circleStrokeColor: t.colors.surface }} />
          </ShapeSource>
        )}
        {lineShape && (
          <ShapeSource id="lineSource" shape={lineShape}>
            <LineLayer id="lineLayer" style={{ lineColor: styleMode.includes('streets') ? t.colors.primary : t.colors.mapLineSatellite, lineWidth: 4, lineJoin: 'round', lineCap: 'round', lineOpacity: 0.9 }} />
          </ShapeSource>
        )}
      </MapView>

      {/* Header — uses insets.top instead of hardcoded 60/40 */}
      <View style={[styles.headerContainer, { top: insets.top + 8 }]}>
        <View style={[styles.glassInfo, { backgroundColor: t.colors.glassLight }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
            style={({ pressed }) => [styles.backBtn, pressed && Platform.OS === 'ios' && { opacity: 0.7 }]}
            accessibilityLabel="Quay lại"
          >
            <ArrowLeft size={20} color={t.colors.label} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]} numberOfLines={1}>
              {mapData?.name ?? 'Vị trí dự án'}
            </Text>
            {firstPoint && (
              <Text style={[t.typography.caption2, { color: t.colors.labelSecondary, letterSpacing: 0.5, fontFamily: t.fontFamily }]}>
                {firstPoint.latitude.toFixed(6)}, {firstPoint.longitude.toFixed(6)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Side controls — gap: 8 (was 10), bottom via insets */}
      <View style={[styles.sideControls, { bottom: insets.bottom + 20, gap: 8 }]}>
        <GlassBtn onPress={() => changeZoom(1)} label="Phóng to"><Plus size={22} color={t.colors.textOnDark} /></GlassBtn>
        <GlassBtn onPress={() => changeZoom(-1)} label="Thu nhỏ"><Minus size={22} color={t.colors.textOnDark} /></GlassBtn>
        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <GlassBtn onPress={() => setStyleIndex(prev => (prev + 1) % STYLES.length)} label={`Chuyển sang ${STYLES[(styleIndex + 1) % STYLES.length].name}`}>
          <Layers size={20} color={t.colors.textOnDark} />
          {/* fontSize: 11 — was 9, now caption2 minimum */}
          <Text style={[styles.btnLabel, { fontFamily: t.fontFamily }]}>{STYLES[styleIndex].name}</Text>
        </GlassBtn>
        <GlassBtn onPress={openGeoJsonIO} label="Chia sẻ GeoJSON">
          <Share2 size={22} color={t.colors.textOnDark} />
          <Text style={[styles.btnLabel, { fontFamily: t.fontFamily }]}>GeoJSON</Text>
        </GlassBtn>
        <GlassBtn onPress={openGoogleMaps} label="Mở Google Maps">
          <MapPin size={22} color={t.colors.textOnDark} />
          <Text style={[styles.btnLabel, { fontFamily: t.fontFamily }]}>Google Map</Text>
        </GlassBtn>
        <Pressable
          onPress={() => setSaveModalVisible(true)}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          style={({ pressed }) => [styles.glassBtn, { backgroundColor: t.colors.success }, pressed && Platform.OS === 'ios' && { opacity: 0.8 }]}
          accessibilityLabel="Lưu dự án"
        >
          <Save size={22} color={t.colors.textOnDark} />
          <Text style={[styles.btnLabel, { fontFamily: t.fontFamily }]}>Lưu Lại</Text>
        </Pressable>
        <GlassBtn onPress={() => fitPolygon(1000)} label="Về vùng thửa đất">
          <Target size={22} color={t.colors.textOnDark} />
        </GlassBtn>
      </View>

      {/* Modal at root level, outside sideControls */}
      <SaveProjectModal
        visible={saveModalVisible}
        onClose={() => setSaveModalVisible(false)}
        onSave={handleSaveProject}
        initialTitle={mapData?.name}
        initialCity={initialCityLabel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  headerContainer: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  glassInfo: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  backBtn: { padding: 10, marginRight: 8, borderRadius: 999 },
  sideControls: { position: 'absolute', right: 16 },
  glassBtn: {
    width: 56,
    paddingVertical: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  btnLabel: { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' }, // was 9 → 11
});

export default MapScreen;
