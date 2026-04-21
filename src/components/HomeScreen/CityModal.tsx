import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, FlatList, StyleSheet } from 'react-native';
import { X, Search, Check } from 'lucide-react-native';
import { CITIES } from '../../constants/mockDataHomeScreen';
import { Colors, Spacing, Typography, Radius } from '../../theme';
import type { City } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  onSelectCity: (city: City) => void;
  selectedCity: City | undefined;
}

const CityModal = ({ visible, onClose, searchText, onSearchChange, onSelectCity, selectedCity }: Props) => {
  const filteredCities = CITIES.filter(c =>
    c.label.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn Tỉnh/Thành</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} style={{ marginRight: Spacing.sm }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm tỉnh thành..."
              value={searchText}
              onChangeText={onSearchChange}
            />
          </View>

          <FlatList
            data={filteredCities}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityItem} onPress={() => onSelectCity(item)}>
                <Text
                  style={[
                    styles.cityItemText,
                    selectedCity?.value === item.value && styles.cityItemTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {selectedCity?.value === item.value && <Check size={20} color={Colors.primary} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    paddingTop: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    marginBottom: Spacing.xl,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    marginHorizontal: Spacing.xl,
    paddingHorizontal: 15,
    borderRadius: Radius.md,
    marginBottom: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSizes.base,
    color: Colors.textPrimary,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceSecondary,
  },
  cityItemText: {
    fontSize: Typography.fontSizes.base,
    color: Colors.textSecondary,
  },
  cityItemTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },
});

export default CityModal;
