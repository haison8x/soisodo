import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const ProjectTitleInput = ({ value, onChangeText }: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.projectTitle}
        value={value}
        onChangeText={onChangeText}
        placeholder="Nhập tên dự án..."
        placeholderTextColor={Colors.textTertiary}
      />
      <Pencil size={16} color={Colors.primary} style={styles.editIcon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    marginVertical: Spacing.xs,
    paddingBottom: Spacing.xs,
  },
  projectTitle: {
    flex: 1,
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.textPrimary,
    padding: 0,
  },
  editIcon: {
    marginLeft: Spacing.sm,
    opacity: 0.7,
  },
});

export default ProjectTitleInput;
