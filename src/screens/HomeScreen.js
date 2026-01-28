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

// Import sub-components
import Header from '../components/HomeScreen/Header';
import ProjectTitleInput from '../components/HomeScreen/ProjectTitleInput';
import CitySelector from '../components/HomeScreen/CitySelector';
import CityModal from '../components/HomeScreen/CityModal';
import CoordinateRow from '../components/HomeScreen/CoordinateRow';

// Import constants/mock data
import { CITIES, INITIAL_COORDINATES } from '../constants/mockDataHomeScreen';

const HomeScreen = () => {
    const [title, setTitle] = useState('Nhà Tôi');
    const [selectedCity, setSelectedCity] = useState(CITIES.find(c => c.label === "Hồ Chí Minh"));
    const [modalVisible, setModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [coordinates, setCoordinates] = useState(INITIAL_COORDINATES);

    const [newX, setNewX] = useState('');
    const [newY, setNewY] = useState('');

    const deleteCoordinate = (id) => {
        setCoordinates(coordinates.filter(coord => coord.id !== id));
    };

    const addCoordinate = () => {
        if (newX && newY) {
            const newId = coordinates.length > 0 ? Math.max(...coordinates.map(c => c.id)) + 1 : 1;
            setCoordinates([...coordinates, { id: newId, x: newX, y: newY }]);
            setNewX('');
            setNewY('');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Home" />

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
                        <TouchableOpacity style={styles.scanButton}>
                            <Text style={styles.scanButtonText}>Scan</Text>
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
                        <TouchableOpacity style={[styles.button, styles.blueButton]}>
                            <Text style={styles.buttonText}>Sửa X&Y</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.blueButton]}>
                            <Text style={styles.buttonText}>Import Google</Text>
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
        marginBottom: 20,
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
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    }
});

export default HomeScreen;
