import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { privateApiClient } from '../api/client';

interface Business {
  id: number;
  name: string;
  image_url_1?: string;
  image_url_thumb?: string;
  address?: string;
  category_text?: string;
  rating?: string;
  description?: string;
  phone?: string;
  instagram_url?: string;
  website?: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const FavoritesSheet: React.FC<Props> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchFavorites();
    }
  }, [visible]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await privateApiClient.get('/user/favorites');
      
      console.log('📍 FavoritesSheet - Raw response:', response.data);
      console.log('📍 FavoritesSheet - Response type:', typeof response.data);
      
      // Parse response similar to other API calls
      let responseData;
      if (typeof response.data === 'string') {
        const jsonMatch = response.data.match(/\{.*\}$/s);
        if (jsonMatch) {
          responseData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } else {
        responseData = response.data;
      }

      // API'dan direkt array geliyorsa onu kullan, yoksa success/data yapısını kontrol et
      if (Array.isArray(responseData)) {
        // API field'larını düzgün map'le
        const formattedFavorites = responseData.map((business: any) => ({
          id: parseInt(business.id),
          name: business.name,
          image_url_1: business.image_url_1,
            image_url_thumb: business.image_url_thumb,
          category_text: business.category_text,
          rating: business.rating,
          description: business.description,
          phone: business.phone,
          instagram_url: business.instagram_url,
          website: business.website
        }));
        setFavorites(formattedFavorites);
      } else if (responseData.success && Array.isArray(responseData.data)) {
        setFavorites(responseData.data);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ FavoritesSheet - Error fetching favorites:', error);
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (businessId: number) => {
    try {
      // AuthContext ile aynı endpoint'i kullan: /favorites/{id}
      const response = await privateApiClient.delete(`/favorites/${businessId}`);
      
      let responseData;
      if (typeof response.data === 'string') {
        const jsonMatch = response.data.match(/\{.*\}$/s);
        if (jsonMatch) {
          responseData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } else {
        responseData = response.data;
      }

      if (responseData.success) {
        setFavorites(favorites.filter(fav => fav.id !== businessId));
        Alert.alert('Başarılı', 'Favorilerden kaldırıldı.');
      } else {
        throw new Error(responseData.message || 'Favorilerden kaldırılamadı');
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Favorilerden kaldırırken bir hata oluştu.');
    }
  };

  const confirmRemoveFavorite = (business: Business) => {
    Alert.alert(
      'Favorilerden Kaldır',
      `${business.name} mekanını favorilerden kaldırmak istediğinizden emin misiniz?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Kaldır', style: 'destructive', onPress: () => removeFavorite(business.id) }
      ]
    );
  };

  const handleBusinessPress = (business: Business) => {
    // Favori sheet'i kapat
    onClose();
    // İşletme detay sayfasına git
    router.push(`/(details)/business/${business.id}`);
  };

  const renderFavoriteItem = (item: Business) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.favoriteItem}
      onPress={() => handleBusinessPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.favoriteImageContainer}>
        {(item.image_url_thumb || item.image_url_1) ? (
          <Image source={{ uri: item.image_url_thumb || item.image_url_1 }} style={styles.favoriteImage} />
        ) : (
          <View style={styles.favoriteImagePlaceholder}>
            <Ionicons name="restaurant" size={24} color={Colors.textLight} />
          </View>
        )}
      </View>
      
      <View style={styles.favoriteInfo}>
        <Text style={styles.favoriteName}>{item.name}</Text>
        {item.category_text && (
          <Text style={styles.favoriteCategory}>{item.category_text}</Text>
        )}
        {item.address && (
          <Text style={styles.favoriteAddress} numberOfLines={1}>{item.address}</Text>
        )}
        {item.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={(e) => {
          // Event propagation'ı durdur ki sadece favorilerden kaldırma olsun
          e.stopPropagation();
          confirmRemoveFavorite(item);
        }}
      >
        <Ionicons name="heart" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Favori Mekanlarım</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
              </View>
            ) : favorites.length > 0 ? (
              <>
                <Text style={styles.subtitle}>
                  {favorites.length} favori mekanınız var
                </Text>
                {favorites.map(renderFavoriteItem)}
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="heart-outline" size={64} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>Henüz favori mekanınız yok</Text>
                <Text style={styles.emptyDescription}>
                  Beğendiğiniz mekanları favorilerinize ekleyebilirsiniz.
                </Text>
              </View>
            )}
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
    maxHeight: '85%',
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
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 15,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  favoriteImageContainer: {
    marginRight: 15,
  },
  favoriteImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  favoriteImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  favoriteCategory: {
    fontSize: 13,
    color: Colors.primary,
    marginBottom: 4,
  },
  favoriteAddress: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: Colors.text,
    marginLeft: 4,
  },
  removeButton: {
    padding: 8,
    alignSelf: 'center',
  },
});

export default FavoritesSheet;
