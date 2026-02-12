import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Compass, Info, MapPin, ChevronDown, Check, X, Search } from 'lucide-react-native';
import { proj4Dict, convertVN2000ToWGS84 } from '../utils/point';
import { useNavigation } from '@react-navigation/native';

const VN2000Screen = () => {
    const navigation = useNavigation();
    const [xCoord, setXCoord] = useState('1199306.130');
    const [yCoord, setYCoord] = useState('596566.070');
    const [selectedProvince, setSelectedProvince] = useState({ "key": "EPSG:_TP-Hồ-Chí-Minh", "label": "TP Hồ Chí Minh" });
    const [result, setResult] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const provinces = useMemo(() => {
        return Object.keys(proj4Dict).map(key => ({
            key,
            label: key.replace('EPSG:_', '').replace(/-/g, ' ')
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, []);

    const filteredProvinces = useMemo(() => {
        if (!searchQuery) return provinces;
        return provinces.filter(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [provinces, searchQuery]);

    const handleConvert = () => {
        if (!xCoord || !yCoord) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tọa độ X và Y');
            return;
        }
        if (!selectedProvince) {
            Alert.alert('Thiếu thông tin', 'Vui lòng chọn Tỉnh/Thành phố');
            return;
        }

        const converted = convertVN2000ToWGS84(xCoord, yCoord, selectedProvince.key);

        if (converted) {
            setResult(converted);
        } else {
            Alert.alert('Lỗi', 'Không thể chuyển đổi tọa độ. Vui lòng kiểm tra lại số liệu.');
        }
    };

    const handleViewOnMap = () => {
        if (result) {
            navigation.navigate('ConvertGoogle', {
                latitude: result.latitude,
                longitude: result.longitude
            });
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chuyển Đổi VN2000</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.content}>
                    {/* Input Section */}
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Nhập tọa độ VN2000</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Tỉnh / Thành phố (*)</Text>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setModalVisible(true)}
                            >
                                <Text style={[styles.dropdownText, !selectedProvince && styles.placeholderText]}>
                                    {selectedProvince ? selectedProvince.label : 'Chọn Tỉnh / Thành phố'}
                                </Text>
                                <ChevronDown size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Tọa độ X (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ví dụ: 1199306.130"
                                    keyboardType="numeric"
                                    value={xCoord}
                                    onChangeText={setXCoord}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                                <Text style={styles.label}>Tọa độ Y (m)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ví dụ: 596566.070"
                                    keyboardType="numeric"
                                    value={yCoord}
                                    onChangeText={setYCoord}
                                    placeholderTextColor="#94A3B8"
                                />
                            </View>
                        </View>

                        <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
                            <Compass size={20} color="#FFF" />
                            <Text style={styles.convertButtonText}>Chuyển đổi sang WGS84</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Result Section */}
                    {result && (
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Kết quả</Text>
                            <View style={styles.resultRow}>
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Vĩ độ (Lat)</Text>
                                    <Text style={styles.resultValue}>{result.latitude.toFixed(6)}</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.resultItem}>
                                    <Text style={styles.resultLabel}>Kinh độ (Long)</Text>
                                    <Text style={styles.resultValue}>{result.longitude.toFixed(6)}</Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.mapButton} onPress={handleViewOnMap}>
                                <MapPin size={20} color="#FFF" />
                                <Text style={styles.mapButtonText}>Xem trên Maps</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={[styles.card, styles.hintCard]}>
                        <View style={styles.hintHeader}>
                            <Info size={20} color="#0369A1" />
                            <Text style={styles.hintTitle}>Lưu ý</Text>
                        </View>
                        <Text style={styles.hintDescription}>
                            Chọn đúng Tỉnh/Thành phố để có kết quả chính xác nhất. Hệ tọa độ VN2000 sử dụng kinh tuyến trục địa phương khác nhau cho từng tỉnh.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Province Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn Tỉnh / Thành phố</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#1E293B" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <Search size={20} color="#94A3B8" style={{ marginRight: 8 }} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus={false}
                            />
                        </View>

                        <FlatList
                            data={filteredProvinces}
                            keyExtractor={item => item.key}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.provinceItem}
                                    onPress={() => {
                                        console.log(item);
                                        setSelectedProvince(item);
                                        setModalVisible(false);
                                        setSearchQuery('');
                                    }}
                                >
                                    <Text style={[
                                        styles.provinceText,
                                        selectedProvince?.key === item.key && styles.selectedProvinceText
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {selectedProvince?.key === item.key && (
                                        <Check size={20} color="#0084FF" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    content: {
        padding: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdown: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    dropdownText: {
        fontSize: 16,
        color: '#1E293B',
    },
    placeholderText: {
        color: '#94A3B8',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    convertButton: {
        backgroundColor: '#0084FF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
        gap: 8,
    },
    convertButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    resultRow: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    resultItem: {
        flex: 1,
        alignItems: 'center',
    },
    divider: {
        width: 1,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 10,
    },
    resultLabel: {
        fontSize: 12,
        color: '#64748B',
        marginBottom: 4,
    },
    resultValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    mapButton: {
        backgroundColor: '#34C759', // Green color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    mapButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
    hintCard: {
        backgroundColor: '#F0F9FF',
        borderColor: '#BAE6FD',
        borderWidth: 1,
    },
    hintHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    hintTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0369A1',
    },
    hintDescription: {
        fontSize: 14,
        color: '#0369A1',
        lineHeight: 20,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
    },
    searchContainer: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        padding: 0,
    },
    provinceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    provinceText: {
        fontSize: 16,
        color: '#334155',
    },
    selectedProvinceText: {
        color: '#0084FF',
        fontWeight: '700',
    },
});

export default VN2000Screen;
