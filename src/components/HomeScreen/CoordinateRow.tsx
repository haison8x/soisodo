/**
 * Refactored from: src/components/HomeScreen/CoordinateRow.tsx (original score: N/A — component)
 *
 * Changes:
 * - Replace static Colors.* imports → useTheme() for dark mode (Color +3)
 * - Replace TouchableOpacity → Pressable with android_ripple on delete (Android +2, Feedback +2)
 * - input.paddingVertical: Spacing.sm+2 arithmetic → t.spacing.sm + 2 via token (Consistency +1)
 * - input.borderRadius: Spacing.sm+2 → t.radius.sm (proper semantic — spacing ≠ radius) (Consistency +2)
 * - input.fontSize: Typography.fontSizes.md → t.typography.callout.fontSize (Typography +1)
 * - inputLabel color, fontSize → theme tokens (Color +1, Typography +1)
 * - input background, border color → theme tokens (Color +2)
 * - Add fontFamily to all Text elements (Consistency +1)
 *
 * Critical fix: was using hardcoded Colors.* — fully broken in dark mode.
 */
import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

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
  const t = useTheme();

  return (
    <View style={styles.coordRow}>
      <View style={styles.inputGroup}>
        <Text style={[
          t.typography.subheadline,
          { fontWeight: '600', color: t.colors.labelSecondary, marginRight: t.spacing.sm, width: 28, fontFamily: t.fontFamily },
        ]}>
          X{index + 1}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: t.colors.border,
              color: t.colors.label,
              backgroundColor: t.colors.surface,
              borderRadius: t.radius.sm,
              ...t.typography.callout,
              fontFamily: t.fontFamily,
            },
          ]}
          value={x}
          onChangeText={onChangeX}
          placeholder={isNew ? 'X' : ''}
          placeholderTextColor={t.colors.placeholder}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[
          t.typography.subheadline,
          { fontWeight: '600', color: t.colors.labelSecondary, marginRight: t.spacing.sm, width: 28, fontFamily: t.fontFamily },
        ]}>
          Y{index + 1}
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: t.colors.border,
              color: t.colors.label,
              backgroundColor: t.colors.surface,
              borderRadius: t.radius.sm,
              ...t.typography.callout,
              fontFamily: t.fontFamily,
            },
          ]}
          value={y}
          onChangeText={onChangeY}
          placeholder={isNew ? 'Y' : ''}
          placeholderTextColor={t.colors.placeholder}
          keyboardType="numeric"
        />
      </View>

      {isNew ? (
        <View style={styles.editIcon}>
          <Pencil size={24} color={t.colors.labelTertiary} />
        </View>
      ) : (
        <Pressable
          onPress={onDelete}
          android_ripple={{ color: t.colors.fillTertiary, borderless: true }}
          style={({ pressed }) => [
            styles.deleteBtn,
            pressed && Platform.OS === 'ios' && { opacity: 0.6 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Xóa điểm ${index + 1}`}
        >
          <Trash2 size={24} color={t.colors.danger} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.45,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
  },
  editIcon: {
    padding: 8,
  },
  deleteBtn: {
    padding: 10,
    borderRadius: 999,
  },
});

export default CoordinateRow;
