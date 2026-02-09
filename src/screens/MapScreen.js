import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity } from 'react-native';
import MapLibre, {
    MapView,
    Camera,
    ShapeSource,
    CircleLayer,
    LineLayer,
    UserLocation,
    setConnected
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import { Layers, Target, Plus, Minus } from 'lucide-react-native';

// MapTiler Configuration
const MAPTILER_KEY = '8DY7FmNFHpdvQiaVc2gb';

// Set MapLibre Connectivity
setConnected(true);

const MapScreen = () => {
    const route = useRoute();
    const mapData = route.params?.mapData;
    const cameraRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [styleMode, setStyleMode] = useState('hybrid');

    useEffect(() => {
        if (mapData) {
            console.log('[MapScreen] Received mapData Points count:', mapData.wgs84Points?.length);
            if (mapData.wgs84Points?.[0]) {
                const p = mapData.wgs84Points[0];
                console.log('[MapScreen] First point (Lon/Lat):', p.longitude, p.latitude);
            }
        }
    }, [mapData]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            setPermissionGranted(true);
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        })();
    }, []);

    // Split shapes into Points and Lines to ensure single point rendering
    const { pointShape, lineShape } = useMemo(() => {
        if (!mapData || !mapData.wgs84Points || mapData.wgs84Points.length === 0)
            return { pointShape: null, lineShape: null };

        const coords = mapData.wgs84Points.map(p => [p.longitude, p.latitude]);

        // 1. Points Collection
        const pShape = {
            type: 'FeatureCollection',
            features: coords.map(c => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: c },
                properties: {}
            }))
        };

        // 2. Line/Polygon Shape (needs at least 2 points)
        let lShape = null;
        if (coords.length >= 2) {
            const lineCoords = [...coords];
            if (coords.length > 2) lineCoords.push(coords[0]); // Close polygon
            lShape = {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: lineCoords },
                properties: {}
            };
        }

        return { pointShape: pShape, lineShape: lShape };
    }, [mapData]);

    const fitPolygon = () => {
        if (cameraRef.current && mapData?.wgs84Points?.length > 0) {
            const lons = mapData.wgs84Points.map(p => p.longitude);
            const lats = mapData.wgs84Points.map(p => p.latitude);

            console.log('[MapScreen] fitPolygon - Range:', Math.min(...lons), Math.max(...lons), Math.min(...lats), Math.max(...lats));

            if (lons.length === 1) {
                cameraRef.current.setCamera({
                    centerCoordinate: [lons[0], lats[0]],
                    zoomLevel: 18,
                    duration: 1500
                });
            } else {
                cameraRef.current.setCamera({
                    bounds: {
                        ne: [Math.max(...lons), Math.max(...lats)],
                        sw: [Math.min(...lons), Math.min(...lats)],
                    },
                    padding: { top: 80, bottom: 80, left: 80, right: 80 },
                    duration: 1500
                });
            }
        }
    };

    const zoomRef = useRef(18);

    useEffect(() => {
        if (cameraRef.current && mapData?.wgs84Points?.length > 0) {
            console.log('[MapScreen] Triggering fitPolygon via useEffect');
            setTimeout(() => fitPolygon(), 800);
        }
    }, [mapData]);

    const changeZoom = (delta) => {
        if (cameraRef.current) {
            zoomRef.current = Math.max(1, Math.min(22, zoomRef.current + delta));
            cameraRef.current.setCamera({
                zoomLevel: zoomRef.current,
                duration: 300,
            });
        }
    };

    const firstPoint = mapData?.wgs84Points?.[0];

    const currentStyleURL = useMemo(() => {
        // MapTiler style URL
        return `https://api.maptiler.com/maps/${styleMode}/style.json?key=${MAPTILER_KEY}`;
    }, [styleMode]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                logoEnabled={true}
                attributionEnabled={true}
                mapStyle={currentStyleURL}
                onDidFinishLoadingMap={() => {
                    console.log('[MapScreen] Map style loaded successfully:', styleMode);
                    fitPolygon();
                }}
                onDidFailLoadingMap={(err) => {
                    console.error('[MapScreen] Map load error:', err);
                }}
            >
                <Camera
                    ref={cameraRef}
                    defaultSettings={{
                        centerCoordinate: firstPoint ? [firstPoint.longitude, firstPoint.latitude] : [106.660172, 10.762622],
                        zoomLevel: 17,
                    }}
                    onCameraChanged={(e) => {
                        zoomRef.current = e.properties.zoomLevel;
                    }}
                />

                {permissionGranted && location && (
                    <UserLocation visible={true} animated={true} />
                )}

                {/* Render Red Dots always */}
                {pointShape && (
                    <ShapeSource id="pointsSource" shape={pointShape}>
                        <CircleLayer
                            id="circleLayer"
                            style={{
                                circleRadius: 6,
                                circleColor: '#FF3B30',
                                circleStrokeWidth: 2,
                                circleStrokeColor: '#FFFFFF',
                            }}
                        />
                    </ShapeSource>
                )}

                {/* Render Lines if valid */}
                {lineShape && (
                    <ShapeSource id="lineSource" shape={lineShape}>
                        <LineLayer
                            id="lineLayer"
                            style={{
                                lineColor: styleMode.includes('satellite') || styleMode.includes('hybrid') ? '#FFFF00' : '#007AFF',
                                lineWidth: 3,
                                lineJoin: 'round',
                                lineCap: 'round',
                            }}
                        />
                    </ShapeSource>
                )}
            </MapView>

            {/* Project Info Header */}
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle} numberOfLines={1}>Dự án: {mapData?.name || 'Nhà Tôi'}</Text>
                {firstPoint && (
                    <Text style={styles.infoCoords}>
                        Tọa độ: {firstPoint.latitude.toFixed(6)}, {firstPoint.longitude.toFixed(6)}
                    </Text>
                )}
            </View>

            {/* Controls Panel */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlBtn} onPress={() => changeZoom(1)}>
                    <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn} onPress={() => changeZoom(-1)}>
                    <Minus size={24} color="#FFFFFF" strokeWidth={2.5} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.controlBtn}
                    onPress={() => setStyleMode(prev => prev === 'streets-v2' ? 'hybrid' : 'streets-v2')}
                >
                    <Layers size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlBtn} onPress={fitPolygon}>
                    <Target size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    map: { flex: 1 },
    infoBox: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 15,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    infoTitle: { fontSize: 16, fontWeight: '800', color: '#1C1C1E' },
    infoCoords: { fontSize: 13, color: '#48484A', marginTop: 4, fontWeight: '500' },
    controls: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        gap: 12,
        zIndex: 100,
    },
    controlBtn: {
        width: 54,
        height: 54,
        backgroundColor: '#007AFF',
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 10,
    },
});

export default MapScreen;
