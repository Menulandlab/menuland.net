import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Colors from '@/src/constants/Colors';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { cardListItemStyle } from '@/src/styles/CardStyles';

interface Business {
  id: number;
  name: string;
  image_url_1?: string;
  image_url?: string; // Places API'den gelen görsel alanı
  category_text?: string;
  rating: string;
  distance?: number;
  latitude?: string | number;
  longitude?: string | number;
  city_name?: string;
  district_name?: string;
  chamber_of_commerce?: number | string;
  is_verified?: boolean;
}

interface BusinessListItemProps {
  business: Business;
  onPress: () => void;
}

const BusinessListItem: React.FC<BusinessListItemProps> = ({ business, onPress }) => {
  // Places API'den image_url, Businesses API'den image_url_thumb (veya fallback image_url_1) gelir
  const imageUrl = business.image_url_thumb || business.image_url_1 || business.image_url;
  
  return (
    <TouchableOpacity style={cardListItemStyle.container} onPress={onPress}>
      {imageUrl ? (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.image} 
          contentFit="cover"
          transition={200}
          cachePolicy="memory"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="business-outline" size={40} color={Colors.lightGray} />
        </View>
      )}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
          {(business.chamber_of_commerce === 1 || business.chamber_of_commerce === "1") && (
            <View style={styles.chamberBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          )}
          {business.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
            </View>
          )}
        </View>
        {(business.district_name || business.city_name) && (
          <Text style={styles.locationText}>
            {[business.district_name, business.city_name].filter(Boolean).join(', ')}
          </Text>
        )}
        <View style={styles.ratingContainer}>
          <FontAwesome name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>
            {Number(business.rating) > 0 ? Number(business.rating).toFixed(1) : '—'}
          </Text>
        </View>
      </View>
      {business.distance != null && (
        <View style={styles.distanceBadge}>
          <Text style={styles.distanceText}>~{business.distance.toFixed(1)} km</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    flexShrink: 1,
  },
  chamberBadge: {
    backgroundColor: '#D4AF37', // Altın sarısı
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    backgroundColor: '#1DA1F2', // Twitter mavi
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  distanceBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
  },
  distanceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default BusinessListItem;
