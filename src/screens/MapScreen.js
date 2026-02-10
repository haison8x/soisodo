import React, { useEffect, useState, useMemo, useRef } from 'react';
import { View, StyleSheet, Text, Platform, TouchableOpacity, Animated, Linking } from 'react-native';
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
import { Layers, Target, Plus, Minus, Map as MapIcon, Share2, MapPin } from 'lucide-react-native';
import { Buffer } from 'buffer';

// MapTiler Configuration
const MAPTILER_KEY = '8DY7FmNFHpdvQiaVc2gb';

// Set MapLibre Connectivity
setConnected(true);

const STYLES = [
    { id: 'streets-v2', name: 'Đường phố', icon: <MapIcon size={20} color="#FFFFFF" /> },
    { id: 'hybrid', name: 'Vệ tinh', icon: <Layers size={20} color="#FFFFFF" /> },
    { id: 'dataviz-light', name: 'Tối giản', icon: <Target size={20} color="#FFFFFF" /> },
];

const MapScreen = () => {
    const route = useRoute();
    const mapData = route.params?.mapData;
    const cameraRef = useRef(null);

    const [location, setLocation] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [styleIndex, setStyleIndex] = useState(0); // Default to Streets-v2
    const styleMode = STYLES[styleIndex].id;

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
            setPermissionGranted(true);
            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);
        })();
    }, []);

    const { pointShape, lineShape } = useMemo(() => {
        if (!mapData || !mapData.wgs84Points || mapData.wgs84Points.length === 0)
            return { pointShape: null, lineShape: null };

        const coords = mapData.wgs84Points.map(p => [p.longitude, p.latitude]);

        const pShape = {
            type: 'FeatureCollection',
            features: coords.map(c => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: c },
                properties: {}
            }))
        };

        let lShape = null;
        if (coords.length >= 2) {
            const lineCoords = [...coords];
            if (coords.length > 2) lineCoords.push(coords[0]);
            lShape = {
                type: 'Feature',
                geometry: { type: 'LineString', coordinates: lineCoords },
                properties: {}
            };
        }

        return { pointShape: pShape, lineShape: lShape };
    }, [mapData]);

    const fitPolygon = (duration = 1500) => {
        if (cameraRef.current && mapData?.wgs84Points?.length > 0) {
            const lons = mapData.wgs84Points.map(p => p.longitude);
            const lats = mapData.wgs84Points.map(p => p.latitude);

            if (lons.length === 1) {
                cameraRef.current.setCamera({
                    centerCoordinate: [lons[0], lats[0]],
                    zoomLevel: 17,
                    duration
                });
            } else {
                cameraRef.current.setCamera({
                    bounds: {
                        ne: [Math.max(...lons), Math.max(...lats)],
                        sw: [Math.min(...lons), Math.min(...lats)],
                    },
                    padding: { top: 100, bottom: 100, left: 60, right: 60 },
                    duration
                });
            }
        }
    };

    const zoomRef = useRef(17);

    useEffect(() => {
        if (cameraRef.current && mapData?.wgs84Points?.length > 0) {
            setTimeout(() => fitPolygon(2000), 1000);
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

    const toggleStyle = () => {
        setStyleIndex((prev) => (prev + 1) % STYLES.length);
    };

    const openGeoJsonIO = () => {
        if (!lineShape && !pointShape) return;

        try {
            // Create a FeatureCollection for geojson.io
            const geojsonData = {
                type: 'FeatureCollection',
                features: []
            };

            if (lineShape && lineShape.geometry.coordinates.length >= 3) {
                // Chuyển LineString thành Polygon để hiển thị vùng đặc trên geojson.io
                geojsonData.features.push({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'Polygon',
                        coordinates: [lineShape.geometry.coordinates]
                    }
                });
            } else if (lineShape) {
                geojsonData.features.push(lineShape);
            }

            if (pointShape && pointShape.features) {
                geojsonData.features.push(...pointShape.features);
            }

            const jsonStr = JSON.stringify(geojsonData);
            const encodedData = encodeURIComponent(jsonStr);

            // Sử dụng định dạng JSON trực tiếp trong URL hash
            const url = `https://geojson.io/#data=data:application/json,${encodedData}`;
            Linking.openURL(url);
        } catch (error) {
            console.error('[MapScreen] Error opening geojson.io:', error);
        }
    };

    const openGoogleMaps = () => {
        if (!mapData?.wgs84Points || mapData.wgs84Points.length === 0) return;

        const lats = mapData.wgs84Points.map(p => p.latitude);
        const lons = mapData.wgs84Points.map(p => p.longitude);

        const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
        const centerLon = (Math.max(...lons) + Math.min(...lons)) / 2;

        const url = Platform.OS === 'ios'
            ? `maps://0,0?q=${centerLat},${centerLon}`
            : `geo:0,0?q=${centerLat},${centerLon}(${encodeURIComponent(mapData.name || 'Dự án')})`;

        // Fallback to web link if native scheme fails
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLon}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Linking.openURL(webUrl);
            }
        }).catch(() => Linking.openURL(webUrl));
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
                onDidFinishLoadingMap={() => {
                    console.log('[MapScreen] Style Loaded:', styleMode);
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

                {lineShape && (
                    <ShapeSource id="lineSource" shape={lineShape}>
                        <LineLayer
                            id="lineLayer"
                            style={{
                                lineColor: styleMode.includes('streets') ? '#007AFF' : '#FFD60A',
                                lineWidth: 4,
                                lineJoin: 'round',
                                lineCap: 'round',
                                lineOpacity: 0.9,
                            }}
                        />
                    </ShapeSource>
                )}
            </MapView>

            {/* Premium Info Header */}
            <View style={styles.headerContainer}>
                <View style={styles.glassInfo}>
                    <Text style={styles.infoTitle} numberOfLines={1}>
                        {mapData?.name || 'Vị trí dự án'}
                    </Text>
                    {firstPoint && (
                        <Text style={styles.infoCoords}>
                            {firstPoint.latitude.toFixed(6)}, {firstPoint.longitude.toFixed(6)}
                        </Text>
                    )}
                </View>
            </View>

            {/* Floating Controls */}
            <View style={styles.sideControls}>
                <TouchableOpacity style={styles.glassBtn} onPress={() => changeZoom(1)}>
                    <Plus size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassBtn} onPress={() => changeZoom(-1)}>
                    <Minus size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.glassBtn} onPress={toggleStyle}>
                    {STYLES[styleIndex].icon}
                    <Text style={styles.btnLabel}>{STYLES[styleIndex].name}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassBtn} onPress={openGeoJsonIO}>
                    <Share2 size={22} color="#FFFFFF" />
                    <Text style={styles.btnLabel}>GeoJSON</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassBtn} onPress={openGoogleMaps}>
                    <MapPin size={22} color="#FFFFFF" />
                    <Text style={styles.btnLabel}>Google Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassBtn} onPress={() => fitPolygon(1000)}>
                    <Target size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1C1C1E' },
    map: { flex: 1 },
    headerContainer: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    glassInfo: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    infoTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1C1C1E',
    },
    infoCoords: {
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    sideControls: {
        position: 'absolute',
        bottom: 100,
        right: 16,
        gap: 10,
    },
    glassBtn: {
        width: 56,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 122, 255, 0.9)', // iOS Blue
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    activeBtn: {
        height: 'auto',
        paddingHorizontal: 8,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 4,
    },
    btnLabel: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    }
});

export default MapScreen;
