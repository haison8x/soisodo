import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import MapView, { Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MapScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { mapData } = route.params || {};

    const [region, setRegion] = useState(null);

    useEffect(() => {
        if (mapData && mapData.googlePoints && mapData.googlePoints.length > 0) {
            // Calculate center point for region
            const lats = mapData.googlePoints.map(p => p.latitude);
            const lngs = mapData.googlePoints.map(p => p.longitude);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            setRegion({
                latitude: (minLat + maxLat) / 2,
                longitude: (minLng + maxLng) / 2,
                latitudeDelta: (maxLat - minLat) * 2 || 0.005,
                longitudeDelta: (maxLng - minLng) * 2 || 0.005,
            });
        }
    }, [mapData]);

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
                region={region}
                mapType="hybrid"
                showsUserLocation={true}
            >
                {mapData && mapData.googlePoints && (
                    <Polygon
                        coordinates={mapData.googlePoints}
                        fillColor="rgba(0, 122, 255, 0.3)"
                        strokeColor="#007AFF"
                        strokeWidth={2}
                    />
                )}
            </MapView>

            <SafeAreaView style={styles.header} pointerEvents="box-none">
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <ChevronLeft color="#000" size={24} />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={1}>
                        {mapData?.name || 'Bản Đồ'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {mapData?.province?.replace('EPSG:_', '').replace(/-/g, ' ')}
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    backButton: {
        width: 40,
        height: 40,
        backgroundColor: '#FFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    titleContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginHorizontal: 15,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    subtitle: {
        fontSize: 12,
        color: '#64748B',
    }
});

export default MapScreen;
