import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Camera, ShapeSource, CircleLayer } from '@maplibre/maplibre-react-native';
import { ArrowLeft, MapPin, Plus, Minus, Layers, Map as MapIcon, Target } from 'lucide-react-native';
import { getAddressFromCoordinates } from '../utils/geocoding';
import type { StackScreenProps } from '@react-navigation/stack';
import type { VN2000StackParamList } from '../types/navigation';
import { Colors, Spacing, Typography, Radius } from '../theme';

const MAPTILER_KEY = '8DY7FmNFHpdvQiaVc2gb';

interface MapStyle {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const STYLES: MapStyle[] = [
  { id: 'streets-v2', name: 'Đường phố', icon: <MapIcon size={20} color={Colors.textOnPrimary} /> },
  { id: 'hybrid', name: 'Vệ tinh', icon: <Layers size={20} color={Colors.textOnPrimary} /> },
  { id: 'dataviz-light', name: 'Tối giản', icon: <Target size={20} color={Colors.textOnPrimary} /> },
];

type Props = StackScreenProps<VN2000StackParamList, 'ConvertGoogle'>;

const ConvertGoogleScreen = ({ route, navigation }: Props) => {
  const { latitude, longitude } = route.params;
  const insets = useSafeAreaInsets();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);
  const zoomRef = useRef(15);
  const [address, setAddress] = useState('Đang lấy địa chỉ...');
  const [loading, setLoading] = useState(true);
  const [styleIndex, setStyleIndex] = useState(0);

  const styleMode = STYLES[styleIndex].id;
  const currentStyleURL = `https://api.maptiler.com/maps/${styleMode}/style.json?key=${MAPTILER_KEY}`;

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const result = await getAddressFromCoordinates(latitude, longitude);
        setAddress(result ?? 'Không tìm thấy địa chỉ');
      } catch {
        setAddress('Lỗi khi lấy địa chỉ');
      } finally {
        setLoading(false);
      }
    };
    fetchAddress();
  }, [latitude, longitude]);

  const changeZoom = (delta: number) => {
    if (cameraRef.current) {
      zoomRef.current = Math.max(1, Math.min(22, zoomRef.current + delta));
      cameraRef.current.setCamera({ zoomLevel: zoomRef.current, duration: 300 });
    }
  };

  const toggleStyle = () => setStyleIndex(prev => (prev + 1) % STYLES.length);

  const recenter = () => {
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: 15,
        duration: 1000,
      });
    }
  };

  const openGoogleMaps = () => {
    const url =
      Platform.OS === 'ios'
        ? `maps://0,0?q=${latitude},${longitude}`
        : `geo:0,0?q=${latitude},${longitude}(Vị trí)`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    Linking.canOpenURL(url)
      .then(supported => Linking.openURL(supported ? url : webUrl))
      .catch(() => Linking.openURL(webUrl));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vị trí trên bản đồ</Text>
      </View>

      <MapView
        style={styles.map}
        mapStyle={currentStyleURL}
        logoEnabled={false}
        attributionEnabled={false}
      >
        <Camera
          ref={cameraRef}
          centerCoordinate={[longitude, latitude]}
          zoomLevel={zoomRef.current}
          onCameraChanged={(e: { properties: { zoomLevel: number } }) => {
            zoomRef.current = e.properties.zoomLevel;
          }}
        />

        <ShapeSource
          id="markerSource"
          shape={{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [longitude, latitude] },
            properties: {},
          }}
        >
          <CircleLayer
            id="markerLayer"
            style={{
              circleRadius: 10,
              circleColor: Colors.danger,
              circleStrokeWidth: 3,
              circleStrokeColor: Colors.surface,
            }}
          />
        </ShapeSource>
      </MapView>

      <View style={[styles.sideControls, { bottom: insets.bottom + 320 }]}>
        <TouchableOpacity style={styles.glassBtn} onPress={() => changeZoom(1)}>
          <Plus size={22} color={Colors.textOnPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={() => changeZoom(-1)}>
          <Minus size={22} color={Colors.textOnPrimary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.glassBtn} onPress={toggleStyle}>
          {STYLES[styleIndex].icon}
          <Text style={styles.btnLabel}>{STYLES[styleIndex].name}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={openGoogleMaps}>
          <MapPin size={22} color={Colors.textOnPrimary} />
          <Text style={styles.btnLabel}>Google Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.glassBtn} onPress={recenter}>
          <Target size={22} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.infoCard, { paddingBottom: insets.bottom + 220 }]}>
        <Text style={styles.coordinatesText}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
        <View style={styles.addressContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text style={styles.addressText}>{address}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.glassLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.lg,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceSecondary,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  map: { flex: 1 },
  infoCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  coordinatesText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  addressContainer: { minHeight: 40, justifyContent: 'center' },
  addressText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    lineHeight: 24,
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
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  btnLabel: {
    color: Colors.textOnPrimary,
    fontSize: 9,
    fontWeight: Typography.fontWeights.semibold,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ConvertGoogleScreen;
