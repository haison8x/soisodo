import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Linking
} from 'react-native';
import { ArrowRightLeft, Columns, Trash2, GripVertical, List, FileText, ChevronUp, ChevronDown } from 'lucide-react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';

const CoordinateEditModal = ({ visible, onClose, onSave, initialValue }) => {
    const [text, setText] = useState('');
    const [mode, setMode] = useState('text'); // 'text' | 'list'
    const [listData, setListData] = useState([]);

    useEffect(() => {
        if (visible) {
            setText(initialValue);
            setMode('text'); // Default to text mode on open
        }
    }, [visible, initialValue]);

    const parseTextToList = (rawText) => {
        return rawText.split('\n').map((line, index) => ({
            key: `item-${index}-${Date.now()}`,
            value: line
        }));
    };

    const joinListToText = (data) => {
        return data.map(item => item.value).join('\n');
    };

    const handleModeChange = (newMode) => {
        if (newMode === 'list') {
            setListData(parseTextToList(text));
        } else {
            setText(joinListToText(listData));
        }
        setMode(newMode);
    };

    const handleSave = () => {
        const finalContent = mode === 'list' ? joinListToText(listData) : text;
        onSave(finalContent);
        onClose();
    };

    // --- Text Mode Logic ---

    const parseNumbers = (input) => {
        return input.split(/[\s,]+/).filter(item => item.trim() !== '' && !isNaN(item));
    };

    const handleInterleave = () => {
        const numbers = parseNumbers(text);
        if (numbers.length === 0 || numbers.length % 2 !== 0) {
            alert('Số lượng số liệu phải là chẵn để thực hiện ghép cột.');
            return;
        }
        const mid = numbers.length / 2;
        const firstHalf = numbers.slice(0, mid);
        const secondHalf = numbers.slice(mid);
        let result = [];
        for (let i = 0; i < mid; i++) {
            result.push(`${firstHalf[i]}\t${secondHalf[i]}`);
        }
        setText(result.join('\n'));
    };

    const handleSwapPairs = () => {
        const numbers = parseNumbers(text);
        if (numbers.length === 0 || numbers.length % 2 !== 0) {
            alert('Số lượng số liệu phải là chẵn để đảo cặp.');
            return;
        }
        let result = [];
        for (let i = 0; i < numbers.length; i += 2) {
            result.push(`${numbers[i + 1]}\t${numbers[i]}`);
        }
        setText(result.join('\n'));
    };

    // --- List Mode Logic ---

    const renderItem = ({ item, drag, isActive, getIndex }) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    style={[
                        styles.rowItem,
                        isActive ? styles.activeRowItem : null
                    ]}
                >
                    <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
                        <GripVertical size={24} color="#94A3B8" />
                    </TouchableOpacity>

                    <TextInput
                        style={styles.rowInput}
                        value={item.value}
                        onChangeText={(val) => {
                            const newData = [...listData];
                            newData[getIndex()].value = val;
                            setListData(newData);
                        }}
                        placeholder="X  Y"
                        placeholderTextColor="#CBD5E1"
                    />

                    <View style={styles.moveButtonsGroup}>
                        <TouchableOpacity
                            onPress={() => {
                                const index = getIndex();
                                if (index > 0) {
                                    const newData = [...listData];
                                    const [removed] = newData.splice(index, 1);
                                    newData.splice(index - 1, 0, removed);
                                    setListData(newData);
                                }
                            }}
                            style={styles.moveActionButton}
                        >
                            <ChevronUp size={22} color="#64748B" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                const index = getIndex();
                                if (index < listData.length - 1) {
                                    const newData = [...listData];
                                    const [removed] = newData.splice(index, 1);
                                    newData.splice(index + 1, 0, removed);
                                    setListData(newData);
                                }
                            }}
                            style={styles.moveActionButton}
                        >
                            <ChevronDown size={22} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            const newData = [...listData];
                            newData.splice(getIndex(), 1);
                            setListData(newData);
                        }}
                        style={styles.deleteButton}
                    >
                        <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sửa Danh Sách Tọa Độ</Text>

                        {/* Mode Switcher */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, mode === 'text' && styles.activeTab]}
                                onPress={() => handleModeChange('text')}
                            >
                                <FileText size={18} color={mode === 'text' ? '#FFF' : '#64748B'} />
                                <Text style={[styles.tabText, mode === 'text' && styles.activeTabText]}>Văn bản</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, mode === 'list' && styles.activeTab]}
                                onPress={() => handleModeChange('list')}
                            >
                                <List size={18} color={mode === 'list' ? '#FFF' : '#64748B'} />
                                <Text style={[styles.tabText, mode === 'list' && styles.activeTabText]}>Danh sách</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Content Area */}
                        <View style={styles.contentArea}>
                            {mode === 'text' ? (
                                <>
                                    <TextInput
                                        style={styles.textInput}
                                        multiline
                                        value={text}
                                        onChangeText={setText}
                                        placeholder="1196048.346	601786.223"
                                        placeholderTextColor="#94A3B8"
                                        autoCorrect={false}
                                    />
                                    <Text style={styles.modalSubtitle}>Format: X [Xuống dòng] Y</Text>
                                </>
                            ) : (
                                <View style={styles.listContainer}>
                                    <DraggableFlatList
                                        data={listData}
                                        onDragEnd={({ data }) => setListData(data)}
                                        keyExtractor={(item) => item.key}
                                        renderItem={renderItem}
                                        containerStyle={{ flex: 1 }}
                                    />
                                    {listData.length === 0 && (
                                        <View style={styles.emptyListState}>
                                            <Text style={styles.emptyListText}>Danh sách trống</Text>
                                            <Text style={styles.emptyListSubText}>Chuyển sang "Văn bản" để paste dữ liệu.</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

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


                        <View style={styles.hintBox}>
                            <Text style={styles.hintText}>
                                <Text style={{ fontWeight: 'bold' }}>Mẹo: </Text>
                                Kết quả scan đôi khi không chính xác, bạn hãy chỉnh sửa bằng tay, hoặc bạn dùng Google Translate, hoặc AI (Gemini, ChatGPT, DeepSeek) để scan hình ảnh và copy đoạn text vào đây, độ chính xác sẽ rất cao.
                            </Text>
                        </View>
                        <View style={styles.footerLinks}>
                            <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/watch?v=fig3E44MFM4')}>
                                <Text style={styles.modalLink}>
                                    Xem hướng dẫn (YouTube)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
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
        height: '90%', // Fixed height for consistency
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        flex: 1, // Fill container
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    hintBox: {
        backgroundColor: '#F0F9FF',
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    hintText: {
        fontSize: 12,
        color: '#0369A1',
        lineHeight: 18,
    },
    contentArea: {
        flex: 1,
        marginBottom: 16,
    },

    // Tabs
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    activeTabText: {
        color: '#FFF',
    },

    // Text Mode Styles
    textInput: {
        flex: 1, // Take available space
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#1E293B',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        textAlignVertical: 'top',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 16,
    },
    toolsContainer: {
        marginBottom: 0, // Removed margin as it's inside flex content now
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    toolsTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
        marginBottom: 8,
    },
    toolsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    toolButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        gap: 6,
    },
    toolText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#334155',
    },
    toolsHint: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 8,
        fontStyle: 'italic',
    },

    // List Mode Styles
    listContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        height: 44,
    },
    activeRowItem: {
        backgroundColor: '#E0F2FE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    dragHandle: {
        padding: 6,
        marginRight: 2,
    },
    rowInput: {
        flex: 1,
        fontSize: 13,
        color: '#1E293B',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        paddingVertical: 2,
    },
    deleteButton: {
        padding: 6,
    },
    moveButtonsGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 4,
    },
    moveActionButton: {
        padding: 4,
    },
    emptyListState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyListText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 4,
    },
    emptyListSubText: {
        fontSize: 13,
        color: '#CBD5E1',
    },

    // Footer
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 16,
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
    modalSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        textAlign: 'center',
        marginBottom: 8,
    },
    footerLinks: {
        alignItems: 'center',
        marginTop: 4,
    },
    modalLink: {
        fontSize: 13,
        color: '#007AFF',
        textDecorationLine: 'underline',
    },
});

export default CoordinateEditModal;
