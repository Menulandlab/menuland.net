import React, { forwardRef, useMemo, useState, useEffect, useCallback } from 'react';
// YENİ: ScrollView import edildi
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export type Ref = BottomSheetModal;

export interface FilterOptions {
  sortBy: 'default' | 'rating_desc' | 'distance_asc';
  isOpen: boolean;
  hasDelivery: boolean;
}

interface Props {
  initialFilters: FilterOptions;
  onApply: (filters: FilterOptions) => void;
}

const FilterSheet = forwardRef<Ref, Props>(({ initialFilters, onApply }, ref) => {
  // DEĞİŞİKLİK: Daha fazla içerik sığması için snapPoint biraz artırıldı.
  const snapPoints = useMemo(() => ['40%'], []);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
    onApply(filters);
    if (ref && typeof ref !== 'function') {
      ref.current?.dismiss();
    }
  };

  const Option = ({ title, value, selectedValue, onSelect }: { title: string; value: FilterOptions['sortBy']; selectedValue: string; onSelect: (value: any) => void }) => (
    <TouchableOpacity style={styles.option} onPress={() => onSelect(value)}>
      <Text style={[styles.optionText, selectedValue === value && styles.optionTextSelected]}>{title}</Text>
      {selectedValue === value && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
    </TouchableOpacity>
  );

  const Toggle = ({ title, value, onToggle }: { title: string; value: boolean; onToggle: (value: boolean) => void }) => (
    <TouchableOpacity style={styles.option} onPress={() => onToggle(!value)}>
      <Text style={styles.optionText}>{title}</Text>
      <View style={[styles.switch, value && styles.switchActive]}>
        <View style={[styles.switchHandle, value && styles.switchHandleActive]} />
      </View>
    </TouchableOpacity>
  );

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['38%']}
      backgroundStyle={{ backgroundColor: Colors.background }}
      handleIndicatorStyle={{ backgroundColor: Colors.textLight }}
      enablePanDownToClose={true}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <Text style={styles.title}>Sırala</Text>
            <Option title="Önerilen (Karışık)" value="default" selectedValue={filters.sortBy} onSelect={(val) => setFilters(f => ({ ...f, sortBy: val }))} />
            <Option title="Puana Göre (En Yüksek)" value="rating_desc" selectedValue={filters.sortBy} onSelect={(val) => setFilters(f => ({ ...f, sortBy: val }))} />
            <Option title="Yakınlığa Göre" value="distance_asc" selectedValue={filters.sortBy} onSelect={(val) => setFilters(f => ({ ...f, sortBy: val }))} />
            <View style={{ height: 8 }} />
            <Text style={styles.helperText}>
              • "Önerilen" seçiliyse mekanlar karışık gelir.
              {'\n'}• "Puana Göre" seçiliyse en yüksek puanlılar üstte olur.
              {'\n'}• "Yakınlığa Göre" seçiliyse en yakın mekanlar üstte olur.
            </Text>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

FilterSheet.displayName = "FilterSheet";

const styles = StyleSheet.create({
  // DEĞİŞİKLİK: contentContainer stili güncellendi
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 0,
    paddingTop: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'left',
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.textLight, textTransform: 'uppercase', marginBottom: 10, marginTop: 20 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  optionText: { fontSize: 16, color: Colors.text },
  optionTextSelected: { color: Colors.primary, fontWeight: 'bold' },
  switch: { width: 50, height: 30, borderRadius: 15, backgroundColor: '#e0e0e0', padding: 2, justifyContent: 'center' },
  switchActive: { backgroundColor: Colors.primary },
  switchHandle: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.white, alignSelf: 'flex-start' },
  switchHandleActive: { alignSelf: 'flex-end' },
  // YENİ: Footer ve güncellenmiş buton stili
  footer: {
    paddingTop: 10,
    paddingBottom: 20, // BottomSheet'in altıyla arasında boşluk bırakır
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: Colors.background, // Arka planla aynı renk
  },
  applyButton: { 
    backgroundColor: Colors.primary, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
  },
  applyButtonText: { color: Colors.white, fontSize: 18, fontWeight: 'bold' },
});

export default FilterSheet;