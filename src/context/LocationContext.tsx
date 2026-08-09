import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { publicApiClient } from '../api/client';

interface LocationData {
  cityId: string | null;
  cityName: string | null;
  districtId: string | null;
  districtName: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface LocationContextType {
  location: LocationData;
  setLocation: (location: LocationData) => void;
  isLoading: boolean;
  testAutoDetect?: (lat: number, lng: number) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocationState] = useState<LocationData>({
    cityId: null,
    cityName: null,
    districtId: null,
    districtName: null,
    latitude: null,
    longitude: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const hasAutoCheckedRef = useRef(false);
  const currentLocationRef = useRef<LocationData>(location);

  useEffect(() => {
    const loadAndSetLocation = async () => {
      try {
        // ÖNCE depolanmış konum bilgilerini yükle (bu hızlı)
        const storedLocation = await AsyncStorage.getItem('@selectedLocation');
        let initialLocation: LocationData = {
          cityId: null,
          cityName: null,
          districtId: null,
          districtName: null,
          latitude: null,
          longitude: null,
        };

        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          initialLocation = parsedLocation;
          // Stored location'ı hemen set et ki uygulama çalışmaya başlasın
          currentLocationRef.current = initialLocation;
          setLocationState(initialLocation);
          setIsLoading(false); // Loading'i hemen kapat
        }

        // SONRA arka planda GPS konumunu al
        let currentGPSLocation = null;
        
        try {
          console.log('[LocationContext] Requesting location permissions...');
          let { status } = await Location.requestForegroundPermissionsAsync();
          console.log('[LocationContext] Permission status:', status);
          
          if (status === 'granted') {
            // Önce cached location'ı dene (anında gelir)
            try {
              console.log('[LocationContext] Trying cached location...');
              const lastKnownPosition = await Location.getLastKnownPositionAsync({
                maxAge: 300000, // Son 5 dakika içindeki konum
                requiredAccuracy: 1000, // 1km accuracy yeterli
              });
              
              if (lastKnownPosition) {
                console.log('[LocationContext] Cached location found:', lastKnownPosition.coords);
                currentGPSLocation = {
                  latitude: lastKnownPosition.coords.latitude,
                  longitude: lastKnownPosition.coords.longitude,
                };
                
                // Cached GPS varsa hemen güncelle
                setLocationState(prev => ({
                  ...prev,
                  latitude: currentGPSLocation!.latitude,
                  longitude: currentGPSLocation!.longitude,
                }));

                // Arka planda konum otomatik algılama
                autoDetectAndUpdateLocation(
                  currentGPSLocation.latitude,
                  currentGPSLocation.longitude
                );
              }
            } catch (cacheError) {
              console.log('[LocationContext] No cached location available');
            }
            
            // Arka planda fresh GPS konum almaya devam et
            if (!currentGPSLocation) {
              console.log('[LocationContext] Getting fresh GPS location...');
              // Timeout ile GPS alımı (maksimum 15 saniye bekle)
              const locationPromise = Location.getCurrentPositionAsync({
                // Android için Balanced accuracy daha iyi çalışır
                accuracy: Platform.OS === 'android' ? Location.Accuracy.Balanced : Location.Accuracy.Low,
              });
              
              const timeoutPromise = new Promise<null>((resolve) => 
                setTimeout(() => resolve(null), 15000)
              );
              
              const gpsLocation = await Promise.race([locationPromise, timeoutPromise]);
              
              if (gpsLocation) {
                console.log('[LocationContext] Fresh GPS location:', gpsLocation.coords);
                currentGPSLocation = {
                  latitude: gpsLocation.coords.latitude,
                  longitude: gpsLocation.coords.longitude,
                };
                
                // Fresh GPS varsa güncelle
                setLocationState(prev => ({
                  ...prev,
                  latitude: currentGPSLocation!.latitude,
                  longitude: currentGPSLocation!.longitude,
                }));

                // Arka planda konum otomatik algılama
                autoDetectAndUpdateLocation(
                  currentGPSLocation.latitude,
                  currentGPSLocation.longitude
                );
              } else {
                console.log('[LocationContext] GPS timeout - no location received');
              }
            }
          } else {
            console.log('[LocationContext] Location permission denied');
          }
        } catch (gpsError) {
          console.error('[LocationContext] GPS error:', gpsError);
        }

        // Eğer stored location yoksa, loading'i kapat
        if (!storedLocation) {
          setIsLoading(false);
        }

      } catch (e) {
        console.error('[LocationContext] Error loading location:', e);
        setIsLoading(false);
      }
    };
    loadAndSetLocation();
  }, []);

  const handleSetLocation = async (newLocation: LocationData) => {
    try {
      currentLocationRef.current = newLocation;
      setLocationState(newLocation);
      await AsyncStorage.setItem('@selectedLocation', JSON.stringify(newLocation));
    } catch (e) {
      console.error('Failed to save location to storage', e);
    }
  };

  const normalizeNameForMatch = (str: string) =>
    str
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .trim();

  const autoDetectAndUpdateLocation = async (lat: number, lng: number) => {
    if (hasAutoCheckedRef.current) return;
    hasAutoCheckedRef.current = true;

    try {
      const [geocode] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (!geocode) return;

      // iOS: region = il, district/subregion = ilçe
      // Android: region = il, district/subregion = ilçe
      const gpsCity = geocode.region || geocode.city;
      const gpsDistrict = geocode.district || geocode.subregion;

      if (!gpsCity) return;

      const citiesResponse = await publicApiClient.get('/cities', { params: { status: 'active' } });
      const cities: { id: number; name: string }[] = citiesResponse.data;

      const matchedCity = cities.find(
        (c) => normalizeNameForMatch(c.name) === normalizeNameForMatch(gpsCity)
      );
      if (!matchedCity) return;

      const districtsResponse = await publicApiClient.get('/districts', {
        params: { city_id: matchedCity.id, status: 'active' },
      });
      const districts: { id: number; name: string }[] = districtsResponse.data;

      let matchedDistrict: { id: number; name: string } | undefined;
      if (gpsDistrict) {
        // Tam eşleşme dene
        matchedDistrict = districts.find(
          (d) => normalizeNameForMatch(d.name) === normalizeNameForMatch(gpsDistrict)
        );
        // Tam eşleşme yoksa kısmi eşleşme dene (ör: "Giresun" → "Giresun Merkez")
        if (!matchedDistrict) {
          const normalGpsDistrict = normalizeNameForMatch(gpsDistrict);
          matchedDistrict = districts.find((d) =>
            normalizeNameForMatch(d.name).includes(normalGpsDistrict) ||
            normalGpsDistrict.includes(normalizeNameForMatch(d.name))
          );
        }
      }
      // Hâlâ bulunamadıysa şehir adıyla eşleşen ilçeyi dene (ör: "İzmir" → "İzmir Merkez")
      if (!matchedDistrict) {
        const normalCity = normalizeNameForMatch(matchedCity.name);
        matchedDistrict = districts.find((d) =>
          normalizeNameForMatch(d.name).includes(normalCity)
        );
      }
      // Son çare: "Merkez" ilçesini dene
      if (!matchedDistrict) {
        matchedDistrict = districts.find((d) =>
          normalizeNameForMatch(d.name).includes('merkez')
        );
      }
      // Hiç bulunamadıysa listedeki ilk aktif ilçeyi kullan
      if (!matchedDistrict && districts.length > 0) {
        matchedDistrict = districts[0];
      }

      const current = currentLocationRef.current;
      const cityChanged = String(matchedCity.id) !== current.cityId;
      const districtChanged =
        matchedDistrict && String(matchedDistrict.id) !== current.districtId;

      if (!cityChanged && !districtChanged) return;

      const locationLabel = matchedDistrict
        ? `${matchedDistrict.name}, ${matchedCity.name}`
        : matchedCity.name;

      Alert.alert(
        'Konumun Değişti',
        `${locationLabel} bölgesindesin. Menuland'ı bu konuma göre güncelleyelim mi?`,
        [
          { text: 'Hayır', style: 'cancel' },
          {
            text: 'Evet',
            onPress: () => {
              handleSetLocation({
                cityId: String(matchedCity.id),
                cityName: matchedCity.name,
                districtId: matchedDistrict ? String(matchedDistrict.id) : null,
                districtName: matchedDistrict ? matchedDistrict.name : null,
                latitude: lat,
                longitude: lng,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.log('[LocationContext] Auto-detect error:', error);
    }
  };

  const testAutoDetect = __DEV__
    ? async (lat: number, lng: number) => {
        hasAutoCheckedRef.current = false;
        await autoDetectAndUpdateLocation(lat, lng);
      }
    : undefined;

  return (
    <LocationContext.Provider value={{ location, setLocation: handleSetLocation, isLoading, testAutoDetect }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};