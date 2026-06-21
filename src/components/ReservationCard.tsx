import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import { Reservation, RESERVATION_STATUS_CONFIG } from '../types/reservation';
import { formatDateForDisplay, isPastDate } from '../utils/dateFormatter';
import { cancelReservation } from '../api/reservationService';
import { useAuth } from '../context/AuthContext';

interface ReservationCardProps {
  reservation: Reservation;
  onCancelled?: () => void;
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, onCancelled }) => {
  const router = useRouter();
  const { user } = useAuth();
  const statusConfig = RESERVATION_STATUS_CONFIG[reservation.status];
  const isPast = isPastDate(reservation.reservation_time);
  const canCancel = reservation.status === 'pending' || reservation.status === 'approved';

  const handleBusinessPress = () => {
    router.push(`/(details)/business/${reservation.business_id}`);
  };

  const handleCancelPress = () => {
    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
      return;
    }

    Alert.alert(
      'Rezervasyonu İptal Et',
      'Bu rezervasyonu iptal etmek istediğinizden emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'İptal Et',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔴 İptal ediliyor - Reservation ID:', reservation.id, 'User ID:', user.id);
              const response = await cancelReservation(
                reservation.id,
                user.id // user_id düzgün gönderiliyor
              );

              console.log('🔴 İptal response:', response);

              if (response.success) {
                Alert.alert('Başarılı', 'Rezervasyonunuz iptal edildi.');
                onCancelled?.();
              } else {
                Alert.alert('Hata', response.message || 'Rezervasyon iptal edilemedi.');
              }
            } catch (error) {
              console.error('🔴 İptal hatası:', error);
              Alert.alert('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Business Info */}
      <TouchableOpacity onPress={handleBusinessPress} style={styles.businessInfo}>
        {reservation.business_image ? (
          <Image source={{ uri: reservation.business_image }} style={styles.businessImage} />
        ) : (
          <View style={[styles.businessImage, styles.businessImagePlaceholder]}>
            <Ionicons name="business" size={24} color={Colors.gray} />
          </View>
        )}
        <View style={styles.businessDetails}>
          <Text style={styles.businessName} numberOfLines={1}>
            {reservation.business_name}
          </Text>
          <View style={styles.dateTimeRow}>
            <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
            <Text style={styles.dateTimeText}>
              {formatDateForDisplay(reservation.reservation_time)}
            </Text>
          </View>
          <View style={styles.dateTimeRow}>
            <Ionicons name="people-outline" size={16} color={Colors.gray} />
            <Text style={styles.dateTimeText}>{reservation.person_count} Kişi</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusConfig.bgColor },
        ]}
      >
        <Text style={[styles.statusText, { color: statusConfig.color }]}>
          {statusConfig.text}
        </Text>
      </View>

      {/* Admin Note */}
      {reservation.admin_note && (
        <View style={styles.adminNoteContainer}>
          <Ionicons name="chatbox-outline" size={16} color={Colors.primary} />
          <Text style={styles.adminNoteText}>{reservation.admin_note}</Text>
        </View>
      )}

      {/* Customer Note */}
      {reservation.customer_note && (
        <View style={styles.customerNoteContainer}>
          <Text style={styles.customerNoteLabel}>Notunuz:</Text>
          <Text style={styles.customerNoteText}>{reservation.customer_note}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {canCancel && !isPast && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPress}>
            <Ionicons name="close-circle-outline" size={18} color={Colors.white} />
            <Text style={styles.cancelButtonText}>İptal Et</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.detailButton} onPress={handleBusinessPress}>
          <Text style={styles.detailButtonText}>İşletme Detayı</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  businessInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  businessImagePlaceholder: {
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 14,
    color: Colors.gray,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  adminNoteContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFF4E6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  adminNoteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  customerNoteContainer: {
    backgroundColor: Colors.backgroundLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  customerNoteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gray,
    marginBottom: 4,
  },
  customerNoteText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundLight,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 4,
  },
  detailButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReservationCard;
