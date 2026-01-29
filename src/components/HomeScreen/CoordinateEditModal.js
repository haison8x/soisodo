import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Linking
} from 'react-native';

const CoordinateEditModal = ({ visible, onClose, onSave, initialValue }) => {
    const [text, setText] = useState('');

    useEffect(() => {
        if (visible) {
            setText(initialValue);
        }
    }, [visible, initialValue]);

    const handleSave = () => {
        onSave(text);
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.container}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Sửa Danh Sách Tọa Độ</Text>

                            <TextInput
                                style={styles.textInput}
                                multiline
                                value={text}
                                onChangeText={setText}
                                placeholder="1196048.346	601786.223"
                                placeholderTextColor="#94A3B8"
                                autoCorrect={false}
                            />

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={onClose}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton]}
                                    onPress={handleSave}
                                >
                                    <Text style={styles.saveButtonText}>Cập Nhật</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>Format: X [Tab] Y [Xuống dòng] hoặc X [Xuống dòng] Y</Text>

                            <Text style={styles.modalHint}>
                                Kết quả scan đôi khi không chính xác, bạn hãy chỉnh sửa bằng tay, hoặc bạn dùng Google Translate, hoặc AI(Gemini, ChatGpt, DeepSeek) để scan hình ảnh và copy đoạn text vào đây, độ chính xác sẽ rất cao.
                            </Text>

                            <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/watch?v=fig3E44MFM4')}>
                                <Text style={styles.modalLink}>
                                    Bạn có thể xem hướng dẫn ở đây: https://www.youtube.com/watch?v=fig3E44MFM4
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
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
    container: {
        width: '100%',
        maxWidth: 500,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
        textAlign: 'center',
        fontWeight: '600',
    },
    modalHint: {
        fontSize: 13,
        color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 8,
    },
    modalLink: {
        fontSize: 13,
        color: '#007AFF',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    textInput: {
        height: 300,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#1E293B',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlignVertical: 'top',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    button: {
        flex: 0.47,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
    },
    cancelButtonText: {
        color: '#64748B',
        fontSize: 15,
        fontWeight: '700',
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
});

export default CoordinateEditModal;
