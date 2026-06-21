import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { forwardRef, useEffect, useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { publicApiClient } from '../api/client';
import Colors from '../constants/Colors';

export type Ref = BottomSheetModal;

interface City { 
  id: number; 
  name: string; 
}

interface District { 
  id: number; 
  name: string; 
  latitude?: number;
  longitude?: number;
}

interface Props { 
  onLocationSelect: (location: { city: City; district: District }) => void; 
}

const LocationSheet = forwardRef<Ref, Props>(({ onLocationSelect }, ref) => {
  const snapPoints = useMemo(() => ['50%'], []);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  // Fetch cities on component mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoadingCities(true);
        const response = await publicApiClient.get('/cities', { params: { status: 'active' } });
        
        let cityData = [];
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          cityData = response.data.data;
        } else if (Array.isArray(response.data)) {
          cityData = response.data;
        }
        
        setCities(cityData);
      } catch (error) { 
        console.error("Failed to fetch cities", error); 
        setCities([]);
      } finally { 
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    if (selectedCity) {
      const fetchDistricts = async () => {
        try {
          setIsLoadingDistricts(true);
          setSelectedDistrict(null);
          const response = await publicApiClient.get('/districts', { params: { city_id: selectedCity.id, status: 'active' } });
          
          let districtData = [];
          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            districtData = response.data.data;
          } else if (Array.isArray(response.data)) {
            districtData = response.data;
          }
          
          setDistricts(districtData);
        } catch (error) { 
          console.error("Failed to fetch districts", error); 
          setDistricts([]);
        } finally { 
          setIsLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedCity]);

  const handleCitySelect = useCallback((city: City) => {
    setSelectedCity(city);
  }, []);

  const handleDistrictSelect = useCallback((district: District) => {
    setSelectedDistrict(district);
  }, []);

  const handleSaveLocation = useCallback(() => {
    if (selectedCity && selectedDistrict) {
      onLocationSelect({ 
        city: { id: selectedCity.id, name: selectedCity.name }, 
        district: { 
          id: selectedDistrict.id, 
          name: selectedDistrict.name,
          latitude: selectedDistrict.latitude,
          longitude: selectedDistrict.longitude
        }
      });
    }
  }, [selectedCity, selectedDistrict, onLocationSelect]);

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
      backgroundStyle={{ backgroundColor: Colors.background }} 
      handleIndicatorStyle={{ backgroundColor: Colors.textLight }}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop} // Arka planı ekle
    >
      <BottomSheetView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          bounces={false}
        >
          <Text style={styles.title}>Konum Seç</Text>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>İl</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScrollViewContent}
              bounces={false}
            >
              {isLoadingCities ? (
                <ActivityIndicator color={Colors.primary} />
              ) : cities.length > 0 ? (
                cities.map(city => (
                  <TouchableOpacity 
                    key={city.id} 
                    style={[
                      styles.chip, 
                      selectedCity?.id === city.id && styles.chipSelected
                    ]} 
                    onPress={() => handleCitySelect(city)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.chipText, 
                      selectedCity?.id === city.id && styles.chipTextSelected
                    ]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>İl bulunamadı.</Text>
              )}
            </ScrollView>
          </View>
          
          {selectedCity && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>İlçe</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.horizontalScrollViewContent}
                bounces={false}
              >
                {isLoadingDistricts ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : districts.length > 0 ? (
                  districts.map(district => (
                    <TouchableOpacity 
                      key={district.id} 
                      style={[
                        styles.chip, 
                        selectedDistrict?.id === district.id && styles.chipSelected
                      ]} 
                      onPress={() => handleDistrictSelect(district)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.chipText, 
                        selectedDistrict?.id === district.id && styles.chipTextSelected
                      ]}>
                        {district.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>İlçe bulunamadı.</Text>
                )}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* Buton ScrollView dışında - her zaman görünür */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.button, 
              !(selectedCity && selectedDistrict) && styles.buttonDisabled
            ]} 
            disabled={!(selectedCity && selectedDistrict)} 
            onPress={handleSaveLocation}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Konumu Kaydet</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

LocationSheet.displayName = "LocationSheet";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20, // Azaltıldı (buton artık dışarıda)
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: Colors.text, 
    textAlign: 'center', 
    marginBottom: 20 
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: Colors.text, 
    marginBottom: 10, 
    alignSelf: 'flex-start' 
  },
  horizontalScrollViewContent: { 
    paddingVertical: 10,
    alignItems: 'center',
  },
  chip: { 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    backgroundColor: Colors.background, 
    borderRadius: 20, 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#ddd' 
  },
  chipSelected: { 
    backgroundColor: Colors.primary, 
    borderColor: Colors.primary 
  },
  chipText: { 
    fontSize: 16, 
    color: Colors.text 
  },
  chipTextSelected: { 
    color: Colors.white, 
    fontWeight: 'bold' 
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: { 
    backgroundColor: Colors.primary, 
    paddingVertical: 15, 
    borderRadius: 12, 
    alignItems: 'center',
  },
  buttonDisabled: { 
    backgroundColor: '#ccc' 
  },
  buttonText: { 
    color: Colors.white, 
    fontSize: 18, 
    fontWeight: 'bold' 
  }
});

export default LocationSheet;