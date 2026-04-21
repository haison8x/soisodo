import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography, Radius } from '../../../theme';
import ScreenHeader from '../../components/shared/ScreenHeader';

const AppInfoScreen = () => {
  const navigation = useNavigation();
  const version = '1.0.7';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Thông tin ứng dụng" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            source={require('../../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>Định Vị Nhà Đất - VN2000</Text>
          <Text style={styles.version}>Phiên bản {version}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Nhà phát triển</Text>
          <Text style={styles.infoValue}>TranHiepGold</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Liên hệ</Text>
          <Text style={styles.infoValue}>hiepgoldtran@gmail.com</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.copyright}>
            © 2026 Định Vị Nhà Đất - VN2000. All rights reserved.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { flex: 1, padding: Spacing.xxl, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: 40, marginTop: Spacing.xl },
  logo: { width: 100, height: 100, borderRadius: Radius.xxl - 2, marginBottom: Spacing.lg },
  appName: { fontSize: Typography.fontSizes.xxl, fontWeight: Typography.fontWeights.heavy, color: Colors.textPrimary, marginBottom: Spacing.sm },
  version: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
  infoSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
  },
  infoLabel: { fontSize: Typography.fontSizes.base, color: Colors.textSecondary },
  infoValue: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semibold, color: Colors.textPrimary },
  footer: { marginTop: 'auto', marginBottom: Spacing.xl },
  copyright: { fontSize: Typography.fontSizes.sm, color: Colors.textTertiary },
});

export default AppInfoScreen;
