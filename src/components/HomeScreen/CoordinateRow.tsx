import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../theme';

interface Props {
  index: number;
  x: string;
  y: string;
  onDelete?: () => void;
  onChangeX?: (val: string) => void;
  onChangeY?: (val: string) => void;
  isNew?: boolean;
}

const CoordinateRow = ({ index, x, y, onDelete, onChangeX, onChangeY, isNew = false }: Props) => {
  return (
    <View style={styles.coordRow}>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>X{index + 1}</Text>
        <TextInput
          style={styles.input}
          value={x}
          onChangeText={onChangeX}
          placeholder={isNew ? 'X' : ''}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Y{index + 1}</Text>
        <TextInput
          style={styles.input}
          value={y}
          onChangeText={onChangeY}
          placeholder={isNew ? 'Y' : ''}
          keyboardType="numeric"
        />
      </View>
      {isNew ? (
        <View style={styles.editIcon}>
          <Pencil size={24} color={Colors.textTertiary} />
        </View>
      ) : (
        <TouchableOpacity onPress={onDelete}>
          <Trash2 size={24} color={Colors.danger} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    justifyContent: 'space-between',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.45,
  },
  inputLabel: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
    width: 25,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Spacing.sm + 2,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
  },
  editIcon: {
    padding: Spacing.sm,
  },
});

export default CoordinateRow;
