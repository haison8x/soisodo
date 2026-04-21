import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FileText, Trash2, Map, Calendar, ChevronRight, Edit3, MapPin } from 'lucide-react-native';
import { toMapPoints } from '../utils/point';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { Colors, Spacing, Typography, Radius, Shadows } from '../theme';
import type { Project } from '../types';

const SoDoScreen = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigation = useNavigation();
  const { showAd } = useInterstitialAd();
  const tabBarHeight = useBottomTabBarHeight();

  const loadProjects = useCallback(async () => {
    try {
      const projectsJson = await AsyncStorage.getItem('saved_projects');
      if (projectsJson) setProjects(JSON.parse(projectsJson) as Project[]);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [loadProjects]),
  );

  const deleteProject = (id: string) => {
    Alert.alert('Xóa dự án', 'Bạn có chắc chắn muốn xóa dự án này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const updatedProjects = projects.filter(p => p.id !== id);
            await AsyncStorage.setItem('saved_projects', JSON.stringify(updatedProjects));
            setProjects(updatedProjects);
          } catch (error) {
            console.error('Error deleting project:', error);
          }
        },
      },
    ]);
  };

  const viewProject = (project: Project) => {
    const mapData = toMapPoints(project.title, project.cityValue, project.coordinates);
    showAd(() => {
      navigation.navigate('Trang chủ' as never, {
        screen: 'Map',
        params: { mapData },
      } as never);
    });
  };

  const handleEdit = (project: Project) => {
    navigation.navigate('Trang chủ' as never, { projectData: project } as never);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const renderItem = ({ item }: { item: Project }) => (
    <View style={styles.projectCard}>
      <View style={styles.cardHeader}>
        <TouchableOpacity style={styles.titleInfoArea} onPress={() => viewProject(item)}>
          <View style={styles.iconBox}>
            <FileText size={24} color={Colors.primary} />
          </View>
          <View style={styles.titleInfo}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={12} color={Colors.textSecondary} style={{ marginTop: 2, marginRight: 4 }} />
              <Text style={styles.projectAddress} numberOfLines={2}>
                {item.address || item.city}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editBtn}>
            <Edit3 size={20} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteProject(item.id)} style={styles.deleteBtn}>
            <Trash2 size={20} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => viewProject(item)}>
        <View style={styles.cardFooter}>
          <View style={styles.metaInfo}>
            <Calendar size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.metaInfo}>
            <Map size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{item.coordinates.length} điểm</Text>
          </View>
          <ChevronRight size={16} color={Colors.separator} />
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
          <FileText size={64} color={Colors.border} />
          <Text style={styles.emptyText}>Chưa có dự án nào được lưu</Text>
          <Text style={styles.emptySubText}>Các thửa đất bạn lưu sẽ xuất hiện tại đây</Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + Spacing.lg }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
  },
  headerTitle: { fontSize: Typography.fontSizes.xxl, fontWeight: Typography.fontWeights.heavy, color: Colors.textPrimary },
  headerSubtitle: { fontSize: Typography.fontSizes.md, color: Colors.textSecondary, marginTop: 4 },
  listContent: { padding: Spacing.lg },
  projectCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceSecondary,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  titleInfo: { flex: 1 },
  titleInfoArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  projectTitle: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  projectAddress: { fontSize: Typography.fontSizes.sm + 1, color: Colors.textSecondary, flex: 1 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  editBtn: { padding: Spacing.sm, marginRight: 4 },
  deleteBtn: { padding: Spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  metaInfo: { flexDirection: 'row', alignItems: 'center', marginRight: Spacing.xl },
  metaText: { fontSize: Typography.fontSizes.sm, color: Colors.textTertiary, marginLeft: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: Typography.fontSizes.lg + 1, fontWeight: Typography.fontWeights.bold, color: Colors.textSecondary, marginTop: Spacing.lg },
  emptySubText: { fontSize: Typography.fontSizes.md, color: Colors.textTertiary, textAlign: 'center', marginTop: Spacing.sm },
});

export default SoDoScreen;
