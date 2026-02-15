import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapView, Camera, ShapeSource, CircleLayer } from '@maplibre/maplibre-react-native';
import { ArrowLeft, MapPin, Plus, Minus, Layers, Map as MapIcon, Target } from 'lucide-react-native';
import { getAddressFromCoordinates } from '../utils/geocoding';

const MAPTILER_KEY = '8DY7FmNFHpdvQiaVc2gb';

const STYLES = [
    { id: 'streets-v2', name: 'Đường phố', icon: <MapIcon size={20} color="#FFFFFF" /> },
    { id: 'hybrid', name: 'Vệ tinh', icon: <Layers size={20} color="#FFFFFF" /> },
    { id: 'dataviz-light', name: 'Tối giản', icon: <Target size={20} color="#FFFFFF" /> },
];

const ConvertGoogleScreen = ({ route, navigation }) => {
    const { latitude, longitude } = route.params;
    const insets = useSafeAreaInsets();
    const cameraRef = useRef(null);
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
                setAddress(result || 'Không tìm thấy địa chỉ');
            } catch (error) {
                setAddress('Lỗi khi lấy địa chỉ');
            } finally {
                setLoading(false);
            }
        };

        fetchAddress();
    }, [latitude, longitude]);

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
        const url = Platform.OS === 'ios'
            ? `maps://0,0?q=${latitude},${longitude}`
            : `geo:0,0?q=${latitude},${longitude}(Vị trí)`;

        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Linking.openURL(webUrl);
            }
        }).catch(() => Linking.openURL(webUrl));
    };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ArrowLeft size={24} color="#1E293B" />
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
                    onCameraChanged={(e) => {
                        zoomRef.current = e.properties.zoomLevel;
                    }}
                />

                <ShapeSource
                    id="markerSource"
                    shape={{
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude],
                        },
                    }}
                >
                    <CircleLayer
                        id="markerLayer"
                        style={{
                            circleRadius: 10,
                            circleColor: '#EF4444',
                            circleStrokeWidth: 3,
                            circleStrokeColor: '#FFFFFF',
                        }}
                    />
                </ShapeSource>
            </MapView>

            {/* Floating Controls */}
            <View style={[styles.sideControls, { bottom: insets.bottom + 320 }]}>
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
                <TouchableOpacity style={styles.glassBtn} onPress={openGoogleMaps}>
                    <MapPin size={22} color="#FFFFFF" />
                    <Text style={styles.btnLabel}>Google Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.glassBtn} onPress={recenter}>
                    <Target size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <View style={[styles.infoCard, { paddingBottom: insets.bottom + 220 }]}>
                <Text style={styles.coordinatesText}>
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </Text>
                <View style={styles.addressContainer}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#0084FF" />
                    ) : (
                        <Text style={styles.addressText}>{address}</Text>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        padding: 8,
        marginRight: 16,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    map: {
        flex: 1,
    },
    markerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        padding: 20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    coordinatesText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    addressContainer: {
        minHeight: 40,
        justifyContent: 'center',
    },
    addressText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        lineHeight: 24,
    },
    sideControls: {
        position: 'absolute',
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

export default ConvertGoogleScreen;
