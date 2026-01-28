import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CitySelector = ({ selectedCity, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.citySelector}
            onPress={onPress}
        >
            <Text style={styles.cityText}>{selectedCity?.label || 'Chọn tỉnh/thành'}</Text>
            <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    citySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#F8FAFC',
    },
    cityText: {
        fontSize: 16,
        color: '#475569',
    },
});

export default CitySelector;
