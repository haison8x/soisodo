import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../theme';

export interface SettingsRow {
  label: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress: () => void;
}

interface SettingsSectionProps {
  title: string;
  rows: SettingsRow[];
}

const SettingsSection = ({ title, rows }: SettingsSectionProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.card}>
      {rows.map((row, index) => (
        <React.Fragment key={row.label}>
          {index > 0 && <View style={styles.separator} />}
          <TouchableOpacity style={styles.row} onPress={row.onPress} activeOpacity={0.7}>
            {row.leftIcon && <View style={styles.iconContainer}>{row.leftIcon}</View>}
            <View style={styles.labelGroup}>
              <Text style={styles.label}>{row.label}</Text>
              {row.subtitle && <Text style={styles.subtitle}>{row.subtitle}</Text>}
            </View>
            {row.rightElement ?? <ChevronRight size={20} color={Colors.textTertiary} />}
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 10,
    marginTop: 10,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: { width: 30, alignItems: 'center', marginRight: 10 },
  labelGroup: { flex: 1 },
  label: { fontSize: Typography.fontSizes.base, color: Colors.textPrimary },
  subtitle: { fontSize: Typography.fontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.separator, marginLeft: 56 },
});

export default SettingsSection;
