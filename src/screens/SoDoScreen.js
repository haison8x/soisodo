import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FileText, Trash2, Map, Calendar, ChevronRight, Edit3, MapPin } from 'lucide-react-native';
import { toMapPoints } from '../utils/point';
import { useInterstitialAd } from '../hooks/useInterstitialAd';

const SoDoScreen = () => {
    const [projects, setProjects] = useState([]);
    const navigation = useNavigation();
    const { showAd } = useInterstitialAd();

    const loadProjects = useCallback(async () => {
        try {
            const projectsJson = await AsyncStorage.getItem('saved_projects');
            if (projectsJson) {
                setProjects(JSON.parse(projectsJson));
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProjects();
        }, [loadProjects])
    );

    const deleteProject = (id) => {
        Alert.alert(
            "Xóa dự án",
            "Bạn có chắc chắn muốn xóa dự án này không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const updatedProjects = projects.filter(p => p.id !== id);
                            await AsyncStorage.setItem('saved_projects', JSON.stringify(updatedProjects));
                            setProjects(updatedProjects);
                        } catch (error) {
                            console.error('Error deleting project:', error);
                        }
                    }
                }
            ]
        );
    };

    const viewProject = (project) => {
        const mapData = toMapPoints(project.title, project.cityValue, project.coordinates);
        showAd(() => {
            navigation.navigate('Trang chủ', {
                screen: 'Map',
                params: { mapData }
            });
        });
    };

    const handleEdit = (project) => {
        navigation.navigate('Trang chủ', { projectData: project });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const renderItem = ({ item }) => (
        <View style={styles.projectCard}>
            <View style={styles.cardHeader}>
                {/* Info area - Click to view map */}
                <TouchableOpacity
                    style={styles.titleInfoArea}
                    onPress={() => viewProject(item)}
                >
                    <View style={styles.iconBox}>
                        <FileText size={24} color="#007AFF" />
                    </View>
                    <View style={styles.titleInfo}>
                        <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
                        <View style={styles.addressRow}>
                            <MapPin size={12} color="#64748B" style={{ marginTop: 2, marginRight: 4 }} />
                            <Text style={styles.projectAddress} numberOfLines={2}>
                                {item.address || item.city}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Actions area - Independent touchables */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
                        <Edit3 size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteProject(item.id)} style={styles.deleteBtn}>
                        <Trash2 size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity onPress={() => viewProject(item)}>
                <View style={styles.cardFooter}>
                    <View style={styles.metaInfo}>
                        <Calendar size={14} color="#8E8E93" />
                        <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={styles.metaInfo}>
                        <Map size={14} color="#8E8E93" />
                        <Text style={styles.metaText}>{item.coordinates.length} điểm</Text>
                    </View>
                    <ChevronRight size={16} color="#C7C7CC" />
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sổ Đỏ Đã Lưu</Text>
                <Text style={styles.headerSubtitle}>Quản lý danh sách các thửa đất của bạn</Text>
            </View>

            {projects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <FileText size={64} color="#E5E7EB" />
                    <Text style={styles.emptyText}>Chưa có dự án nào được lưu</Text>
                    <Text style={styles.emptySubText}>Các thửa đất bạn lưu sẽ xuất hiện tại đây</Text>
                </View>
            ) : (
                <FlatList
                    data={projects}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 220,
    },
    projectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    titleInfo: {
        flex: 1,
    },
    titleInfoArea: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    projectTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1E293B',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    projectAddress: {
        fontSize: 13,
        color: '#64748B',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editBtn: {
        padding: 8,
        marginRight: 4,
    },
    deleteBtn: {
        padding: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    metaText: {
        fontSize: 12,
        color: '#8E8E93',
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default SoDoScreen;
