import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { nanoid } from 'nanoid/non-secure';

// Import sub-components
import ProjectTitleInput from '../components/HomeScreen/ProjectTitleInput';
import CitySelector from '../components/HomeScreen/CitySelector';
import CityModal from '../components/HomeScreen/CityModal';
import CoordinateRow from '../components/HomeScreen/CoordinateRow';
import CoordinateEditModal from '../components/HomeScreen/CoordinateEditModal';
import SaveProjectModal from '../components/HomeScreen/SaveProjectModal';

// Import constants/mock data
import { CITIES, INITIAL_COORDINATES } from '../constants/mockDataHomeScreen';

// Import utils
import { pickImageAndSave, exrtactTextFromImage } from '../utils/imageUtils';
import { toMapPoints } from '../utils/point';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getAddressFromCoordinates } from '../utils/geocoding';

const HomeScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [title, setTitle] = useState('Nhà Tôi');
    const [selectedCity, setSelectedCity] = useState(CITIES.find(c => c.label === "Hồ Chí Minh"));
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editText, setEditText] = useState('');
    const [searchText, setSearchText] = useState('');
    const [coordinates, setCoordinates] = useState(INITIAL_COORDINATES);
    const [isScanning, setIsScanning] = useState(false);
    const [saveModalVisible, setSaveModalVisible] = useState(false);

    const [newX, setNewX] = useState('');
    const [newY, setNewY] = useState('');

    useEffect(() => {
        if (route.params?.projectData) {
            const { title, cityValue, coordinates } = route.params.projectData;

            if (title) setTitle(title);

            if (cityValue) {
                const cityObj = CITIES.find(c => c.value === cityValue);
                if (cityObj) setSelectedCity(cityObj);
            }

            if (coordinates && Array.isArray(coordinates)) {
                setCoordinates(coordinates);
            }

            // Xóa params sau khi đã load để tránh lặp lại khi quay lại màn hình
            navigation.setParams({ projectData: undefined });
        }
    }, [route.params?.projectData]);

    const handleScan = async () => {
        setIsScanning(true);
        const savedUri = await pickImageAndSave();
        const text = await exrtactTextFromImage(savedUri);
        setIsScanning(false);

        if (text) {
            setEditText(text);
            setEditModalVisible(true);
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

    const formatCoordinatesForEdit = () => {
        return coordinates.map(c => `${c.x}\t${c.y}`).join('\n');
    };

    const handleSaveEdit = (text) => {
        if (!text.trim()) {
            setCoordinates([]);
            return;
        }

        // Split by any whitespace (spaces, tabs, newlines) and filter out empty strings
        const tokens = text.trim().split(/\s+/).filter(t => t !== '');

        const newCoordinates = [];
        for (let i = 0; i < tokens.length - 1; i += 2) {
            newCoordinates.push({
                id: nanoid(),
                x: tokens[i],
                y: tokens[i + 1]
            });
        }

        if (newCoordinates.length > 0) {
            setCoordinates(newCoordinates);
        }
    };

    const swapXY = () => {
        // Swap existing coordinates in the list
        setCoordinates(prev => prev.map(coord => ({
            ...coord,
            x: coord.y,
            y: coord.x
        })));

        // Also swap the values in the "New Coordinate" input fields
        const tempX = newX;
        setNewX(newY);
        setNewY(tempX);
    };

    const handleViewMap = () => {
        if (coordinates.length > 0) {
            const mapData = toMapPoints(title, selectedCity.value, coordinates);
            navigation.navigate('Map', { mapData });
        }
    };

    const handleSaveProject = async (saveTitle) => {
        try {
            // Convert coordinates to WGS84 to get the address
            let address = '';
            if (coordinates.length > 0) {
                const mapData = toMapPoints(title, selectedCity.value, coordinates);
                if (mapData?.wgs84Points && mapData.wgs84Points.length > 0) {
                    const firstPoint = mapData.wgs84Points[0];
                    address = await getAddressFromCoordinates(firstPoint.latitude, firstPoint.longitude);
                }
            }

            const existingProjectsJson = await AsyncStorage.getItem('saved_projects');
            let existingProjects = existingProjectsJson ? JSON.parse(existingProjectsJson) : [];

            const existingIndex = existingProjects.findIndex(p => p.title.toLowerCase() === saveTitle.toLowerCase());

            const saveData = (isOverwrite = false) => {
                const projectData = {
                    id: isOverwrite ? existingProjects[existingIndex].id : nanoid(),
                    title: saveTitle,
                    city: selectedCity.label,
                    cityValue: selectedCity.value,
                    coordinates: coordinates,
                    address: address, // Saved address
                    createdAt: isOverwrite ? existingProjects[existingIndex].createdAt : new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                let updatedProjects;
                if (isOverwrite) {
                    updatedProjects = [...existingProjects];
                    updatedProjects[existingIndex] = projectData;
                } else {
                    updatedProjects = [projectData, ...existingProjects];
                }

                AsyncStorage.setItem('saved_projects', JSON.stringify(updatedProjects))
                    .then(() => alert('Đã lưu dự án thành công!'))
                    .catch(e => console.error(e));
            };

            if (existingIndex !== -1) {
                Alert.alert(
                    "Trùng tên dự án",
                    `Dự án "${saveTitle}" đã tồn tại. Bạn có muốn ghi đè không?`,
                    [
                        { text: "Hủy", style: "cancel" },
                        { text: "Ghi đè", onPress: () => saveData(true) }
                    ]
                );
            } else {
                saveData(false);
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Lỗi khi lưu dự án');
        }
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

                    <CoordinateEditModal
                        visible={editModalVisible}
                        onClose={() => setEditModalVisible(false)}
                        onSave={handleSaveEdit}
                        initialValue={editText}
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
                        <TouchableOpacity
                            style={[styles.button, styles.blueButton]}
                            onPress={() => {
                                setEditText(formatCoordinatesForEdit());
                                setEditModalVisible(true);
                            }}
                        >
                            <Text style={styles.buttonText}>Sửa X&Y</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.orangeButton]}
                            onPress={swapXY}
                        >
                            <Text style={styles.buttonText}>Swap X&Y</Text>
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
                        <TouchableOpacity
                            style={[styles.button, styles.blueButton]}
                            onPress={handleViewMap}
                        >
                            <Text style={styles.buttonText}>Xem Bản Đồ</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.fullWidthButton, styles.greenButton, { marginTop: 5 }]}
                        onPress={() => setSaveModalVisible(true)}
                    >
                        <Text style={styles.buttonText}>Lưu Lại</Text>
                    </TouchableOpacity>

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
    greenButton: {
        backgroundColor: '#34C759',
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
