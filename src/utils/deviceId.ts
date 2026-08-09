import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const DEVICE_ID_KEY = '@menuland_device_id';

/**
 * Cihazın benzersiz kimliğini döndürür.
 * 
 * iOS: applicationId (bundle identifier) + installationId kombinasyonu
 * Android: androidId
 * 
 * Eğer expo değerleri alınamazsa, AsyncStorage'da saklanan UUID kullanılır.
 */
export async function getDeviceId(): Promise<string> {
  try {
    // Önce cache'e bakalım
    const cachedId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (cachedId) {
      return cachedId;
    }

    let deviceId: string;

    if (Platform.OS === 'ios') {
      // iOS için installationId + applicationId kombinasyonu
      const installationId = Application.getIosIdForVendorAsync
        ? await Application.getIosIdForVendorAsync()
        : null;
      
      deviceId = installationId || generateUUID();
    } else if (Platform.OS === 'android') {
      // Android için androidId
      const androidId = Application.getAndroidId
        ? await Application.getAndroidId()
        : null;
      
      deviceId = androidId || generateUUID();
    } else {
      // Web veya diğer platformlar için UUID
      deviceId = generateUUID();
    }

    // Cache'e kaydet
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    return deviceId;
  } catch (error) {
    console.error('Device ID alınırken hata:', error);
    // Hata durumunda fallback UUID
    const fallbackId = generateUUID();
    await AsyncStorage.setItem(DEVICE_ID_KEY, fallbackId);
    return fallbackId;
  }
}

/**
 * Basit UUID v4 generator (fallback için)
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
