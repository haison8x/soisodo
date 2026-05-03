import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { ShieldCheck, ArrowRight } from 'lucide-react-native';
import { Colors, Spacing, Radius, Shadows, Typography } from '../../theme';

interface TrackingPermissionModalProps {
  isVisible: boolean;
  onContinue: () => void;
}

export const TrackingPermissionModal: React.FC<TrackingPermissionModalProps> = ({
  isVisible,
  onContinue,
}) => {
  if (Platform.OS !== 'ios') return null;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={48} color={Colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>Bảo mật & Trải nghiệm</Text>
          
          <Text style={styles.description}>
            Để cung cấp các tính năng miễn phí và trải nghiệm tốt nhất, chúng tôi cần sự cho phép của bạn để cá nhân hóa nội dung và quảng cáo.
          </Text>

          <View style={styles.benefitContainer}>
            <View style={styles.benefitItem}>
              <View style={styles.bullet} />
              <Text style={styles.benefitText}>Giữ ứng dụng luôn miễn phí cho mọi người.</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bullet} />
              <Text style={styles.benefitText}>Hiển thị quảng cáo phù hợp với nhu cầu của bạn.</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.bullet} />
              <Text style={styles.benefitText}>Bảo mật dữ liệu cá nhân theo tiêu chuẩn Apple.</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Tiếp tục</Text>
            <ArrowRight size={20} color={Colors.textOnPrimary} />
          </TouchableOpacity>

          <Text style={styles.footer}>
            Bạn sẽ thấy thông báo hệ thống của Apple ở bước tiếp theo.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  benefitContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  benefitText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textPrimary,
    flex: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    width: '100%',
    marginBottom: Spacing.md,
  },
  buttonText: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textOnPrimary,
    marginRight: Spacing.sm,
  },
  footer: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
