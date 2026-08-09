import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { publicApiClient } from '../api/client';
import Colors from '../constants/Colors';

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
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: { city: City; district: District }) => void;
}

const SimpleLocationModal: React.FC<Props> = ({ visible, onClose, onLocationSelect }) => {
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  // Fetch cities on component mount
  useEffect(() => {
    if (visible && cities.length === 0) {
      fetchCities();
    }
  }, [visible]);

  const fetchCities = async () => {
    try {
      setIsLoadingCities(true);
      const response = await publicApiClient.get('/public/cities');
      
      // API yanıtı { success: true, data: [...] } formatında geliyor
      let cityData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        cityData = response.data.data;
      } else if (Array.isArray(response.data)) {
        cityData = response.data; // Fallback: doğrudan array gelirse
      }
      
      setCities(cityData);
    } catch (error) {
      console.error('Failed to fetch cities', error);
      setCities([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Fetch districts when city changes
  useEffect(() => {
    if (selectedCity) {
      fetchDistricts(selectedCity.id);
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedCity]);

  const fetchDistricts = async (cityId: number) => {
    try {
      setIsLoadingDistricts(true);
      setSelectedDistrict(null);
      const response = await publicApiClient.get(`/public/districts?city_id=${cityId}`);
      
      // API yanıtı { success: true, data: [...] } formatında geliyor
      let districtData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        districtData = response.data.data;
      } else if (Array.isArray(response.data)) {
        districtData = response.data; // Fallback: doğrudan array gelirse
      }
      
      setDistricts(districtData);
    } catch (error) {
      console.error('Failed to fetch districts', error);
      setDistricts([]);
    } finally {
      setIsLoadingDistricts(false);
    }
  };

  const handleSaveLocation = () => {
    if (selectedCity && selectedDistrict) {
      onLocationSelect({
        city: { id: selectedCity.id, name: selectedCity.name },
        district: {
          id: selectedDistrict.id,
          name: selectedDistrict.name,
          latitude: selectedDistrict.latitude,
          longitude: selectedDistrict.longitude
        },
      });
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedCity(null);
    setSelectedDistrict(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Konum Seç</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>İl</Text>
            <View style={styles.chipContainer}>
              {isLoadingCities ? (
                <ActivityIndicator color={Colors.primary} />
              ) : cities.length > 0 ? (
                cities.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    style={[
                      styles.chip,
                      selectedCity?.id === city.id && styles.chipSelected,
                    ]}
                    onPress={() => setSelectedCity(city)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCity?.id === city.id && styles.chipTextSelected,
                      ]}
                    >
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>İl bulunamadı.</Text>
              )}
            </View>

            {selectedCity && (
              <>
                <Text style={styles.sectionTitle}>İlçe</Text>
                <View style={styles.chipContainer}>
                  {isLoadingDistricts ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : districts.length > 0 ? (
                    districts.map((district) => (
                      <TouchableOpacity
                        key={district.id}
                        style={[
                          styles.chip,
                          selectedDistrict?.id === district.id && styles.chipSelected,
                        ]}
                        onPress={() => setSelectedDistrict(district)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            selectedDistrict?.id === district.id && styles.chipTextSelected,
                          ]}
                        >
                          {district.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>İlçe bulunamadı.</Text>
                  )}
                </View>
              </>
            )}

            <TouchableOpacity
              style={[
                styles.saveButton,
                !(selectedCity && selectedDistrict) && styles.saveButtonDisabled,
              ]}
              disabled={!(selectedCity && selectedDistrict)}
              onPress={handleSaveLocation}
            >
              <Text style={styles.saveButtonText}>Konumu Kaydet</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textLight,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SimpleLocationModal;
