import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  initialTitle?: string;
  initialCity?: string;
}

const SaveProjectModal = ({ visible, onClose, onSave, initialTitle, initialCity }: Props) => {
  const [title, setTitle] = useState(initialTitle ?? '');

  useEffect(() => {
    setTitle(initialTitle ?? '');
  }, [initialTitle, visible]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title);
      onClose();
    }
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContent}
            >
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Lưu Dự Án</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.body}>
                <View style={styles.cityInfoBox}>
                  <MapPin size={16} color={Colors.textSecondary} />
                  <Text style={styles.cityLabel}>Thành phố: </Text>
                  <Text style={styles.cityName}>{initialCity}</Text>
                </View>

                <Text style={styles.label}>Tên dự án</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập tên dự án..."
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor={Colors.textTertiary}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.saveBtn, !title.trim() && styles.disabledBtn]}
                  onPress={handleSave}
                  disabled={!title.trim()}
                >
                  <Text style={styles.saveBtnText}>Lưu Lại</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    ...Shadows.md,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  headerTitle: { fontSize: Typography.fontSizes.lg, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  closeBtn: { padding: 4 },
  body: { padding: Spacing.xl },
  label: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: 18 },
  cityInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityLabel: { fontSize: Typography.fontSizes.md, color: Colors.textSecondary, marginLeft: Spacing.sm },
  cityName: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.bold, color: Colors.textPrimary },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  disabledBtn: { backgroundColor: Colors.border },
  saveBtnText: { color: Colors.textOnPrimary, fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.bold },
});

export default SaveProjectModal;
