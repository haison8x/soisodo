import React from 'react';
import { Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import type { City } from '../../types';

interface Props {
  selectedCity: City | undefined;
  onPress: () => void;
}

const CitySelector = ({ selectedCity, onPress }: Props) => {
  const t = useTheme();
  return (
    <Pressable
      style={({ pressed }) => [styles.cell, pressed && Platform.OS === 'ios' && { opacity: 0.7 }]}
      onPress={onPress}
      android_ripple={{ color: t.colors.fillTertiary }}
      accessibilityRole="button"
      accessibilityLabel={`Tỉnh thành phố hiện tại: ${selectedCity?.label ?? 'Chưa chọn'}. Nhấn để thay đổi`}
    >
      <Text style={[t.typography.body, { color: t.colors.label, fontFamily: t.fontFamily }]}>
        Tỉnh / Thành phố
      </Text>
      <View style={styles.right}>
        <Text style={[t.typography.body, { color: t.colors.labelSecondary, fontFamily: t.fontFamily }]}>
          {selectedCity?.label ?? 'Chọn...'}
        </Text>
        <ChevronRight size={16} color={t.colors.labelTertiary} />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    minHeight: 50,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

export default CitySelector;
