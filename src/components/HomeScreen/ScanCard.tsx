import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Camera, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface ScanCardProps {
  onPress: () => void;
  isScanning: boolean;
}

const ScanCard = ({ onPress, isScanning }: ScanCardProps) => {
  const t = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        t.shadow.sm,
        { backgroundColor: t.colors.surface },
        pressed && Platform.OS === 'ios' && { opacity: 0.85 },
      ]}
      android_ripple={{ color: t.colors.fillTertiary }}
      onPress={onPress}
      disabled={isScanning}
      accessibilityRole="button"
      accessibilityLabel="Quét tọa độ từ ảnh"
    >
      <View style={[styles.scanIconWrap, { backgroundColor: t.colors.primaryLight }]}>
        {isScanning ? (
          <ActivityIndicator size="small" color={t.colors.primary} />
        ) : (
          <Camera size={22} color={t.colors.primary} />
        )}
      </View>
      <View style={styles.scanText}>
        <Text style={[t.typography.headline, { color: t.colors.label, fontFamily: t.fontFamily }]}>
          Quét tọa độ từ ảnh
        </Text>
        <Text style={[t.typography.subheadline, styles.scanSub, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
          Tự động nhận dạng từ sổ đỏ
        </Text>
      </View>
      <ChevronRight size={18} color={t.colors.labelTertiary} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanText: {
    flex: 1,
    marginLeft: 14,
  },
  scanSub: {
    marginTop: 2,
  },
});

export default ScanCard;
