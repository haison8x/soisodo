import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  index: number;
  x: string;
  y: string;
  onDelete?: () => void;
  onChangeX?: (val: string) => void;
  onChangeY?: (val: string) => void;
  onAdd?: () => void;
  isNew?: boolean;
  isEditMode?: boolean;
}

const CoordinateRow = ({
  index, x, y, onDelete, onChangeX, onChangeY, onAdd,
  isNew = false, isEditMode = false,
}: Props) => {
  const t = useTheme();
  const canAdd = isNew && x.trim().length > 0 && y.trim().length > 0;

  return (
    <View style={styles.row}>
      {/* Delete button — only on existing rows in edit mode */}
      {!isNew && isEditMode && (
        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [styles.deleteCircle, pressed && { opacity: 0.7 }]}
          android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true }}
          accessibilityRole="button"
          accessibilityLabel={`Xóa điểm ${index + 1}`}
        >
          <Minus size={12} color="#fff" strokeWidth={3} />
        </Pressable>
      )}

      {/* X field */}
      <View style={styles.field}>
        <Text style={[
          isNew ? t.typography.footnote : t.typography.caption1,
          styles.label,
          { color: t.colors.labelSecondary, fontFamily: t.fontFamily },
        ]}>
          {isNew ? 'X' : `X${index + 1}`}
        </Text>
        <TextInput
          style={[t.typography.callout, styles.input, { color: t.colors.label, fontFamily: t.fontFamily }]}
          value={x}
          onChangeText={onChangeX}
          placeholder={isNew ? 'Kinh độ' : undefined}
          placeholderTextColor={t.colors.placeholder}
          keyboardType="numeric"
          editable={isNew || isEditMode || !!onChangeX}
        />
      </View>

      <View style={[styles.vSep, { backgroundColor: t.colors.separator }]} />

      {/* Y field */}
      <View style={styles.field}>
        <Text style={[
          isNew ? t.typography.footnote : t.typography.caption1,
          styles.label,
          { color: t.colors.labelSecondary, fontFamily: t.fontFamily },
        ]}>
          {isNew ? 'Y' : `Y${index + 1}`}
        </Text>
        <TextInput
          style={[t.typography.callout, styles.input, { color: t.colors.label, fontFamily: t.fontFamily }]}
          value={y}
          onChangeText={onChangeY}
          placeholder={isNew ? 'Vĩ độ' : undefined}
          placeholderTextColor={t.colors.placeholder}
          keyboardType="numeric"
          editable={isNew || isEditMode || !!onChangeY}
        />
      </View>

      {/* Add button — only on new row */}
      {isNew && (
        <Pressable
          onPress={canAdd ? onAdd : undefined}
          disabled={!canAdd}
          style={({ pressed }) => [styles.actionBtn, pressed && Platform.OS === 'ios' && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Thêm tọa độ"
        >
          <Plus size={20} color={canAdd ? t.colors.primary : t.colors.labelTertiary} />
        </Pressable>
      )}

      {/* Spacer to keep layout consistent when no action button */}
      {!isNew && <View style={styles.actionBtn} />}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 50,
    gap: 8,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  label: {
    minWidth: 22,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    minHeight: 44,
    padding: 0,
  },
  vSep: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    marginHorizontal: 4,
  },
  actionBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
});

export default CoordinateRow;
