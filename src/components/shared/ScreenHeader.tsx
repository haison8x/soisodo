import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

const ScreenHeader = ({ title, onBack, rightElement }: ScreenHeaderProps) => (
  <View style={styles.header}>
    <View style={styles.left}>
      {onBack ? (
        <TouchableOpacity
          testID="screen-header-back"
          onPress={onBack}
          style={styles.backButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>

    <Text style={styles.title} numberOfLines={1}>{title}</Text>

    <View style={styles.right}>
      {rightElement ?? <View style={styles.placeholder} />}
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: { width: 44, alignItems: 'flex-start' },
  right: { width: 44, alignItems: 'flex-end' },
  backButton: {
    borderRadius: Radius.full,
    padding: 2,
  },
  title: {
    flex: 1,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  placeholder: { width: 28, height: 28 },
});

export default ScreenHeader;
