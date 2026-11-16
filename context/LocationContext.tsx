'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { webPublicClient } from '../lib/api';
import { slugify } from '../lib/utils';

export interface LocationData {
  cityId: string | null;
  cityName: string | null;
  districtId: string | null;
  districtName: string | null;
}

// 16.11.2026: 81 ilin hepsi seçilebilir; durum ("acik" / "yakinda") ve işletme sayısı API'nin il özetinden gelir.
export interface SehirSecenegi {
  id: number;
  name: string;
  durum?: 'acik' | 'yakinda';
  isletme_sayisi?: number;
}

export interface IlceSecenegi {
  id: number;
  name: string;
  isletme_sayisi?: number;
}

interface LocationContextType {
  location: LocationData;
  cities: SehirSecenegi[];
  districts: IlceSecenegi[];
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
  const [cities, setCities] = useState<SehirSecenegi[]>([]);
  const [districts, setDistricts] = useState<IlceSecenegi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Şehirleri yükle
  useEffect(() => {
    async function loadCities() {
      try {
        const response = await webPublicClient.get('/cities', { params: { ozet: 1 } });
        if (Array.isArray(response.data)) {
          setCities([...response.data].sort((a, b) => String(a.name).localeCompare(String(b.name), 'tr')));
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
              params: { city_id: parsed.cityId, ozet: 1 },
            });
            if (Array.isArray(res.data)) {
              setDistricts(res.data.filter((d: IlceSecenegi) => (d.isletme_sayisi ?? 1) > 0));
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
        params: { city_id: cityId, ozet: 1 },
      });
      const districtsList = Array.isArray(res.data) ? res.data.filter((d: IlceSecenegi) => (d.isletme_sayisi ?? 1) > 0) : [];
      setDistricts(districtsList);

      // İl seçilince ilçe "Tüm ilçeler" olur; önce alfabetik ilk ilçe kendiliğinden seçiliyordu (16.11.2026).
      const newLoc: LocationData = {
        cityId,
        cityName,
        districtId: null,
        districtName: null,
      };
      
      setLocation(newLoc);
      localStorage.setItem('@selectedLocation', JSON.stringify(newLoc));

      // SSR süreçleri için çerezleri de eşzamanlı olarak set et
      setCookie('selectedCityId', newLoc.cityId || '');
      setCookie('selectedCityName', newLoc.cityName || '');
      setCookie('selectedDistrictId', newLoc.districtId || '');
      setCookie('selectedDistrictName', newLoc.districtName || '');

      // Şehir değiştiğinde o ilin sayfası açılır (açık ilde mekânlar, diğerlerinde "yakında" sayfası).
      window.location.href = `/${slugify(cityName)}`;
    } catch (e) {
      console.error('İlçeler yüklenemedi:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Boş districtId "Tüm ilçeler" demektir.
  const selectDistrict = (districtId: string, districtName: string) => {
    const newLoc = {
      ...location,
      districtId: districtId || null,
      districtName: districtId ? districtName : null,
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
