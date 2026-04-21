import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../theme';
import type { City } from '../../types';

interface Props {
  selectedCity: City | undefined;
  onPress: () => void;
}

const CitySelector = ({ selectedCity, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.citySelector} onPress={onPress}>
      <Text style={styles.cityText}>{selectedCity?.label ?? 'Chọn tỉnh/thành'}</Text>
      <ChevronDown size={20} color={Colors.textPrimary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.xs,
    backgroundColor: Colors.background,
  },
  cityText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
  },
});

export default CitySelector;
