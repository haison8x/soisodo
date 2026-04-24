import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Linking, Platform , ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronRight, Mail, User, Code } from 'lucide-react-native';
import Constants from 'expo-constants';
import ScreenHeader from '../../components/shared/ScreenHeader';
import { useTheme } from '../../theme/ThemeProvider';

const DEVELOPER = 'TranHiepGold';
const EMAIL = 'hiepgoldtran@gmail.com';
const COPYRIGHT_YEAR = '2026';

const AppInfoScreen = () => {
  const navigation = useNavigation();
  const t = useTheme();
  const version = Constants.expoConfig?.version ?? '1.0.7';
  const build = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '';

  const InfoRow = ({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onPress?: () => void;
  }) => {
    const content = (
      <View style={styles.infoRow}>
        <View style={[styles.infoIconWrap, { backgroundColor: t.colors.fillSecondary, borderRadius: t.radius.sm }]}>
          {icon}
        </View>
        <Text style={[t.typography.callout, { color: t.colors.label, flex: 1, fontFamily: t.fontFamily }]}>
          {label}
        </Text>
        <Text style={[t.typography.callout, { color: onPress ? t.colors.primary : t.colors.labelSecondary, fontFamily: t.fontFamily }]} numberOfLines={1}>
          {value}
        </Text>
        {onPress && <ChevronRight size={16} color={t.colors.labelTertiary} style={{ marginLeft: 4 }} />}
      </View>
    );

    if (!onPress) return content;

    return (
      <Pressable
        onPress={onPress}
        android_ripple={{ color: t.colors.fillTertiary }}
        style={({ pressed }) => [pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
      >
        {content}
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: t.colors.backgroundGrouped }]}
      edges={['top', 'bottom']}
    >
      <ScreenHeader title="Thông tin ứng dụng" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* App identity hero */}
        <View style={styles.hero}>
          <Image
            source={require('../../../assets/icon.png')}
            style={[styles.logo, { borderRadius: t.radius.xxl }]}
          />
          <Text style={[t.typography.title2, { color: t.colors.label, fontFamily: t.fontFamily, textAlign: 'center' }]}>
            Định Vị Nhà Đất
          </Text>
          <Text style={[t.typography.callout, { color: t.colors.labelSecondary, fontFamily: t.fontFamily, textAlign: 'center', marginTop: 2 }]}>
            VN2000
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: t.colors.fillSecondary, borderRadius: t.radius.full }]}>
            <Text style={[t.typography.footnote, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
              Phiên bản {version}{build ? ` (${build})` : ''}
            </Text>
          </View>
        </View>

        {/* Info card — iOS Settings > About style */}
        <View style={[styles.card, { backgroundColor: t.colors.surface }, t.shadow.sm]}>
          <InfoRow
            icon={<User size={16} color={t.colors.primary} />}
            label="Nhà phát triển"
            value={DEVELOPER}
          />
          <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
          <InfoRow
            icon={<Mail size={16} color={t.colors.success} />}
            label="Liên hệ"
            value={EMAIL}
            onPress={() => Linking.openURL(`mailto:${EMAIL}`)}
          />
          <View style={[styles.sep, { backgroundColor: t.colors.separator }]} />
          <InfoRow
            icon={<Code size={16} color={t.colors.accent} />}
            label="Nền tảng"
            value="Expo SDK 54 · React Native"
          />
        </View>

        {/* Copyright footer */}
        <Text style={[t.typography.caption1, styles.footer, { color: t.colors.labelTertiary, fontFamily: t.fontFamily }]}>
          © {COPYRIGHT_YEAR} Định Vị Nhà Đất – VN2000.{'\n'}All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 32,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 4,
  },
  versionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 44,
    gap: 10,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sep: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 54,
  },
  footer: {
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AppInfoScreen;
