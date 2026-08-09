import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, FlatList, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Image } from 'expo-image';
import { publicApiClient } from '../api/client';
import { getBusinesses } from '../api/businessService';
import { useLocation } from '../context/LocationContext';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';

interface Ad {
  id: number;
  image_url: string; // fallback
  image_url_thumb?: string;
  image_url_medium?: string;
  link?: string;
  business_id?: number;
  business_name?: string;
  distance?: number; // Uzaklık bilgisi eklendi
  end_time?: string; // Reklam bitiş tarihi
}

const { width } = Dimensions.get('window');
const adHeight = 160;

const AdBanner = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const { location } = useLocation();
  const router = useRouter();
  const flatListRef = useRef<FlatList<Ad>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Haversine formülü ile iki nokta arası mesafe (km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (!location.districtId) return;

    const fetchAds = async () => {
      try {
        const response = await publicApiClient.get(`/ads?placement=carousel&district_id=${location.districtId}`);
        if (Array.isArray(response.data)) {
          // Önce süre dolmuş reklamları filtrele
          let adsData: Ad[] = response.data.filter((ad: any) => {
            if (ad.end_time) {
              const endTime = new Date(ad.end_time);
              const now = new Date();
              return endTime > now; // Sadece bitiş tarihi gelmemiş reklamları göster
            }
            return true; // end_time yoksa göster
          });
          
          // Kullanıcının konumu varsa, business_id'li reklamlar için uzaklık hesapla
          const userLat = location.latitude;
          const userLon = location.longitude;
          
          if (userLat && userLon) {
            const businessIds = adsData.filter(ad => ad.business_id).map(ad => ad.business_id!);
            
            if (businessIds.length > 0) {
              const businessesWithCoords = await getBusinesses({ ids: businessIds });

              if (Array.isArray(businessesWithCoords)) {
                const parsedUserLat = typeof userLat === 'string' ? parseFloat(userLat) : userLat;
                const parsedUserLon = typeof userLon === 'string' ? parseFloat(userLon) : userLon;
                
                adsData = adsData.map(ad => {
                  if (ad.business_id) {
                    const business = businessesWithCoords.find((b: any) => b.id === ad.business_id);
                    if (business && business.latitude && business.longitude && parsedUserLat && parsedUserLon) {
                      const businessLat = typeof business.latitude === 'string' ? parseFloat(business.latitude) : business.latitude;
                      const businessLon = typeof business.longitude === 'string' ? parseFloat(business.longitude) : business.longitude;
                      
                      if (businessLat && businessLon) {
                        return {
                          ...ad,
                          distance: calculateDistance(parsedUserLat, parsedUserLon, businessLat, businessLon)
                        };
                      }
                    }
                  }
                  return ad;
                });
              }
            }
          }
          
          setAds(adsData);
        }
      } catch (error) {
        console.error("Failed to fetch carousel ads:", error);
      }
    };
    fetchAds();
  }, [location.districtId, location.latitude, location.longitude]);

  useEffect(() => {
    if (ads.length === 0) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % ads.length;
      flatListRef.current?.scrollToIndex({ animated: true, index: nextIndex });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(interval);
  }, [ads, activeIndex]);

  const handlePress = (item: Ad) => {
    if (item.link) {
      router.push({ pathname: `/(details)/event/${item.id}`, params: { url: item.link } });
    } else if (item.business_id) {
      // Business detayına giderken distance parametresini de geç
      const params: any = {};
      if (item.distance != null && !isNaN(Number(item.distance))) {
        params.distance = item.distance.toString();
      }
      
      router.push({
        pathname: `/(details)/business/${item.business_id}`,
        params: Object.keys(params).length > 0 ? params : undefined
      });
    }
  };

  const renderItem = ({ item }: { item: Ad }) => (
    <TouchableOpacity style={styles.slide} onPress={() => handlePress(item)}>
      <Image 
        source={{ uri: item.image_url_thumb || item.image_url }} 
        style={styles.image} 
        contentFit="cover"
        transition={200}
        cachePolicy="memory"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (ads.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ads}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={width - 16}
        snapToAlignment="start"
        decelerationRate="fast"
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: width - 16,
          offset: (width - 16) * index,
          index,
        })}
      />
      {ads.length > 1 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationText}>{`${activeIndex + 1}/${ads.length}`}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 10,
  },
  listContentContainer: {
    paddingHorizontal: 16,
  },
  slide: {
    width: width - 32,
    height: adHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paginationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default AdBanner;