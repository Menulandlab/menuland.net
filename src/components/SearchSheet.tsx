import React, { forwardRef, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop, BottomSheetTextInput, BottomSheetFlatList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { publicApiClient } from '../api/client';
import { getBusinessListingCategories, CategoryResponse } from '../api/businessService';
import { useLocation } from '../context/LocationContext';
import SearchResultItem from './SearchResultItem';
import RestaurantCard from './RestaurantCard';
import { useRouter } from 'expo-router';
import { debounce } from 'lodash';
import { Business } from '../types';

const RECENT_SEARCHES_KEY = '@recent_searches';
const MAX_RECENT = 8;

async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
async function saveRecentSearch(query: string, current: string[]): Promise<string[]> {
  const t = query.trim();
  if (!t) return current;
  const next = [t, ...current.filter(s => s.toLowerCase() !== t.toLowerCase())].slice(0, MAX_RECENT);
  try { await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)); } catch {}
  return next;
}
async function removeRecentSearch(query: string, current: string[]): Promise<string[]> {
  const next = current.filter(s => s !== query);
  try { await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)); } catch {}
  return next;
}
async function clearRecentSearches(): Promise<void> {
  try { await AsyncStorage.removeItem(RECENT_SEARCHES_KEY); } catch {}
}

export type Ref = BottomSheetModal;

interface Props {
  onSearchResults: (results: Business[]) => void;
  onDismiss: () => void;
}

// Haversine formülü ile iki nokta arası mesafe (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Stil tanımları
const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    height: 48,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, height: '100%', fontSize: 16, color: Colors.text },
  activeCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 2,
  },
  activeCategoryText: { fontSize: 12, color: Colors.primary, fontWeight: '500' },
  resultCount: { fontSize: 12, color: Colors.textLight, marginHorizontal: 16, marginTop: 10, marginBottom: 0 },
  // Sections
  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 12 },
  clearAllText: { fontSize: 13, color: Colors.primary, fontWeight: '500' },
  // Son aramalar
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.backgroundLight,
  },
  recentText: { flex: 1, fontSize: 14, color: Colors.text },
  // Chip
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: { fontSize: 13, color: Colors.text, fontWeight: '500' },
  // Yakın mekanlar
  seeAllText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  nearbyScrollContainer: { paddingLeft: 0, paddingRight: 8 },
  nearbyCardContainer: { marginRight: 8, width: 150 },
  emptyContainer: { flex: 1, padding: 50, alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.textLight, textAlign: 'center', lineHeight: 20 },
});

