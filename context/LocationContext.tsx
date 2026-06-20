'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { webPublicClient } from '../lib/api';

export interface LocationData {
  cityId: string | null;
  cityName: string | null;
  districtId: string | null;
  districtName: string | null;
}

interface LocationContextType {
  location: LocationData;
  cities: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  isLoading: boolean;
  selectCity: (cityId: string, cityName: string) => Promise<void>;
  selectDistrict: (districtId: string, districtName: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Cookie yardımcısı
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<LocationData>({
    cityId: null,
    cityName: null,
    districtId: null,
    districtName: null,
  });
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Şehirleri yükle
  useEffect(() => {
    async function loadCities() {
      try {
        const response = await webPublicClient.get('/cities', { params: { status: 'active' } });
        if (Array.isArray(response.data)) {
          setCities(response.data);
        }
      } catch (e) {
        console.error('Şehirler yüklenirken hata oluştu:', e);
      }
    }
    loadCities();
  }, []);

  // Kayıtlı konumu yükle (Çerezlerden veya localStorage'dan)
  useEffect(() => {
    async function loadStoredLocation() {
      try {
        const stored = localStorage.getItem('@selectedLocation');
        if (stored) {
          const parsed = JSON.parse(stored) as LocationData;
          setLocation(parsed);
          
          if (parsed.cityId) {
            const res = await webPublicClient.get('/districts', {
              params: { city_id: parsed.cityId, status: 'active' },
            });
            if (Array.isArray(res.data)) {
              setDistricts(res.data);
            }
          }
        }
      } catch (e) {
        console.error('Kayıtlı konum yüklenirken hata oluştu:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStoredLocation();
  }, []);

  const selectCity = async (cityId: string, cityName: string) => {
    setIsLoading(true);
    try {
      const res = await webPublicClient.get('/districts', {
        params: { city_id: cityId, status: 'active' },
      });
      const districtsList = Array.isArray(res.data) ? res.data : [];
      setDistricts(districtsList);

      const newLoc: LocationData = {
        cityId,
        cityName,
        districtId: districtsList.length > 0 ? String(districtsList[0].id) : null,
        districtName: districtsList.length > 0 ? districtsList[0].name : null,
      };
      
      setLocation(newLoc);
      localStorage.setItem('@selectedLocation', JSON.stringify(newLoc));

      // SSR süreçleri için çerezleri de eşzamanlı olarak set et
      setCookie('selectedCityId', newLoc.cityId || '');
      setCookie('selectedCityName', newLoc.cityName || '');
      setCookie('selectedDistrictId', newLoc.districtId || '');
      setCookie('selectedDistrictName', newLoc.districtName || '');

      // Şehir değiştiğinde sayfayı yenileyerek yeni şehre göre popüler restoranları getir
      window.location.reload();
    } catch (e) {
      console.error('İlçeler yüklenemedi:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectDistrict = (districtId: string, districtName: string) => {
    const newLoc = {
      ...location,
      districtId,
      districtName,
    };
    setLocation(newLoc);
    localStorage.setItem('@selectedLocation', JSON.stringify(newLoc));

    setCookie('selectedDistrictId', districtId);
    setCookie('selectedDistrictName', districtName);

    // Sayfayı yenileyerek yeni lokasyona göre verileri çek
    window.location.reload();
  };

  return (
    <LocationContext.Provider value={{ location, cities, districts, isLoading, selectCity, selectDistrict }}>
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
