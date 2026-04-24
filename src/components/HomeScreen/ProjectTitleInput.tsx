import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

const ProjectTitleInput = ({ value, onChangeText }: Props) => {
  const t = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: t.colors.primary }]}>
      <TextInput
        style={[t.typography.title2, styles.input, { color: t.colors.label, fontFamily: t.fontFamily }]}
        value={value}
        onChangeText={onChangeText}
        placeholder="Nhập tên dự án..."
        placeholderTextColor={t.colors.placeholder}
      />
      <Pencil size={16} color={t.colors.primary} style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    paddingBottom: 6,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    padding: 0,
  },
  icon: {
    marginLeft: 8,
    opacity: 0.7,
  },
});

export default ProjectTitleInput;
