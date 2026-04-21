import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { ArrowRightLeft, Trash2, GripVertical, List, FileText, ChevronUp, ChevronDown } from 'lucide-react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialValue?: string;
}

interface ListItem {
  key: string;
  value: string;
}

type EditMode = 'text' | 'list';

const CoordinateEditModal = ({ visible, onClose, onSave, initialValue }: Props) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<EditMode>('text');
  const [listData, setListData] = useState<ListItem[]>([]);

  useEffect(() => {
    if (visible) {
      setText(initialValue ?? '');
      setMode('text');
    }
  }, [visible, initialValue]);

  const parseTextToList = (rawText: string): ListItem[] =>
    rawText.split('\n').map((line, index) => ({
      key: `item-${index}-${Date.now()}`,
      value: line,
    }));

  const joinListToText = (data: ListItem[]): string => data.map(item => item.value).join('\n');

  const handleModeChange = (newMode: EditMode) => {
    if (newMode === 'list') {
      setListData(parseTextToList(text));
    } else {
      setText(joinListToText(listData));
    }
    setMode(newMode);
  };

  const handleSave = () => {
    const finalContent = mode === 'list' ? joinListToText(listData) : text;
    onSave(finalContent);
    onClose();
  };

  const parseNumbers = (input: string): string[] =>
    input.split(/[\s,]+/).filter(item => item.trim() !== '' && !isNaN(Number(item)));

  const handleInterleave = () => {
    const numbers = parseNumbers(text);
    if (numbers.length === 0 || numbers.length % 2 !== 0) {
      alert('Số lượng số liệu phải là chẵn để thực hiện ghép cột.');
      return;
    }
    const mid = numbers.length / 2;
    const firstHalf = numbers.slice(0, mid);
    const secondHalf = numbers.slice(mid);
    const result: string[] = [];
    for (let i = 0; i < mid; i++) {
      result.push(`${firstHalf[i]}\t${secondHalf[i]}`);
    }
    setText(result.join('\n'));
  };

  const handleSwapPairs = () => {
    const numbers = parseNumbers(text);
    if (numbers.length === 0 || numbers.length % 2 !== 0) {
      alert('Số lượng số liệu phải là chẵn để đảo cặp.');
      return;
    }
    const result: string[] = [];
    for (let i = 0; i < numbers.length; i += 2) {
      result.push(`${numbers[i + 1]}\t${numbers[i]}`);
    }
    setText(result.join('\n'));
  };

  // suppress unused warning — buttons may be added later
  void handleInterleave;
  void handleSwapPairs;

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<ListItem>) => {
    const index = getIndex() ?? 0;
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.rowItem, isActive && styles.activeRowItem]}
        >
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <GripVertical size={24} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TextInput
            style={styles.rowInput}
            value={item.value}
            onChangeText={val => {
              const newData = [...listData];
              newData[index] = { ...newData[index], value: val };
              setListData(newData);
            }}
            placeholder="X  Y"
            placeholderTextColor={Colors.border}
          />

          <View style={styles.moveButtonsGroup}>
            <TouchableOpacity
              onPress={() => {
                if (index > 0) {
                  const newData = [...listData];
                  const [removed] = newData.splice(index, 1);
                  newData.splice(index - 1, 0, removed);
                  setListData(newData);
                }
              }}
              style={styles.moveActionButton}
            >
              <ChevronUp size={22} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (index < listData.length - 1) {
                  const newData = [...listData];
                  const [removed] = newData.splice(index, 1);
                  newData.splice(index + 1, 0, removed);
                  setListData(newData);
                }
              }}
              style={styles.moveActionButton}
            >
              <ChevronDown size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              const newData = [...listData];
              newData.splice(index, 1);
              setListData(newData);
            }}
            style={styles.deleteButton}
          >
            <Trash2 size={20} color={Colors.danger} />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa Danh Sách Tọa Độ</Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, mode === 'text' && styles.activeTab]}
                onPress={() => handleModeChange('text')}
              >
                <FileText size={18} color={mode === 'text' ? Colors.textOnPrimary : Colors.textSecondary} />
                <Text style={[styles.tabText, mode === 'text' && styles.activeTabText]}>Văn bản</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, mode === 'list' && styles.activeTab]}
                onPress={() => handleModeChange('list')}
              >
                <List size={18} color={mode === 'list' ? Colors.textOnPrimary : Colors.textSecondary} />
                <Text style={[styles.tabText, mode === 'list' && styles.activeTabText]}>Danh sách</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.contentArea}>
              {mode === 'text' ? (
                <>
                  <TextInput
                    style={styles.textInput}
                    multiline
                    value={text}
                    onChangeText={setText}
                    placeholder="1196048.346	601786.223"
                    placeholderTextColor={Colors.textTertiary}
                    autoCorrect={false}
                  />
                  <Text style={styles.modalSubtitle}>Format: X [Xuống dòng] Y</Text>
                </>
              ) : (
                <View style={styles.listContainer}>
                  <DraggableFlatList
                    data={listData}
                    onDragEnd={({ data }) => setListData(data)}
                    keyExtractor={item => item.key}
                    renderItem={renderItem}
                    containerStyle={{ flex: 1 }}
                  />
                  {listData.length === 0 && (
                    <View style={styles.emptyListState}>
                      <Text style={styles.emptyListText}>Danh sách trống</Text>
                      <Text style={styles.emptyListSubText}>
                        Chuyển sang "Văn bản" để paste dữ liệu.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Cập Nhật</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.hintBox}>
              <Text style={styles.hintText}>
                <Text style={{ fontWeight: Typography.fontWeights.bold }}>Mẹo: </Text>
                Kết quả scan đôi khi không chính xác, bạn hãy chỉnh sửa bằng tay, hoặc bạn dùng
                Google Translate, hoặc AI (Gemini, ChatGPT, DeepSeek) để scan hình ảnh và copy
                đoạn text vào đây, độ chính xác sẽ rất cao.
              </Text>
            </View>
            <View style={styles.footerLinks}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.youtube.com/watch?v=fig3E44MFM4')}
              >
                <Text style={styles.modalLink}>Xem hướng dẫn (YouTube)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
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
  container: { width: '100%', maxWidth: 500, height: '90%' },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    flex: 1,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.heavy,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  hintBox: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.hintBorder,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  hintText: { fontSize: Typography.fontSizes.sm, color: Colors.hintText, lineHeight: 18 },
  contentArea: { flex: 1, marginBottom: Spacing.lg },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    gap: Spacing.sm,
  },
  activeTab: {
    backgroundColor: Colors.surfaceDark,
    ...Shadows.sm,
  },
  tabText: { fontSize: Typography.fontSizes.md, fontWeight: Typography.fontWeights.semibold, color: Colors.textSecondary },
  activeTabText: { color: Colors.textOnPrimary },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    fontSize: Typography.fontSizes.md,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    textAlignVertical: 'top',
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
    height: 44,
  },
  activeRowItem: {
    backgroundColor: Colors.primaryLight,
    ...Shadows.sm,
  },
  dragHandle: { padding: 6, marginRight: 2 },
  rowInput: {
    flex: 1,
    fontSize: Typography.fontSizes.sm + 1,
    color: Colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingVertical: 2,
  },
  deleteButton: { padding: 6 },
  moveButtonsGroup: { flexDirection: 'row', alignItems: 'center', marginRight: 4 },
  moveActionButton: { padding: 4 },
  emptyListState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xl },
  emptyListText: { fontSize: Typography.fontSizes.base, fontWeight: Typography.fontWeights.semibold, color: Colors.textTertiary, marginBottom: 4 },
  emptyListSubText: { fontSize: Typography.fontSizes.sm + 1, color: Colors.border },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md, marginTop: Spacing.lg },
  button: { flex: 0.47, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  cancelButton: { backgroundColor: Colors.surfaceSecondary },
  cancelButtonText: { color: Colors.textSecondary, fontSize: 15, fontWeight: Typography.fontWeights.bold },
  saveButton: { backgroundColor: Colors.primary },
  saveButtonText: { color: Colors.textOnPrimary, fontSize: 15, fontWeight: Typography.fontWeights.bold },
  modalSubtitle: { fontSize: Typography.fontSizes.sm, color: Colors.textTertiary, textAlign: 'center', marginBottom: Spacing.sm },
  footerLinks: { alignItems: 'center', marginTop: 4 },
  modalLink: { fontSize: Typography.fontSizes.sm + 1, color: Colors.primary, textDecorationLine: 'underline' },
});

export default CoordinateEditModal;
