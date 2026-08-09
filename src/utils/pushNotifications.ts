import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const EXPO_PROJECT_ID = Constants.expoConfig?.extra?.eas?.projectId ?? 'c37c152a-e4ad-4e45-be11-f47de17f5dd4';
const NOTIFICATIONS_ENABLED_KEY = '@notificationsEnabled';
const PUSH_TOKEN_KEY = '@pushToken';

/**
 * Kullanıcıya bildirim izni istemeden önce KVKK'ya uygun
 * bilgilendirme alert'i gösterir. Kullanıcı onaylarsa izin istenir.
 * Sadece ilk sefer gösterilmek üzere tasarlanmıştır.
 */
async function showNotificationConsentAlert(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      'Bildirim İzni',
      'Menuland, yakınızdaki yeni işletmeler, kampanyalar ve rezervasyon güncellemeleri hakkında size bildirim göndermek istiyor.\n\nBildirimlerinizi istediğiniz zaman Ayarlar ekranından kapatabilirsiniz.',
      [
        {
          text: 'İzin Verme',
          style: 'cancel',
          onPress: () => resolve(false),
        },
        {
          text: 'İzin Ver',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: false }
    );
  });
}

/**
 * Android için bildirim kanalı oluşturur.
 * Android 8+ (API 26+) zorunludur.
 */
async function createAndroidNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Genel Bildirimler',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF4D00',
    });

    await Notifications.setNotificationChannelAsync('reservations', {
      name: 'Rezervasyon Bildirimleri',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF4D00',
    });
  }
}

const HAS_PROMPTED_KEY = '@hasPromptedForNotifications';

/**
 * Push notification izni ister ve Expo Push Token alır.
 * 
 * @param showConsentFirst - true ise izin istemeden önce açıklama alert'i göster
 * @param isStartup - true ise uygulama ilk açıldığında çağrıldığını belirtir (mükerrer sormayı önler)
 * @returns token string veya null (izin verilmezse / fiziksel cihaz değilse)
 */
export async function registerForPushNotificationsAsync(showConsentFirst = false, isStartup = false): Promise<string | null> {
  // Expo Go / Simulator'da mock mode
  if (!Device.isDevice) {
    if (__DEV__) {
      console.log('[PushNotifications] Fiziksel cihaz değil, push token simüle edilemez.');
    }
    return null;
  }

  await createAndroidNotificationChannel();

  // Mevcut izin durumunu kontrol et
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    // Zaten izin var, token al
    return await getExpoPushToken();
  }

  // Startup'ta ve daha önce kullanıcıya sorulduysa tekrar rahatsız etme
  if (isStartup) {
    const hasPrompted = await AsyncStorage.getItem(HAS_PROMPTED_KEY);
    if (hasPrompted === 'true') {
      if (__DEV__) {
        console.log('[PushNotifications] Startup: Kullanıcıya zaten sorulmuş, tekrar sorulmuyor.');
      }
      return null;
    }
  }

  // İzin yok → önce consent alert göster (KVKK)
  if (showConsentFirst) {
    const userConsented = await showNotificationConsentAlert();
    // Prompt edildiğini kaydet
    await AsyncStorage.setItem(HAS_PROMPTED_KEY, 'true');
    
    if (!userConsented) {
      await setNotificationsEnabled(false);
      return null;
    }
  }

  // iOS / Android izin iste
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
    android: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  // Prompt edildiğini kaydet
  await AsyncStorage.setItem(HAS_PROMPTED_KEY, 'true');

  if (status !== 'granted') {
    await setNotificationsEnabled(false);
    return null;
  }

  await setNotificationsEnabled(true);
  return await getExpoPushToken();
}

async function getExpoPushToken(): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: EXPO_PROJECT_ID,
    });
    return tokenData.data;
  } catch (err) {
    // FCM v1: getDevicePushTokenAsync ile native FCM token'ı fallback olarak dene
    try {
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      if (__DEV__) {
        console.warn('[PushNotifications] Expo token alınamadı, device token:', deviceToken.data);
      }
    } catch {}
    if (__DEV__) {
      console.error('[PushNotifications] Token alınamadı:', err);
    }
    return null;
  }
}

/**
 * Kullanıcının bildirim tercihini AsyncStorage'a kaydeder.
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
}

/**
 * Kullanıcının bildirim tercihini yükler. Varsayılan: true.
 */
export async function getNotificationsEnabled(): Promise<boolean> {
  const val = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  return val !== 'false'; // varsayılan açık
}

/**
 * Push token'ı AsyncStorage'a kaydeder.
 */
export async function storePushToken(token: string): Promise<void> {
  await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
}

/**
 * Kaydedilmiş push token'ı getirir.
 */
export async function getStoredPushToken(): Promise<string | null> {
  return AsyncStorage.getItem(PUSH_TOKEN_KEY);
}

/**
 * Push token'ı AsyncStorage'dan siler.
 */
export async function clearPushToken(): Promise<void> {
  await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
}
