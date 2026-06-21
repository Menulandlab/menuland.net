import React, { useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { publicApiClient } from '../api/client';
import { getBusinesses } from '../api/businessService';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';
import { useLocation } from '../context/LocationContext';
import { Ionicons } from '@expo/vector-icons';

interface Story {
  id: number | string;
  image_url: string; // fallback
  image_url_thumb?: string;
  business_id?: number; // Reklam hikayelerinde olmayabilir
  business_name?: string; // Reklam hikayelerinde olmayabilir
  isAd?: boolean; // Reklam hikayesi mi?
  link?: string; // Reklam hikayeleri için link
  distance?: number; // Uzaklık bilgisi eklendi
  end_time?: string; // Hikaye bitiş tarihi
}

const StoryItem: React.FC<{ item: Story }> = ({ item }) => {
  const router = useRouter();

  const handlePress = () => {
    if (item.isAd && item.link) {
      router.push({ pathname: `/(details)/event/${item.id}`, params: { url: item.link } });
    } else if (item.business_id) {
      // Story detay sayfasına git - sadece storyId ile
      router.push({
        pathname: `/(details)/story/${item.id}`,
        params: {
          storyId: item.id.toString(),
        },
      });
      
      // Alternatif olarak direkt business detayına da gidebilir:
      // const params: any = {};
      // if (item.distance != null && !isNaN(Number(item.distance))) {
      //   params.distance = item.distance.toString();
      // }
      // router.push({
      //   pathname: `/(details)/business/${item.business_id}`,
      //   params: Object.keys(params).length > 0 ? params : undefined
      // });
    }
  };

  return (
    <TouchableOpacity style={styles.storyItem} onPress={handlePress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image_url_thumb || item.image_url }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory"
          transition={150}
        />
        {item.isAd && (
          <View style={styles.adBadge}>
            <Ionicons name="star" size={16} color={Colors.white} />
          </View>
        )}
      </View>
      <Text numberOfLines={1} style={styles.storyText}>{item.business_name || 'Reklam'}</Text>
    </TouchableOpacity>
  );
};

export interface StoriesCarouselRef {
  refresh: () => void;
}

const StoriesCarousel = forwardRef<StoriesCarouselRef>((_, ref) => {
  const [stories, setStories] = useState<Story[]>([]);
  const { location } = useLocation();

  const fetchAndProcessStories = useCallback(async () => {
    if (!location.cityId || !location.districtId) return;
    try {
      const userLat = location.latitude;
      const userLon = location.longitude;

        // 1. Fetch ads and normal stories in parallel
        const [adsResponse, storiesResponse] = await Promise.all([
          publicApiClient.get(`/ads?placement=story&city_id=${location.cityId}&district_id=${location.districtId}`),
          publicApiClient.get(`/stories?city_id=${location.cityId}&district_id=${location.districtId}`)
        ]);

        // 2. Map responses to a common format
        const adStories: Story[] = (Array.isArray(adsResponse.data) ? adsResponse.data : [])
          .filter((ad: any) => ad.placement === 'story') // Sadece story yerleşimine sahip reklamları al
          .map((ad: any) => ({
            id: `ad-${ad.id}`,
            image_url: ad.image_url,
            image_url_thumb: ad.image_url_thumb,
            business_id: ad.business_id,
            business_name: ad.business_name,
            isAd: true,
            link: ad.link,
          }));

        const normalStories: Story[] = (Array.isArray(storiesResponse.data) ? storiesResponse.data : [])
          .filter((story: any) => {
            // end_time kontrolü - süre dolmuş hikayeleri filtrele
            if (story.end_time) {
              const endTime = new Date(story.end_time);
              const now = new Date();
              return endTime > now; // Sadece bitiş tarihi gelmemiş hikayeleri göster
            }
            return true; // end_time yoksa göster
          })
          .map((story: any) => ({
            id: `story-${story.id}`,
            image_url: story.image_url,
            image_url_thumb: story.image_url_thumb,
            business_id: story.business_id,
            business_name: story.business_name,
            isAd: false,
            end_time: story.end_time,
          }));

        // 3. Combine stories with ads first
        let combinedStories = [...adStories, ...normalStories];

        // 4. Fetch distances if needed
        const businessIds = combinedStories.filter(s => s.business_id).map(s => s.business_id as number);
        if (businessIds.length > 0 && userLat && userLon) {
          const businessesWithDistance = await getBusinesses({ ids: businessIds, lat: userLat, lon: userLon });
          
          if (Array.isArray(businessesWithDistance)) {
            const businessMap = new Map(businessesWithDistance.map((b: any) => [b.id, b.distance]));
            
            combinedStories = combinedStories.map(story => ({
              ...story,
              distance: story.business_id ? businessMap.get(story.business_id) : undefined,
            }));
          } else {
            console.warn("[StoriesCarousel] getBusinesses did not return an array of businesses.", businessesWithDistance);
          }
        }

      setStories(combinedStories);

    } catch (error) {
      console.error("[StoriesCarousel] Failed to fetch stories:", error);
      setStories([]);
    }
  }, [location.cityId, location.districtId, location.latitude, location.longitude]);

  useImperativeHandle(ref, () => ({ refresh: fetchAndProcessStories }));

  useEffect(() => {
    fetchAndProcessStories();
  }, [fetchAndProcessStories]);

  if (stories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        renderItem={({ item }) => <StoryItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  list: {
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
    height: 100,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.primary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  storyText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    height: 16,
  },
  adBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 2,
  },
});

StoriesCarousel.displayName = 'StoriesCarousel';

export default StoriesCarousel;