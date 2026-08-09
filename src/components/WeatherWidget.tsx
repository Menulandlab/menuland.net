import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import axios from 'axios';
import { WEATHER_API_KEY } from '@env';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';

// Zamana göre akıllı öneri oluşturma fonksiyonu
const getTimeBasedSuggestion = (conditionCode: number, hour: number): { comment: string; categoryId: number; categoryName: string; } => {
  // Gece (01:00-08:00): Sessiz öneriler, daha çok planlama odaklı
  if (hour >= 1 && hour < 8) {
    if (conditionCode === 1000) {
      return { comment: "Yarın güneşli olacak! Açık hava planları yapabilirsin.", categoryId: 27, categoryName: "Teras / Manzaralı" };
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
      return { comment: "Yağmurlu bir gün olacak, evde keyif yapabilirsin.", categoryId: 33, categoryName: "Paket Servis" };
    } else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225].includes(conditionCode)) {
      return { comment: "Karlı bir gün olacak, sıcak planlar yapabilirsin.", categoryId: 54, categoryName: "Ocakbaşı" };
    } else {
      return { comment: "Güne hazırlan! İyi uykular.", categoryId: 33, categoryName: "Paket Servis" };
    }
  }
  
  // Sabah (08:00-12:00): Kahvaltı, kahve önerileri
  if (hour >= 8 && hour < 12) {
    if (conditionCode === 1000) {
      return { comment: "Güneşli bir sabah! Kahvaltı keyfi yapmaya ne dersin?", categoryId: 73, categoryName: "Kahve" };
    } else if ([1003, 1006, 1009].includes(conditionCode)) {
      return { comment: "Bulutlu bir sabah, kahve molası harika olur.", categoryId: 73, categoryName: "Kahve" };
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
      return { comment: "Yağmurlu sabah, sıcak bir kahve iyi gider.", categoryId: 73, categoryName: "Kahve" };
    } else {
      return { comment: "Güne güzel bir kahve ile başla!", categoryId: 73, categoryName: "Kahve" };
    }
  }
  
  // Öğle (12:00-17:00): Öğle yemeği önerileri
  if (hour >= 12 && hour < 17) {
    if (conditionCode === 1000) {
      return { comment: "Güneşli bir öğle! Dışarıda yemek keyifli olabilir.", categoryId: 27, categoryName: "Teras / Manzaralı" };
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
      return { comment: "Yağmurlu öğle, pizza sipariş edebilirsin.", categoryId: 3, categoryName: "Pizza" };
    } else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225].includes(conditionCode)) {
      return { comment: "Karlı öğle, kebap harika bir seçenek.", categoryId: 10, categoryName: "Döner & Kebap" };
    } else {
      return { comment: "Öğle yemeği vaktinde acıktın mı?", categoryId: 13, categoryName: "Ev Yemekleri" };
    }
  }
  
  // Akşam (17:00-22:00): Akşam yemeği ve sosyal öneriler
  if (hour >= 17 && hour < 22) {
    if (conditionCode === 1000) {
      return { comment: "Güzel bir akşam! Dışarıda yemek güzel olabilir.", categoryId: 27, categoryName: "Teras / Manzaralı" };
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
      return { comment: "Yağmurlu akşam, burger keyfi yapmaya ne dersin?", categoryId: 43, categoryName: "Burger" };
    } else if ([1066, 1114, 1210, 1213, 1216, 1219, 1222, 1225].includes(conditionCode)) {
      return { comment: "Karlı akşam, ocakbaşı seni bekliyor olabilir.", categoryId: 54, categoryName: "Ocakbaşı" };
    } else {
      return { comment: "Akşam yemeği için dışarı çıkmaya ne dersin?", categoryId: 13, categoryName: "Ev Yemekleri" };
    }
  }
  
  // Gece (22:00-01:00): Hafif atıştırmalık, tatlı önerileri
  if (hour >= 22 || hour < 1) {
    if (conditionCode === 1000) {
      return { comment: "Güzel bir gece! Tatlı bir şeyler keyifli olabilir.", categoryId: 6, categoryName: "Tatlı" };
    } else if ([1063, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243, 1246].includes(conditionCode)) {
      return { comment: "Yağmurlu gece, paket servis güzel bir seçenek.", categoryId: 33, categoryName: "Paket Servis" };
    } else {
      return { comment: "Geç saatte canın tatlı mı çekti?", categoryId: 6, categoryName: "Tatlı" };
    }
  }
  
  // Varsayılan (fallback)
  return weatherConditionsMap[conditionCode] || weatherConditionsMap[1003];
};