const SearchSheet = forwardRef<Ref, Props>(({ onSearchResults, onDismiss }, ref) => {
  const snapPoints = useMemo(() => ['65%'], []);
  const { location } = useLocation();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<Business[]>([]);
  const [nearbyBusinesses, setNearbyBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(null);

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const onSearchResultsRef = useRef(onSearchResults);
  useEffect(() => {
    onSearchResultsRef.current = onSearchResults;
  }, [onSearchResults]);

  // En yakın işletmeleri çek
  const fetchNearbyBusinesses = useCallback(async () => {
    if (!locationRef.current.cityId || !locationRef.current.districtId) return;
    
    try {
      const response = await publicApiClient.get('/businesses', {
        params: { 
          city_id: locationRef.current.cityId, 
          district_id: locationRef.current.districtId,
          limit: 10
        },
      });
      
      if (Array.isArray(response.data)) {
        let businesses = response.data.filter(b => b.latitude && b.longitude);
        let userLat = typeof locationRef.current.latitude === 'string' ? parseFloat(locationRef.current.latitude) : locationRef.current.latitude;
        let userLon = typeof locationRef.current.longitude === 'string' ? parseFloat(locationRef.current.longitude) : locationRef.current.longitude;
        
        if (userLat && userLon) {
          businesses = businesses.map(b => ({
            ...b,
            distance: b.latitude && b.longitude ? calculateDistance(userLat, userLon, parseFloat(b.latitude), parseFloat(b.longitude)) : undefined
          }));
          
          // Mesafeye göre sırala ve en yakın 6 tanesini al
          businesses = businesses
            .filter(b => b.distance !== undefined)
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
            .slice(0, 6);
        } else {
          // Konum yoksa rastgele 6 işletme seç
          businesses = businesses.slice(0, 6);
        }
        
        setNearbyBusinesses(businesses);
      } else {
        setNearbyBusinesses([]);
      }
    } catch (error) {
      console.error("Yakın işletmeler çekilirken hata:", error);
      setNearbyBusinesses([]);
    }
  }, [location.latitude, location.longitude, location.cityId, location.districtId]);

  // SearchSheet açıldığında son aramalar ve kategorileri yükle
  useEffect(() => {
    loadRecentSearches().then(setRecentSearches);
    getBusinessListingCategories().then(cats => setCategories(cats.slice(0, 12)));
  }, []);

  // SearchSheet açıldığında ve konum değiştiğinde yakın işletmeleri çek
  useEffect(() => {
    fetchNearbyBusinesses();
  }, [fetchNearbyBusinesses]);

  const performSearch = useCallback(async (query: string, categoryId?: number | null) => {
    const isText = !!query && query.length >= 2;
    const isCat = !!categoryId;
    if (!isText && !isCat) {
      setResults([]);
      setLoading(false);
      onSearchResultsRef.current([]);
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const params: Record<string, any> = {
        city_id: locationRef.current.cityId,
        district_id: locationRef.current.districtId,
      };
      if (isText) params.search = query;
      if (isCat) params.category_id = categoryId;
      const response = await publicApiClient.get('/businesses', { params });
      if (Array.isArray(response.data)) {
        let businesses = response.data.filter((b: any) => b.latitude && b.longitude);
        const userLat = typeof locationRef.current.latitude === 'string' ? parseFloat(locationRef.current.latitude) : locationRef.current.latitude;
        const userLon = typeof locationRef.current.longitude === 'string' ? parseFloat(locationRef.current.longitude) : locationRef.current.longitude;
        if (userLat && userLon) {
          businesses = businesses.map((b: any) => ({
            ...b,
            distance: calculateDistance(userLat, userLon, parseFloat(b.latitude), parseFloat(b.longitude)),
          }));
        }
        setResults(businesses);
        onSearchResultsRef.current(businesses);
      } else {
        setResults([]);
        onSearchResultsRef.current([]);
      }
    } catch (error) {
      console.error('Arama hatası:', error);
      setResults([]);
      onSearchResultsRef.current([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce(performSearch, 500), [performSearch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleTextChange = useCallback((text: string) => {
    setSearchText(text);
    setActiveCategoryId(null);
    setActiveCategoryName(null);
    if (text.length === 0) {
      setHasSearched(false);
      setResults([]);
      onSearchResultsRef.current([]);
    } else {
      debouncedSearch(text, null);
    }
  }, [debouncedSearch]);

  const handleSubmitEditing = useCallback(() => {
    if (searchText.trim().length >= 2) {
      debouncedSearch.cancel();
      saveRecentSearch(searchText.trim(), recentSearches).then(setRecentSearches);
      performSearch(searchText.trim(), null);
    }
  }, [searchText, performSearch, debouncedSearch, recentSearches]);

  const handleSuggestionPress = useCallback((query: string) => {
    setSearchText(query);
    setActiveCategoryId(null);
    setActiveCategoryName(null);
    setHasSearched(true);
    debouncedSearch.cancel();
    saveRecentSearch(query, recentSearches).then(setRecentSearches);
    performSearch(query, null);
  }, [performSearch, debouncedSearch, recentSearches]);

  const handleCategoryPress = useCallback((cat: CategoryResponse) => {
    setSearchText('');
    setActiveCategoryId(cat.id);
    setActiveCategoryName(cat.name);
    debouncedSearch.cancel();
    performSearch('', cat.id);
  }, [performSearch, debouncedSearch]);

  const handleRemoveRecent = useCallback(async (query: string) => {
    const updated = await removeRecentSearch(query, recentSearches);
    setRecentSearches(updated);
  }, [recentSearches]);

  const handleClearAllRecent = useCallback(async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const handleResultPress = useCallback((item: Business) => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.dismiss();
    }
    if (searchText.trim().length >= 2) {
      saveRecentSearch(searchText.trim(), recentSearches).then(setRecentSearches);
    }
    router.push({
      pathname: `/(details)/business/${item.id}`,
      params: item.distance != null ? { distance: item.distance.toString() } : undefined
    });
  }, [router, ref, searchText, recentSearches]);

  const handleBusinessCardPress = useCallback((item: Business) => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.dismiss();
    }
    router.push({
      pathname: `/(details)/business/${item.id}`,
      params: item.distance != null ? { distance: item.distance.toString() } : undefined
    });
  }, [router, ref]);

  const handleSeeAllPress = useCallback(() => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.dismiss();
    }
    router.push('/all-businesses');
  }, [router, ref]);

  const renderItem = useCallback(({ item }: { item: Business }) => (
    <SearchResultItem
      item={{ ...item, distance: item.distance ?? 0 }}
      onPress={handleResultPress}
    />
  ), [handleResultPress]);

  const keyExtractor = useCallback((item: Business) => item.id.toString(), []);

  const ListEmptyComponent = useMemo(() => {
    if (!hasSearched) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {activeCategoryName
            ? `"${activeCategoryName}" kategorisinde mekan bulunamadi.`
            : `"${searchText}" icin sonuc bulunamadi.`}
        </Text>
      </View>
    );
  }, [hasSearched, searchText, activeCategoryName]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior='close'
      />
    ),
    []
  );

  return (
    <BottomSheetModal 
      ref={ref} 
      index={0} 
      snapPoints={snapPoints} 
      backgroundStyle={{ backgroundColor: Colors.backgroundLight }} 
      handleIndicatorStyle={{ backgroundColor: Colors.text }} 
      onDismiss={onDismiss}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.container}>
        {/* Arama kutusu */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
          <BottomSheetTextInput
            placeholder="Mekan adi veya anahtar kelime..."
            style={styles.input}
            value={searchText}
            onChangeText={handleTextChange}
            onSubmitEditing={handleSubmitEditing}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
          {(searchText.length > 0 || activeCategoryId !== null) && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setActiveCategoryId(null);
                setActiveCategoryName(null);
                setHasSearched(false);
                setResults([]);
                onSearchResultsRef.current([]);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>

        {/* Aktif kategori etiketi */}
        {activeCategoryName && (
          <View style={styles.activeCategoryRow}>
            <Ionicons name="pricetag-outline" size={13} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.activeCategoryText}>{activeCategoryName}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.primary} />
        ) : (
          <View style={{ flex: 1 }}>
            {/* Arama / Kategori Sonuçları */}
            {hasSearched && (
              <View style={{ flex: 1 }}>
                {results.length > 0 && (
                  <Text style={styles.resultCount}>{results.length} mekan bulundu</Text>
                )}
                <BottomSheetFlatList
                  data={results}
                  renderItem={renderItem}
                  keyExtractor={keyExtractor}
                  ListEmptyComponent={ListEmptyComponent}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 24 }}
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            )}

            {/* Varsayilan gorunum */}
            {!hasSearched && (
              <BottomSheetScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* Son Aramalar */}
                {recentSearches.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Son Aramalar</Text>
                      <TouchableOpacity onPress={handleClearAllRecent}>
                        <Text style={styles.clearAllText}>Temizle</Text>
                      </TouchableOpacity>
                    </View>
                    {recentSearches.map((query) => (
                      <TouchableOpacity
                        key={query}
                        style={styles.recentRow}
                        onPress={() => handleSuggestionPress(query)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="time-outline" size={18} color={Colors.textLight} style={{ marginRight: 12 }} />
                        <Text style={styles.recentText} numberOfLines={1}>{query}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveRecent(query)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={{ marginLeft: 8 }}
                        >
                          <Ionicons name="close" size={16} color={Colors.textLight} />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Kategoriler */}
                {categories.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Kategoriler</Text>
                    <View style={styles.chipWrap}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={styles.chip}
                          onPress={() => handleCategoryPress(cat)}
                          activeOpacity={0.75}
                        >
                          <Text style={styles.chipText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Size En Yakin Mekanlar */}
                {nearbyBusinesses.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Size En Yakin Mekanlar</Text>
                      <TouchableOpacity onPress={handleSeeAllPress}>
                        <Text style={styles.seeAllText}>Tumu</Text>
                      </TouchableOpacity>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.nearbyScrollContainer}
                    >
                      {nearbyBusinesses.map((business) => (
                        <View key={business.id} style={styles.nearbyCardContainer}>
                          <RestaurantCard
                            restaurant={{ ...business, distance: business.distance ?? 0 }}
                            onPress={() => handleBusinessCardPress(business)}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {recentSearches.length === 0 && categories.length === 0 && nearbyBusinesses.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Aramaya baslamak icin yazin...</Text>
                  </View>
                )}
              </BottomSheetScrollView>
            )}
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

SearchSheet.displayName = "SearchSheet";

export default SearchSheet;
