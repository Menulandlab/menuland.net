// Dosya: src/components/MapPreviewCard.tsx

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../types';

interface MapPreviewCardProps {
  business: Business;
  onClose: () => void;
}

const MapPreviewCard: React.FC<MapPreviewCardProps> = ({ business, onClose }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <Image 
          source={{ uri: business.image_url_1 }} 
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{business.name}</Text>
            {/* Rozetler */}
            {(business.chamber_of_commerce === 1 || business.chamber_of_commerce === "1") && (
              <View style={styles.chamberBadge}>
                <Ionicons name="shield-checkmark" size={10} color="#fff" />
              </View>
            )}
            {business.is_verified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={10} color="#fff" />
              </View>
            )}
          </View>
          {business.category_text && (
            <View style={styles.infoRow}>
              <Ionicons name="restaurant-outline" size={12} color={Colors.textLight} />
              <Text style={styles.category} numberOfLines={1}>{business.category_text}</Text>
            </View>
          )}
          {business.distance != null && !isNaN(Number(business.distance)) && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={12} color={Colors.textLight} />
              <Text style={styles.distanceText}>~{Number(business.distance).toFixed(1)} km uzaklıkta</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={onClose}
        >
          <Ionicons name="close-circle" size={28} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
    cardContainer: { 
      marginHorizontal: 12,
      marginBottom: 10,
    },
    card: { 
      flexDirection: 'row', 
      backgroundColor: 'white', 
      borderRadius: 16, 
      padding: 14, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 4 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 12, 
      elevation: 12, 
      alignItems: 'center', 
      position: 'relative',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.05)',
    },
    image: { 
      width: 80, 
      height: 80, 
      borderRadius: 12,
      backgroundColor: Colors.background,
    },
    infoContainer: { 
      flex: 1, 
      marginHorizontal: 14,
      justifyContent: 'center',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    name: { 
      fontSize: 17, 
      fontWeight: 'bold', 
      color: Colors.text,
      flexShrink: 1,
    },
    chamberBadge: {
      backgroundColor: '#D4AF37', // Altın sarısı
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    verifiedBadge: {
      backgroundColor: '#1DA1F2', // Twitter mavi
      borderRadius: 8,
      width: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    category: {
      fontSize: 13,
      color: Colors.textLight,
      marginLeft: 4,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 3,
    },
    closeButton: { 
      padding: 8, 
      position: 'absolute', 
      top: 4, 
      right: 4,
      zIndex: 10,
    },
    distanceText: {
      fontSize: 12,
      color: Colors.textLight,
      marginLeft: 4,
    }
});
export default MapPreviewCard;