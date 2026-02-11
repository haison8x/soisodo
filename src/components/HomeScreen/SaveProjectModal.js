import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { SavedDataIcon, MapPin, X } from 'lucide-react-native';

const SaveProjectModal = ({ visible, onClose, onSave, initialTitle, initialCity }) => {
    const [title, setTitle] = useState(initialTitle || '');

    useEffect(() => {
        setTitle(initialTitle);
    }, [initialTitle, visible]);

    const handleSave = () => {
        if (title.trim()) {
            onSave(title);
            onClose();
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={styles.modalContent}
                        >
                            <View style={styles.header}>
                                <Text style={styles.headerTitle}>Lưu Dự Án</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                    <X size={20} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.body}>
                                <View style={styles.cityInfoBox}>
                                    <MapPin size={16} color="#64748B" />
                                    <Text style={styles.cityLabel}>Thành phố: </Text>
                                    <Text style={styles.cityName}>{initialCity}</Text>
                                </View>

                                <Text style={styles.label}>Tên dự án</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên dự án..."
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholderTextColor="#94A3B8"
                                    autoFocus={true}
                                />

                                <TouchableOpacity
                                    style={[styles.saveBtn, !title.trim() && styles.disabledBtn]}
                                    onPress={handleSave}
                                    disabled={!title.trim()}
                                >
                                    <Text style={styles.saveBtnText}>Lưu Lại</Text>
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    closeBtn: {
        padding: 4,
    },
    body: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
        marginTop: 18,
    },
    cityInfoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cityLabel: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 8,
    },
    cityName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1E293B',
    },
    saveBtn: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    disabledBtn: {
        backgroundColor: '#CBD5E1',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default SaveProjectModal;
