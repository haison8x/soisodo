import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { nanoid } from 'nanoid';

// Import sub-components
import ProjectTitleInput from '../components/HomeScreen/ProjectTitleInput';
import CitySelector from '../components/HomeScreen/CitySelector';
import CityModal from '../components/HomeScreen/CityModal';
import CoordinateRow from '../components/HomeScreen/CoordinateRow';

// Import constants/mock data
import { CITIES, INITIAL_COORDINATES } from '../constants/mockDataHomeScreen';

// Import utils
import { pickImageAndSave, extractCoordinatesFromImage } from '../utils/imageUtils';

const HomeScreen = () => {
    const [title, setTitle] = useState('Nhà Tôi');
    const [selectedCity, setSelectedCity] = useState(CITIES.find(c => c.label === "Hồ Chí Minh"));
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [coordinates, setCoordinates] = useState(INITIAL_COORDINATES);
    const [isScanning, setIsScanning] = useState(false);

    const [newX, setNewX] = useState('');
    const [newY, setNewY] = useState('');

    const handleScan = async () => {
        setIsScanning(true);
        const savedUri = await pickImageAndSave();
        const scannedCoordinates = await extractCoordinatesFromImage(savedUri);
        setIsScanning(false);

        if (scannedCoordinates) {
            setCoordinates(scannedCoordinates);
            console.log('Scanned coordinates:', scannedCoordinates);
        }
    };

    const deleteCoordinate = (id) => {
        setCoordinates(coordinates.filter(coord => coord.id !== id));
    };

    const addCoordinate = () => {
        if (newX && newY) {
            setCoordinates([...coordinates, { id: nanoid(), x: newX, y: newY }]);
            setNewX('');
            setNewY('');
        }
    };

    const swapXY = () => {
        setCoordinates(prev => prev.map(coord => ({
            ...coord,
            x: coord.y,
            y: coord.x
        })));
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
                    <ProjectTitleInput value={title} onChangeText={setTitle} />

                    <CitySelector
                        selectedCity={selectedCity}
                        onPress={() => setModalVisible(true)}
                    />

                    <CityModal
                        visible={modalVisible}
                        onClose={() => setModalVisible(false)}
                        searchText={searchText}
                        onSearchChange={setSearchText}
                        onSelectCity={(item) => {
                            setSelectedCity(item);
                            setModalVisible(false);
                            setSearchText('');
                        }}
                        selectedCity={selectedCity}
                    />

                    {/* Scan Row */}
                    <View style={styles.scanRow}>
                        <Text style={styles.scanText}>Nhập tọa độ hoặc</Text>
                        <TouchableOpacity
                            style={[styles.scanButton, isScanning && { opacity: 0.6 }]}
                            onPress={handleScan}
                            disabled={isScanning}
                        >
                            <Text style={styles.scanButtonText}>
                                {isScanning ? 'Đang xử lý...' : 'Scan'}
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.scanText}>từ bộ sưu tập ảnh</Text>
                    </View>

                    {/* Import Google Row */}
                    <TouchableOpacity style={[styles.fullWidthButton, styles.secondaryButton, { marginBottom: 20 }]}>
                        <Text style={styles.secondaryButtonText}>Import Google</Text>
                    </TouchableOpacity>

                    {/* Coordinates List */}
                    {coordinates.map((coord, index) => (
                        <CoordinateRow
                            key={coord.id}
                            index={index}
                            x={coord.x}
                            y={coord.y}
                            onDelete={() => deleteCoordinate(coord.id)}
                        />
                    ))}

                    {/* Action Buttons Row 1 */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.button, styles.blueButton]}>
                            <Text style={styles.buttonText}>Sửa X&Y</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.orangeButton]}
                            onPress={swapXY}
                        >
                            <Text style={styles.buttonText}>Swap X & Y</Text>
                        </TouchableOpacity>
                    </View>

                    {/* New Coordinate Row */}
                    <CoordinateRow
                        index={coordinates.length}
                        x={newX}
                        y={newY}
                        onChangeX={setNewX}
                        onChangeY={setNewY}
                        isNew={true}
                    />

                    {/* Final Action Buttons */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.blueButton]}
                            onPress={addCoordinate}
                        >
                            <Text style={styles.buttonText}>Thêm Tọa Độ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.blueButton]}>
                            <Text style={styles.buttonText}>Xem Bản Đồ</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scanRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#F1F5F9',
        padding: 10,
        borderRadius: 10,
    },
    scanText: {
        fontSize: 14,
        color: '#64748B',
    },
    scanButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 8,
        marginHorizontal: 10,
        elevation: 2,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    scanButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    fullWidthButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    secondaryButton: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    secondaryButtonText: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '700',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,
    },
    button: {
        flex: 0.48,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    blueButton: {
        backgroundColor: '#007AFF',
    },
    orangeButton: {
        backgroundColor: '#F97316',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    }
});


export default HomeScreen;
