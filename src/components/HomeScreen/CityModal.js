import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITIES } from '../../constants/mockDataHomeScreen';

const CityModal = ({
    visible,
    onClose,
    searchText,
    onSearchChange,
    onSelectCity,
    selectedCity
}) => {
    const filteredCities = CITIES.filter(c =>
        c.label.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Chọn Tỉnh/Thành</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={26} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#64748B" style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Tìm kiếm tỉnh thành..."
                            value={searchText}
                            onChangeText={onSearchChange}
                        />
                    </View>

                    <FlatList
                        data={filteredCities}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.cityItem}
                                onPress={() => onSelectCity(item)}
                            >
                                <Text style={[
                                    styles.cityItemText,
                                    selectedCity?.value === item.value && styles.cityItemTextSelected
                                ]}>
                                    {item.label}
                                </Text>
                                {selectedCity?.value === item.value && (
                                    <Ionicons name="checkmark" size={20} color="#007AFF" />
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 25,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 20,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginBottom: 15,
        height: 50,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
    },
    cityItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    cityItemText: {
        fontSize: 16,
        color: '#475569',
    },
    cityItemTextSelected: {
        color: '#007AFF',
        fontWeight: 'bold',
    },
});

export default CityModal;
