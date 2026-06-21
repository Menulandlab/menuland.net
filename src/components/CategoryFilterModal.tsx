import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Colors from '../constants/Colors';

interface CategoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (searchText: string, sortBy: string) => void;
  initialSearchText: string;
  initialSortBy: string;
}

const CategoryFilterModal: React.FC<CategoryFilterModalProps> = ({
  visible,
  onClose,
  onApplyFilters,
  initialSearchText,
  initialSortBy,
}) => {
  const [searchText, setSearchText] = useState(initialSearchText);
  const [sortBy, setSortBy] = useState(initialSortBy);

  useEffect(() => {
    setSearchText(initialSearchText);
    setSortBy(initialSortBy);
  }, [initialSearchText, initialSortBy]);

  const handleApply = () => {
    onApplyFilters(searchText, sortBy);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Kategorileri Filtrele</Text>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Arama:</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Kategori Ara..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Sıralama:</Text>
            <View style={styles.sortOptions}>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'name_asc' && styles.sortButtonActive]}
                onPress={() => setSortBy('name_asc')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'name_asc' && styles.sortButtonTextActive]}>A-Z</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortBy === 'name_desc' && styles.sortButtonActive]}
                onPress={() => setSortBy('name_desc')}
              >
                <Text style={[styles.sortButtonText, sortBy === 'name_desc' && styles.sortButtonTextActive]}>Z-A</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
  },
  filterSection: {
    width: '100%',
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  searchInput: {
    height: 45,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: Colors.white,
    fontSize: 16,
  },
  sortOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  sortButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  sortButtonTextActive: {
    color: Colors.white,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  applyButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CategoryFilterModal;
