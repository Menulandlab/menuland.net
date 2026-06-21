import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MenuItemDetailData {
  imageUrl?: string | null;
  name: string;
  price?: string | number | null;
  description?: string | null;
  calories?: number | null;
  allergens?: string | null;
  ingredients?: string | null;
  contains_alcohol?: boolean | number | string | null;
  contains_pork?: boolean | number | string | null;
}

interface MenuItemDetailModalProps {
  visible: boolean;
  onClose: () => void;
  item: MenuItemDetailData | null;
}

const isTruthy = (val: any): boolean =>
  val === true || val === 1 || val === '1' || val === 'true';

const formatPrice = (price: number | string | null | undefined): string => {
  if (price === null || price === undefined || price === '') return '';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return String(price); // if it's already a formatted string like "150 TL"
  return `${num.toFixed(2)} ₺`;
};

export default function MenuItemDetailModal({
  visible,
  onClose,
  item,
}: MenuItemDetailModalProps) {
  if (!item) return null;

  const hasAlcohol = isTruthy(item.contains_alcohol);
  const hasPork = isTruthy(item.contains_pork);
  
  const hasExtraInfo =
    item.calories ||
    item.ingredients ||
    item.allergens ||
    hasAlcohol ||
    hasPork;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Blur background */}
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={onClose} 
          />
        </BlurView>

        {/* Close Button Top Right */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.white} />
        </TouchableOpacity>

        {/* Content Container */}
        <View style={styles.container} pointerEvents="box-none">
          
          {/* Zoomable Image Container */}
          <View style={styles.imageWrapper}>
            {item.imageUrl ? (
              Platform.OS === 'ios' ? (
                <ScrollView
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.imageScroll}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    contentFit="contain"
                    transition={200}
                  />
                </ScrollView>
              ) : (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                />
              )
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="restaurant-outline" size={64} color="rgba(255,255,255,0.4)" />
                <Text style={styles.placeholderText}>Görsel Bulunmuyor</Text>
              </View>
            )}
          </View>

          {/* Info Card at Bottom */}
          <View style={styles.infoCard}>
            {/* Header info: Name and Price */}
            <View style={styles.cardHeader}>
              <Text style={styles.itemName} numberOfLines={2}>
                {item.name}
              </Text>
              {!!item.price && (
                <Text style={styles.itemPrice}>
                  {formatPrice(item.price)}
                </Text>
              )}
            </View>

            {/* Scrollable details */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.detailsScroll}
              contentContainerStyle={styles.detailsContent}
            >
              {/* Description */}
              {!!item.description && (
                <Text style={styles.descriptionText}>
                  {item.description}
                </Text>
              )}

              {/* Extra details (calories, ingredients, allergens) */}
              {hasExtraInfo && (
                <View style={styles.extraContainer}>
                  {!!item.calories && (
                    <View style={styles.extraRow}>
                      <Ionicons name="flame-outline" size={16} color={Colors.primary} />
                      <Text style={styles.extraText}>
                        <Text style={styles.extraLabel}>Kalori: </Text>
                        {item.calories} kcal
                      </Text>
                    </View>
                  )}

                  {!!item.ingredients && (
                    <View style={styles.extraRow}>
                      <Ionicons name="leaf-outline" size={16} color={Colors.primary} />
                      <Text style={styles.extraText}>
                        <Text style={styles.extraLabel}>İçindekiler: </Text>
                        {item.ingredients}
                      </Text>
                    </View>
                  )}

                  {!!item.allergens && (
                    <View style={styles.extraRow}>
                      <Ionicons name="warning-outline" size={16} color="#FF9500" />
                      <Text style={styles.extraText}>
                        <Text style={styles.extraLabel}>Alerjenler: </Text>
                        {item.allergens}
                      </Text>
                    </View>
                  )}

                  {/* Warning labels */}
                  {(hasAlcohol || hasPork) && (
                    <View style={styles.warningRow}>
                      {hasAlcohol && (
                        <View style={styles.warningBadge}>
                          <Text style={styles.warningBadgeText}>Alkol İçerir</Text>
                        </View>
                      )}
                      {hasPork && (
                        <View style={styles.warningBadge}>
                          <Text style={styles.warningBadgeText}>Domuz Ürünü İçerir</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 36,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 100 : 80,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  imageScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.45,
    borderRadius: 16,
  },
  imagePlaceholder: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    paddingBottom: 14,
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  detailsScroll: {
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  detailsContent: {
    paddingBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 22,
    marginBottom: 16,
  },
  extraContainer: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  extraText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  extraLabel: {
    fontWeight: '700',
    color: Colors.text,
  },
  warningRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  warningBadge: {
    backgroundColor: Colors.warningBackground,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  warningBadgeText: {
    fontSize: 11,
    color: Colors.warningText,
    fontWeight: '700',
  },
});
