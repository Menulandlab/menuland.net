import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../types';
import RestaurantCardSkeleton from './RestaurantCardSkeleton';

interface RestaurantCardProps {
  restaurant: Business | null;
  containerStyle?: object;
  isFeatured?: boolean; // Yeni prop eklendi
  onPress?: () => void; // Özel onPress handler
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, containerStyle, isFeatured, onPress }) => {
  const router = useRouter();

  if (!restaurant) {
    return <RestaurantCardSkeleton />;
  }

  const { id, name, image_url_1, image_url_thumb, distance, chamber_of_commerce, is_verified } = restaurant;
  const displayImage = image_url_thumb || image_url_1;

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    const targetPath = `/(details)/business/${id}`;
    const params: any = {};

    if (restaurant.distance != null && !isNaN(Number(restaurant.distance))) {
      params.distance = restaurant.distance.toString();
    }

    if (isFeatured || restaurant.isFeatured) {
      params.isFeatured = 'true';
    }

    // Kategorileri de geç
    if (restaurant.category_text) {
      params.category_text = restaurant.category_text;
    }

    router.push({
      pathname: targetPath,
      params: Object.keys(params).length > 0 ? params : undefined
    });
  };

  // Eğer resim URL'si yoksa, resimsiz bir kart göster
  if (!displayImage) {
    return (
      <TouchableOpacity onPress={handlePress} style={[styles.container, styles.noImageContainer, containerStyle]}>
        {/* Rozetler - Sol üst */}
        <View style={styles.badgeRow}>
          {(chamber_of_commerce === 1 || chamber_of_commerce === "1") && (
            <View style={styles.chamberBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          )}
          {is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
            </View>
          )}
        </View>
        {isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Menuland'a Özel</Text>
          </View>
        )}
        <Text style={[styles.name, styles.noImageName]}>{name}</Text>
        {distance != null && !isNaN(Number(distance)) && (
          <Text style={styles.distanceText}>
            {Number(distance) < 1
              ? `~${Math.round(Number(distance) * 1000)} m`
              : `~${Number(distance).toFixed(1)} km`
            }
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.container, containerStyle]}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: displayImage }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          cachePolicy="memory"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        {/* Rozetler - Sol üst */}
        <View style={styles.badgeRow}>
          {(chamber_of_commerce === 1 || chamber_of_commerce === "1") && (
            <View style={styles.chamberBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          )}
          {is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#fff" />
            </View>
          )}
        </View>
        {/* Featured badge - üstte ortada */}
        {isFeatured && (
          <>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredText}>Menuland'a Özel</Text>
            </View>
            {/* Mesafe badge - featured badge'in tam altında ortalanmış */}
            {distance != null && !isNaN(Number(distance)) && (
              <View style={styles.distanceBadgeBelowFeatured}>
                <Text style={styles.distanceText}>~{Number(distance).toFixed(1)} km</Text>
              </View>
            )}
          </>
        )}
        {/* Normal kartlarda mesafe sağ üstte */}
        {!isFeatured && distance != null && !isNaN(Number(distance)) && (
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>~{Number(distance).toFixed(1)} km</Text>
          </View>
        )}
        <View style={styles.overlay} />
        <Text style={styles.name}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160, // Sabit genişlik eklendi
    height: 200,
    borderRadius: 12,
    // marginRight: 16, // Kaldırıldı
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    backgroundColor: '#e0e0e0', // Resimsiz kart için arka plan rengi
  },
  noImageContainer: {
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: '#424242',
  },
  noImageName: {
    color: '#FFFFFF',
    textShadowRadius: 0,
  },
  imageWrapper: {
    width: '100%', // Parent container genişliğine uy
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  name: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  distanceText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: '5%', // Kartın %5'inden başla
    right: '5%', // Kartın %5'inde bitir, böylece yayılır
    backgroundColor: '#ff4d00',
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1, // Üstte görünmesini sağla
    alignItems: 'center', // Yazıyı ortala
  },
  featuredText: {
    color: 'white',
    fontSize: 14, // Yazı boyutu büyütüldü
    fontWeight: 'bold',
  },
  distanceBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  distanceBadgeBelowFeatured: {
    position: 'absolute',
    top: 42, // Featured badge'in hemen altında (badge yüksekliği ~32px + 10px boşluk)
    left: '50%',
    transform: [{ translateX: -30 }], // Ortala (badge genişliği ~60px, yarısı 30px)
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 10,
  },
  // Ticaret Odası ve Onaylı rozetleri
  badgeRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 20,
  },
  chamberBadge: {
    backgroundColor: '#D4AF37', // Altın sarısı
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  verifiedBadge: {
    backgroundColor: '#1DA1F2', // Twitter mavi
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default RestaurantCard;