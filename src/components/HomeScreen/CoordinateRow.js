import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CoordinateRow = ({ index, x, y, onDelete, onChangeX, onChangeY, isNew = false }) => {
    return (
        <View style={styles.coordRow}>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>X{index + 1}</Text>
                <TextInput
                    style={styles.input}
                    value={x}
                    onChangeText={onChangeX}
                    placeholder={isNew ? "X" : ""}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Y{index + 1}</Text>
                <TextInput
                    style={styles.input}
                    value={y}
                    onChangeText={onChangeY}
                    placeholder={isNew ? "Y" : ""}
                    keyboardType="numeric"
                />
            </View>
            {isNew ? (
                <View style={styles.editIcon}>
                    <Ionicons name="create-outline" size={24} color="#CCC" />
                </View>
            ) : (
                <TouchableOpacity onPress={onDelete}>
                    <Ionicons name="trash-outline" size={24} color="#FF4D4D" />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    coordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 0.45,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginRight: 8,
        width: 25,
    },
    input: {
        flex: 1,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        fontSize: 14,
        color: '#1E293B',
        backgroundColor: '#FFF',
    },
    editIcon: {
        padding: 8,
    }
});

export default CoordinateRow;