// Hava durumu kodlarına göre yorum ve kategori eşleştirmesi (varsayılan - zaman bazlı öneri yoksa kullanılır)
// Kod listesi: https://www.weatherapi.com/docs/weather_conditions.json
const weatherConditionsMap: { [key: number]: { comment: string; categoryId: number; categoryName: string; } } = {
  // Clear / Sunny
  1000: { comment: "Güneşli bir gün! Dondurma harika bir fikir olabilir.", categoryId: 58, categoryName: "Dondurma" },
  // Cloudy / Overcast
  1003: { comment: "Hava parçalı bulutlu, kahve molası kulağa hoş geliyor.", categoryId: 73, categoryName: "Kahve" },
  1006: { comment: "Bulutlu bir gün, teras keyfi yapmaya ne dersin?", categoryId: 27, categoryName: "Teras / Manzaralı" },
  1009: { comment: "Kapalı havada sıcak bir çay içimizi ısıtır.", categoryId: 15, categoryName: "Çay Bahçesi" },
  // Mist / Fog
  1030: { comment: "Hava biraz sisli, sıcak bir çorba iyi gider.", categoryId: 74, categoryName: "Çorba" },
  1135: { comment: "Sisli havada sıcak bir çorbaya ne dersin?", categoryId: 74, categoryName: "Çorba" },
  1147: { comment: "Dondurucu soğukta sıcak bir çorba harika olur.", categoryId: 74, categoryName: "Çorba" },
  // Rain / Drizzle
  1063: { comment: "Yağmur ihtimali var, pizzacıda keyif yapabilirsin.", categoryId: 3, categoryName: "Pizza" },
  1150: { comment: "Hafif yağmur eşliğinde kahve ve kitap keyfi...", categoryId: 14, categoryName: "Kafe" },
  1153: { comment: "Hafif yağmur var, tatlı bir kaçamak yapalım mı?", categoryId: 6, categoryName: "Tatlı" },
  1180: { comment: "Yağmurun tadını güzel bir kahveyle çıkarabilirsin.", categoryId: 73, categoryName: "Kahve" },
  1183: { comment: "Yağmurlu havada İtalyan mutfağı çok yakışır.", categoryId: 48, categoryName: "İtalyan Mutfağı" },
  1186: { comment: "Yağmur yağıyor, lezzetli bir burger deneyebilirsin.", categoryId: 43, categoryName: "Burger" },
  1189: { comment: "Böyle havada güzel bir burger fena olmaz.", categoryId: 43, categoryName: "Burger" },
  1192: { comment: "Sağanak yağış var, ev yemekleri sipariş edebilirsin.", categoryId: 33, categoryName: "Paket Servis" },
  1195: { comment: "Şiddetli yağmurda dışarı çıkmayıp paket söyleyebilirsin.", categoryId: 33, categoryName: "Paket Servis" },
  1240: { comment: "Hafif sağanak, bir kafede oturmak iyi gelebilir.", categoryId: 14, categoryName: "Kafe" },
  1243: { comment: "Şiddetli sağanak, evde pizza keyfi yapmaya ne dersin?", categoryId: 3, categoryName: "Pizza" },
  1246: { comment: "Böyle yağmurlarda en güzeli evde yemek.", categoryId: 13, categoryName: "Ev Yemekleri" },
  // Snow
  1066: { comment: "Kar ihtimali var, ocakbaşı keyfi güzel olabilir.", categoryId: 54, categoryName: "Ocakbaşı" },
  1114: { comment: "Kar lapa lapa, kebap yemek harika olurdu.", categoryId: 10, categoryName: "Döner & Kebap" },
  1210: { comment: "Hafif kar yağışlı, sıcak bir yemek iyi gider.", categoryId: 13, categoryName: "Ev Yemekleri" },
  1213: { comment: "Kar yağıyor, ocakbaşı seni bekliyor olabilir.", categoryId: 54, categoryName: "Ocakbaşı" },
  1216: { comment: "Yer yer kar, sıcak bir çorbaya kim hayır der?", categoryId: 74, categoryName: "Çorba" },
  1219: { comment: "Karlı havada kebap harika bir seçenek.", categoryId: 10, categoryName: "Döner & Kebap" },
  1222: { comment: "Yoğun kar yağışı, evde sıcak vakit geçirebilirsin.", categoryId: 33, categoryName: "Paket Servis" },
  1225: { comment: "Çok yoğun kar, paket servis söylemek en iyisi.", categoryId: 33, categoryName: "Paket Servis" },
  // Thunder
  1087: { comment: "Gök gürültülü, güvenli bir yerde mola verebilirsin.", categoryId: 14, categoryName: "Kafe" },
  1273: { comment: "Gök gürültülü yağmur, pizza söylemeye ne dersin?", categoryId: 3, categoryName: "Pizza" },
  1276: { comment: "Fırtınalı yağmur, evde kalmak en güzeli.", categoryId: 33, categoryName: "Paket Servis" },
  1279: { comment: "Hafif karlı fırtına, sıcak bir şeyler içmek iyi gelir.", categoryId: 73, categoryName: "Kahve" },
  1282: { comment: "Yoğun karlı fırtına, evde güvende kalabilirsin.", categoryId: 33, categoryName: "Paket Servis" },
  // Other
  1069: { comment: "Sulu sepken, sıcak bir tatlı gününü güzelleştirir.", categoryId: 6, categoryName: "Tatlı" },
  1072: { comment: "Dondurucu çisenti, sıcak çorba iyi bir tercih.", categoryId: 74, categoryName: "Çorba" }
};

