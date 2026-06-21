import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { checkIn, getCheckInStatus } from '../api/checkInService';

interface CheckInWidgetProps {
  businessId: number;
  businessName: string;
  onCheckInSuccess: (puanEarned: number) => void;
  latitude: number | null;
  longitude: number | null;
}

const CheckInWidget: React.FC<CheckInWidgetProps> = ({
  businessId,
  businessName,
  onCheckInSuccess,
  latitude,
  longitude,
}) => {
  const { isAuthenticated, user, refreshPuanBalance } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Bugünün tarih formatını al (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getStorageKey = () => {
    const userId = user?.id ?? 'guest';
    return `@checkin_${userId}_${businessId}_${getTodayString()}`;
  };

  // Check-in durumunu yükle
  useEffect(() => {
    const loadCheckInStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        // 1. Önce lokal önbelleğe bak (hız için)
        const cached = await AsyncStorage.getItem(getStorageKey());
        if (cached === 'true') {
          setIsCheckedIn(true);
          return;
        }

        // 2. Ardından API'den sorgula (senkronizasyon için)
        const status = await getCheckInStatus(businessId);
        if (status.isCheckedIn) {
          setIsCheckedIn(true);
          // Lokal önbelleği güncelle
          await AsyncStorage.setItem(getStorageKey(), 'true');
        }
      } catch (error) {
        console.error('[CheckInWidget] Durum yüklenirken hata:', error);
      }
    };

    loadCheckInStatus();
  }, [businessId, isAuthenticated, user]);

  const handlePress = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Giriş Gerekli',
        'Giriş yaparak her gün ziyaret ettiğiniz mekanlardan hediye puanlar kazanabilirsiniz!',
        [{ text: 'Tamam' }]
      );
      return;
    }

    if (isCheckedIn) {
      Alert.alert('Zaten Giriş Yapıldı', 'Bugün bu işletmede zaten giriş yaptınız. Yarın tekrar bekleriz!');
      return;
    }

    setLoading(true);
    try {
      const lat = latitude ?? 0;
      const lon = longitude ?? 0;

      const response = await checkIn(businessId, lat, lon);

      if (response.success) {
        setIsCheckedIn(true);
        await AsyncStorage.setItem(getStorageKey(), 'true');
        const points = response.puan_earned ?? 50;
        await refreshPuanBalance();
        onCheckInSuccess(points);
        Alert.alert(
          'Tebrikler!',
          `Başarıyla giriş yaptınız ve +${points} Menuland Puanı kazandınız!`
        );
      } else if (response.already_checked_in) {
        setIsCheckedIn(true);
        await AsyncStorage.setItem(getStorageKey(), 'true');
        Alert.alert('Zaten Giriş Yapıldı', 'Bugün bu işletmede zaten giriş yaptınız. Yarın tekrar bekleriz!');
      } else {
        Alert.alert(
          'Giriş Yapılamadı',
          response.message || 'Giriş işlemi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyin.'
        );
      }
    } catch (error) {
      console.error('[CheckInWidget] Check-in hatası:', error);
      Alert.alert(
        'Bağlantı Hatası',
        'Sunucuyla bağlantı kurulamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isCheckedIn ? ['#10B981', '#059669'] : [Colors.primary, '#FF7A00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <View style={styles.badgeRow}>
              <Ionicons name="location" size={14} color="#FFF" />
              <Text style={styles.badgeText}>KONUM DOĞRULANDI</Text>
            </View>
            <Text style={styles.title}>
              {isCheckedIn ? 'Bugün Giriş Yapıldı!' : 'Şu an buradasınız!'}
            </Text>
            <Text style={styles.subtitle}>
              {isCheckedIn
                ? 'Harika! Bugünün check-in puanını başarıyla aldınız.'
                : 'Ziyaretinizi onaylayarak anında 50 Puan kazanın!'}
            </Text>
            {__DEV__ && isCheckedIn && (
              <TouchableOpacity
                onPress={async () => {
                  await AsyncStorage.removeItem(getStorageKey());
                  setIsCheckedIn(false);
                  Alert.alert('Test Modu', 'Yerel check-in kaydı temizlendi. Şimdi tekrar test edebilirsiniz!');
                }}
                style={{
                  marginTop: 8,
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>Test: Girişi Sıfırla</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              isCheckedIn && styles.buttonChecked,
              loading && styles.buttonDisabled,
            ]}
            onPress={handlePress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={isCheckedIn ? '#10B981' : Colors.primary} size="small" />
            ) : isCheckedIn ? (
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.buttonTextChecked}>Giriş Yapıldı</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="enter" size={18} color={Colors.primary} />
                <Text style={styles.buttonText}>Giriş Yap (+50 P)</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
    gap: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 125,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonChecked: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  buttonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  buttonTextChecked: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default CheckInWidget;
