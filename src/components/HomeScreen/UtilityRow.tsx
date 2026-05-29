import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Pencil, ArrowLeftRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface UtilityRowProps {
  onEditPress: () => void;
  onSwapPress: () => void;
}

const UtilityRow = ({ onEditPress, onSwapPress }: UtilityRowProps) => {
  const t = useTheme();

  return (
    <View style={[styles.utilityRow, t.shadow.sm, { backgroundColor: t.colors.surface }]}>
      <Pressable
        style={({ pressed }) => [styles.utilityBtn, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
        android_ripple={{ color: t.colors.fillPrimary }}
        onPress={onEditPress}
        accessibilityRole="button"
        accessibilityLabel="Sửa tọa độ X và Y"
      >
        <Pencil size={15} color={t.colors.primary} />
        <Text style={[t.typography.callout, styles.utilityLabel, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
          Sửa X&Y
        </Text>
      </Pressable>
      <View style={[styles.utilityDivider, { backgroundColor: t.colors.separator }]} />
      <Pressable
        style={({ pressed }) => [styles.utilityBtn, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
        android_ripple={{ color: t.colors.fillPrimary }}
        onPress={onSwapPress}
        accessibilityRole="button"
        accessibilityLabel="Hoán đổi X và Y"
      >
        <ArrowLeftRight size={15} color={t.colors.primary} />
        <Text style={[t.typography.callout, styles.utilityLabel, { color: t.colors.primary, fontFamily: t.fontFamily }]}>
          Hoán đổi X↔Y
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  utilityRow: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  utilityBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  utilityLabel: {
    fontWeight: '500',
  },
  utilityDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
});

export default UtilityRow;
