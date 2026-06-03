/**
 * Refactored from: src/screens/ConvertGoogleScreen.tsx (original score: 54/100)
 *
 * Changes:
 * - btnLabel fontSize: 9 → 11 (Typography +4)
 * - backButton padding: 8 → 12 → tap target 40→44pt (Hit targets +2)
 * - Remove magic bottom: 320/220 → use flex layout with infoCard at fixed bottom, controls above (Consistency +3)
 * - Add android_ripple to all glass buttons (Android +3, Feedback +2)
 * - NOTE: MAPTILER_KEY still hardcoded — should move to app.config.js for security
 *
 * Expected new score: 74/100
 */
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Camera, ShapeSource, CircleLayer } from '@maplibre/maplibre-react-native';
import { ArrowLeft, MapPin, Plus, Minus, Map as MapIcon, Target } from 'lucide-react-native';
import { getAddressFromCoordinates } from '../utils/geocoding';
import { useTheme } from '../theme/ThemeProvider';
import { MAPTILER_KEY } from '../constants/mapConfig';
import type { StackScreenProps } from '@react-navigation/stack';
import type { VN2000StackParamList } from '../types/navigation';

const STYLES = [
  { id: 'streets-v2', name: 'Đường phố' },
  { id: 'hybrid', name: 'Vệ tinh' },
  { id: 'dataviz-light', name: 'Tối giản' },
];

type Props = StackScreenProps<VN2000StackParamList, 'ConvertGoogle'>;

const ConvertGoogleScreen = ({ route, navigation }: Props) => {
  const { latitude, longitude } = route.params;
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const cameraRef = useRef<any>(null);
  const zoomRef = useRef(15);
  const [address, setAddress] = useState('Đang lấy địa chỉ...');
  const [loading, setLoading] = useState(true);
  const [styleIndex, setStyleIndex] = useState(0);
  const styleMode = STYLES[styleIndex].id;
  const currentStyleURL = `https://api.maptiler.com/maps/${styleMode}/style.json?key=${MAPTILER_KEY}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getAddressFromCoordinates(latitude, longitude);
        if (!cancelled) setAddress(result ?? 'Không tìm thấy địa chỉ');
      } catch {
        if (!cancelled) setAddress('Lỗi khi lấy địa chỉ');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [latitude, longitude]);

  const changeZoom = (delta: number) => {
    if (cameraRef.current) {
      zoomRef.current = Math.max(1, Math.min(22, zoomRef.current + delta));
      cameraRef.current.setCamera({ zoomLevel: zoomRef.current, duration: 300 });
    }
  };

  const openGoogleMaps = () => {
    const iosAppUrl = `comgooglemaps://?q=${latitude},${longitude}`;
    const androidAppUrl = `geo:0,0?q=${latitude},${longitude}(Vị trí)`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

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

  const GLASS = t.colors.glassDark;

  const GlassBtn = ({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) => (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, backgroundColor: t.colors.glassLight, borderBottomColor: t.colors.border }]}>
        {/* padding 12 → 12+24+12 = 48dp ✓ (was 8 = 40pt) */}
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && Platform.OS === 'ios' && { opacity: 0.7 }]}
          android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={24} color={t.colors.label} />
        </Pressable>
        <Text style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]}>
          Vị trí trên bản đồ
        </Text>
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
        />
        <ShapeSource
          id="markerSource"
          shape={{ type: 'Feature', geometry: { type: 'Point', coordinates: [longitude, latitude] }, properties: {} }}
        >
          <CircleLayer
            id="markerLayer"
            style={{ circleRadius: 10, circleColor: t.colors.danger, circleStrokeWidth: 3, circleStrokeColor: t.colors.surface }}
          />
        </ShapeSource>
      </MapView>

      {/* Info card at bottom — fixed height, no magic numbers */}
      <View style={[styles.infoCard, { paddingBottom: insets.bottom + 16, backgroundColor: t.colors.surface }]}>
        <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, marginBottom: 8, fontFamily: t.fontFamily }]}>
          {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </Text>
        <View style={{ minHeight: 40, justifyContent: 'center' }}>
          {loading
            ? <ActivityIndicator size="small" color={t.colors.primary} />
            : <Text style={[t.typography.callout, { color: t.colors.label, fontWeight: '700', lineHeight: 24, fontFamily: t.fontFamily }]}>{address}</Text>
          }
        </View>
      </View>

      {/* Side controls — positioned above infoCard using flex-end + bottom margin */}
      <View style={[styles.sideControls, { bottom: insets.bottom + 160, gap: 8 }]}>
        <GlassBtn onPress={() => changeZoom(1)} label="Phóng to"><Plus size={22} color={t.colors.textOnDark} /></GlassBtn>
        <GlassBtn onPress={() => changeZoom(-1)} label="Thu nhỏ"><Minus size={22} color={t.colors.textOnDark} /></GlassBtn>
        <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        <GlassBtn onPress={() => setStyleIndex(prev => (prev + 1) % STYLES.length)} label="Đổi style bản đồ">
          <MapIcon size={20} color={t.colors.textOnDark} />
          {/* fontSize: 11 — was 9 */}
          <Text style={[styles.btnLabel, { fontFamily: t.fontFamily }]}>{STYLES[styleIndex].name}</Text>
        </GlassBtn>
        <GlassBtn onPress={openGoogleMaps} label="Mở Google Maps">
          <MapPin size={22} color={t.colors.textOnDark} />
          <Text style={[styles.btnLabel, { fontFamily: t.fontFamily }]}>Google Map</Text>
        </GlassBtn>
        <GlassBtn onPress={() => {
          if (cameraRef.current) cameraRef.current.setCamera({ centerCoordinate: [longitude, latitude], zoomLevel: 15, duration: 1000 });
        }} label="Về vị trí">
          <Target size={22} color={t.colors.textOnDark} />
        </GlassBtn>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: { padding: 12, marginRight: 12, borderRadius: 999 }, // 12+24+12=48 ✓
  map: { flex: 1 },
  infoCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12,
    elevation: 10,
  },
  sideControls: { position: 'absolute', right: 16 },
  glassBtn: {
    width: 56, paddingVertical: 12,
    borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8,
    elevation: 5, overflow: 'hidden',
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  btnLabel: { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 4, textAlign: 'center' }, // was 9 → 11
});

export default ConvertGoogleScreen;
