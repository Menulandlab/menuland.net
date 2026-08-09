import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, interpolate, Extrapolation, SharedValue, FadeInDown, FadeOutUp, Keyframe } from 'react-native-reanimated';

interface HeaderProps {
  onLocationPress: () => void;
  onSearchPress: () => void;
  scrollY: SharedValue<number>;
}

const PLACEHOLDER_TEXTS = [
  "Menuland'de Ara",
  "Canın ne çekiyor?",
  "En iyi kahvaltıcılar...",
  "Burger mi, Pizza mı?",
  "Bölgenin lezzetlerini keşfet",
  "Tatlı bir şeyler?",
  "Bugün ne yesek?"
];

// Özel bir giriş animasyonu tanımlayalım (Hafif alttan gelme)
const enteringAnimation = FadeInDown.duration(400).springify();
// Özel bir çıkış animasyonu (Hafif yukarı gitme)
const exitingAnimation = FadeOutUp.duration(400);

const Header: React.FC<HeaderProps> = React.memo(({ onLocationPress, onSearchPress, scrollY }) => {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [textIndex, setTextIndex] = useState(0);

  // Metinleri döngüsel olarak değiştirme efekti
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % PLACEHOLDER_TEXTS.length);
    }, 3500); // 3.5 saniyede bir değiş

    return () => clearInterval(interval);
  }, []);

  const handleProfilePress = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  const topSectionStyle = useAnimatedStyle(() => {
    const height = interpolate(scrollY.value, [0, 60], [60, 0], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [0, 40], [1, 0], Extrapolation.CLAMP);
    const marginBottom = interpolate(scrollY.value, [0, 60], [16, 0], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [0, 60], [0, -20], Extrapolation.CLAMP);

    return {
      height,
      opacity,
      marginBottom,
      transform: [{ translateY }],
      overflow: 'hidden',
    };
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#ff4d00" barStyle="light-content" />
      <View style={styles.content}>
        {/* Üst Satır: Logo (Sol) - Konum ve Profil (Sağ) */}
        <Animated.View style={[styles.topRow, topSectionStyle]}>
          {/* Sol: Logo */}
          <View style={styles.leftSection}>
            <Image
              source={require('../../assets/images/menuland_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Sağ: Konum ve Profil */}
          <View style={styles.rightSection}>
            <TouchableOpacity style={styles.locationButton} onPress={onLocationPress}>
              <Ionicons name="location-outline" size={20} color={Colors.white} />
              <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                {location.districtName && location.cityName
                  ? `${location.districtName}, ${location.cityName} `
                  : 'Konum Seç'}
              </Text>
              <Ionicons name="chevron-down-outline" size={16} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
              <Ionicons name="person-circle-outline" size={32} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Alt Satır: Arama Çubuğu */}
        <TouchableOpacity style={styles.searchBar} onPress={onSearchPress} activeOpacity={0.9}>
          <Ionicons name="search" size={20} color={Colors.primary} style={{ marginRight: 8 }} />

          {/* Animasyonlu Placeholder */}
          <View style={{ flex: 1, height: 20, justifyContent: 'center', overflow: 'hidden' }}>
            <Animated.Text
              key={textIndex} // Key değişince React elemanı yeniden yaratır ve animasyon tetiklenir
              entering={enteringAnimation}
              exiting={exitingAnimation}
              style={styles.placeholderText}
            >
              {PLACEHOLDER_TEXTS[textIndex]}
            </Animated.Text>
          </View>

        </TouchableOpacity>
      </View>
    </View>
  );
});

Header.displayName = 'Header';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingBottom: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    // Header shadow
    zIndex: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  leftSection: {
    justifyContent: 'flex-start',
  },
  logo: {
    width: 100,
    height: 55,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    flexShrink: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    maxWidth: 120,
  },
  profileButton: {
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  placeholderText: {
    color: Colors.textLight,
    fontSize: 15,
  },
});

export default Header;