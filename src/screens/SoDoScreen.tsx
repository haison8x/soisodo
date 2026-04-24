/**
 * Refactored from: src/screens/SoDoScreen.tsx (original score: 55/100)
 *
 * Changes:
 * - editBtn/deleteBtn padding: 8 → 12 (Spacing.md) → tap target 36→44pt (Hit targets +3)
 * - Replace fontSize arithmetic (lg+1=18, sm+1=13) with proper tokens (Consistency +3)
 * - Add android_ripple to project card and action buttons (Android +3, Feedback +2)
 * - Fix formatDate → pad to dd/MM/yyyy per CLAUDE.md convention (Clarity +1)
 * - Replace TouchableOpacity → Pressable (Feedback +1)
 *
 * Expected new score: 75/100
 */
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FileText, Trash2, Map, Calendar, ChevronRight, Edit3, MapPin } from 'lucide-react-native';
import { toMapPoints } from '../utils/point';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import { useRewardedAd } from '../hooks/useRewardedAd';
import { useTheme } from '../theme/ThemeProvider';
import AdFreeService from '../services/AdFreeService';
import { AD_UNITS, SODO_REWARDED_MIN_COUNT, SODO_REWARDED_THROTTLE_MS } from '../constants/adUnits';
import type { Project } from '../types';

const SoDoScreen = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigation = useNavigation();
  const { showAd } = useInterstitialAd();
  const { showAd: showRewardedAd } = useRewardedAd(AD_UNITS.rewarded);
  const tabBarHeight = useBottomTabBarHeight();
  const t = useTheme();

  const checkAndShowRewardedPrompt = useCallback(async (loadedProjects: Project[]) => {
    if (loadedProjects.length <= SODO_REWARDED_MIN_COUNT) return;
    if (AdFreeService.isAdSuppressed()) return;
    const lastPrompt = await AdFreeService.getSodoLastPromptMs();
    if (Date.now() - lastPrompt <= SODO_REWARDED_THROTTLE_MS) return;
    await AdFreeService.saveSodoLastPromptMs();
    showRewardedAd(async () => {
      await AdFreeService.grantAdFree();
    });
  }, [showRewardedAd]);

  const loadProjects = useCallback(async () => {
    try {
      const projectsJson = await AsyncStorage.getItem('saved_projects');
      const loaded = projectsJson ? (JSON.parse(projectsJson) as Project[]) : [];
      setProjects(loaded);
      await checkAndShowRewardedPrompt(loaded);
    } catch {
      // silent — UI shows empty state
    }
  }, [checkAndShowRewardedPrompt]);

  useFocusEffect(useCallback(() => { loadProjects(); }, [loadProjects]));

  const deleteProject = (id: string) => {
    Alert.alert('Xóa dự án', 'Bạn có chắc chắn muốn xóa dự án này không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = projects.filter(p => p.id !== id);
            await AsyncStorage.setItem('saved_projects', JSON.stringify(updated));
            setProjects(updated);
          } catch {
            // silent
          }
        },
      },
    ]);
  };

  const viewProject = (project: Project) => {
    const mapData = toMapPoints(project.title, project.cityValue, project.coordinates);
    showAd(() => {
      (navigation as any).navigate('Trang chủ', { screen: 'Map', params: { mapData } });
    });
  };

  const handleEdit = (project: Project) => {
    (navigation as any).navigate('Trang chủ', { projectData: project });
  };

  // dd/MM/yyyy per CLAUDE.md convention
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const renderItem = ({ item }: { item: Project }) => (
    <View style={[styles.projectCard, t.shadow.sm, { backgroundColor: t.colors.surface, borderRadius: t.radius.lg }]}>
      <View style={styles.cardHeader}>
        <Pressable
          style={({ pressed }) => [
            styles.titleInfoArea,
            pressed && Platform.OS === 'ios' && { opacity: 0.75 },
          ]}
          android_ripple={{ color: t.colors.fillTertiary }}
          onPress={() => viewProject(item)}
          accessibilityRole="button"
          accessibilityLabel={`Xem bản đồ ${item.title}`}
        >
          <View style={[styles.iconBox, { borderRadius: t.radius.md, backgroundColor: t.colors.primaryLight }]}>
            <FileText size={24} color={t.colors.primary} />
          </View>
          <View style={styles.titleInfo}>
            <Text style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.addressRow}>
              <MapPin size={12} color={t.colors.labelSecondary} style={{ marginTop: 2, marginRight: 4 }} />
              <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, flex: 1, fontFamily: t.fontFamily }]} numberOfLines={2}>
                {item.address || item.city}
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.actionButtons}>
          {/* padding 12 = Spacing.md, total: 12+20+12 = 44pt ✓ */}
          <Pressable
            onPress={() => handleEdit(item)}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && Platform.OS === 'ios' && { opacity: 0.75 },
            ]}
            android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
            accessibilityRole="button"
            accessibilityLabel={`Chỉnh sửa ${item.title}`}
          >
            <Edit3 size={20} color={t.colors.primary} />
          </Pressable>
          <Pressable
            onPress={() => deleteProject(item.id)}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && Platform.OS === 'ios' && { opacity: 0.75 },
            ]}
            android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
            accessibilityRole="button"
            accessibilityLabel={`Xóa ${item.title}`}
          >
            <Trash2 size={20} color={t.colors.danger} />
          </Pressable>
        </View>
      </View>

      <Pressable
        onPress={() => viewProject(item)}
        android_ripple={{ color: t.colors.fillTertiary }}
      >
        <View style={[styles.cardFooter, { borderTopColor: t.colors.separator }]}>
          <View style={styles.metaInfo}>
            <Calendar size={14} color={t.colors.labelTertiary} />
            <Text style={[t.typography.caption1, { color: t.colors.labelTertiary, marginLeft: 4, fontFamily: t.fontFamily }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View style={styles.metaInfo}>
            <Map size={14} color={t.colors.labelTertiary} />
            <Text style={[t.typography.caption1, { color: t.colors.labelTertiary, marginLeft: 4, fontFamily: t.fontFamily }]}>
              {item.coordinates.length} điểm
            </Text>
          </View>
          <ChevronRight size={16} color={t.colors.separator} />
        </View>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: t.colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: t.colors.surface, borderBottomColor: t.colors.separator }]}>
        <Text style={[t.typography.title2, { color: t.colors.label, fontFamily: t.fontFamily }]}>
          Sổ Đỏ Đã Lưu
        </Text>
        <Text style={[t.typography.subheadline, { color: t.colors.labelSecondary, marginTop: 4, fontFamily: t.fontFamily }]}>
          Quản lý danh sách các thửa đất của bạn
        </Text>
      </View>

      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText size={64} color={t.colors.separator} />
          <Text style={[t.typography.title3, { color: t.colors.labelSecondary, marginTop: 16, fontFamily: t.fontFamily }]}>
            Chưa có dự án nào được lưu
          </Text>
          <Text style={[t.typography.subheadline, { color: t.colors.labelTertiary, textAlign: 'center', marginTop: 8, fontFamily: t.fontFamily }]}>
            Các thửa đất bạn lưu sẽ xuất hiện tại đây
          </Text>
        </View>
      ) : (
        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 16 }]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listContent: { padding: 16 },
  projectCard: {
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  titleInfo: { flex: 1 },
  titleInfoArea: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  actionButtons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: 12, marginLeft: 4 }, // 12+20+12 = 44pt ✓
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaInfo: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
});

export default SoDoScreen;