const WeatherWidget = () => {
  const { location: selectedLocation } = useLocation();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchByCoords = async (lat: number, lon: number) => {
      const weatherResponse = await axios.get(`https://api.weatherapi.com/v1/current.json`, {
        params: { key: WEATHER_API_KEY, q: `${lat},${lon}`, lang: 'tr', aqi: 'no' },
      });
      return weatherResponse.data;
    };

    const fetchByQuery = async (query: string) => {
      const geoResponse = await axios.get(`https://api.weatherapi.com/v1/search.json`, {
        params: { key: WEATHER_API_KEY, q: query },
      });
      if (Array.isArray(geoResponse.data) && geoResponse.data.length > 0) {
        const { lat, lon } = geoResponse.data[0];
        return await fetchByCoords(lat, lon);
      }
      throw new Error('location_not_found');
    };

    const fetchWeather = async () => {
      setLoading(true);
      setErrorMsg(null);
      setWeather(null);
      try {
        // 1) Seçili ilçe + şehir kombosu (her zaman öncelikli)
        if (selectedLocation.districtName && selectedLocation.cityName) {
          try {
            const data = await fetchByQuery(`${selectedLocation.districtName}, ${selectedLocation.cityName}`);
            setWeather(data);
            return;
          } catch (_) { /* fallthrough */ }
        }

        // 2) Sadece şehir adı
        if (selectedLocation.cityName) {
          try {
            const data = await fetchByQuery(`${selectedLocation.cityName}`);
            setWeather(data);
            return;
          } catch (_) { /* fallthrough */ }
        }

        // 3) GPS koordinatları (fallback - ilçe seçili değilse)
        if (selectedLocation.latitude && selectedLocation.longitude) {
          const data = await fetchByCoords(selectedLocation.latitude, selectedLocation.longitude);
          setWeather(data);
          return;
        }

        setErrorMsg('Konum seçili değil. Lütfen şehir ve ilçe belirleyin.');
      } catch (error: any) {
        if (error?.message === 'location_not_found') {
          setErrorMsg('Seçili konum için bilgi bulunamadı.');
        } else {
          setErrorMsg('Hava durumu bilgisi alınamadı.');
        }
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedLocation.cityName, selectedLocation.districtName, selectedLocation.latitude, selectedLocation.longitude]);

  const handleWidgetPress = () => {
    if (weather && weather.current) {
      const conditionCode = weather.current.condition.code;
      const currentHour = new Date().getHours();
      const condition = getTimeBasedSuggestion(conditionCode, currentHour);

      router.push({
        pathname: `/(details)/businesses-by-category/${condition.categoryId}`,
        params: {
          name: condition.categoryName,
        },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#888" />
        <Text style={styles.text}>Hava durumu yükleniyor...</Text>
      </View>
    );
  }

  if (errorMsg || !weather) {
    return (
      <View style={styles.container}>
        <Ionicons name="cloud-offline-outline" size={24} color="#555" />
        <Text style={styles.text}>{errorMsg || 'Hava durumu alınamadı.'}</Text>
      </View>
    );
  }

  const { current } = weather;
  const conditionCode = current.condition.code;
  
  // Şu anki saati al (0-23)
  const currentHour = new Date().getHours();
  
  // Zamana göre akıllı öneri al
  const conditionData = getTimeBasedSuggestion(conditionCode, currentHour);

  return (
    <TouchableOpacity style={styles.container} onPress={handleWidgetPress}>
      <Image source={{ uri: `https:${current.condition.icon}` }} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.locationText}>{weather.location.name}, {current.temp_c}°C</Text>
        <Text style={styles.text}>{conditionData.comment}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#888" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  icon: {
    width: 40,
    height: 40,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  locationText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  text: {
    fontSize: 13,
    color: '#555',
  },
});

export default WeatherWidget;
