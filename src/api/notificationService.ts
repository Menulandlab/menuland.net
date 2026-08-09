import { privateApiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RegisterTokenPayload {
  push_token: string;
  district_id?: string | null;
  city_id?: string | null;
}

/**
 * Push token'ı backend'e kaydeder.
 * Kullanıcı giriş yaptıktan ve token alındıktan sonra çağrılır.
 * Aynı zamanda district_id ve city_id gönderilerek ilçe bazlı hedefleme yapılabilir.
 *
 * Backend endpoint: POST /auth/push-token
 * Headers: Authorization: Bearer <token>
 * Body: { push_token, district_id?, city_id? }
 */
export async function registerPushToken(token: string): Promise<void> {
  try {
    const storedLocation = await AsyncStorage.getItem('@selectedLocation');
    let districtId: string | null = null;
    let cityId: string | null = null;
    if (storedLocation) {
      const loc = JSON.parse(storedLocation);
      districtId = loc.districtId ?? null;
      cityId = loc.cityId ?? null;
    }

    const payload: RegisterTokenPayload = {
      push_token: token,
      district_id: districtId,
      city_id: cityId,
    };

    await privateApiClient.post('/auth/push-token', payload);

    if (__DEV__) {
      console.log('[NotificationService] Push token başarıyla kaydedildi:', token.substring(0, 30) + '...');
    }
  } catch (err) {
    // Hata logla ama kullanıcıya yansıtma — token kaydı kritik değil
    if (__DEV__) {
      console.error('[NotificationService] Push token kaydedilemedi:', err);
    }
  }
}

/**
 * Push token'ı backend'den siler.
 * Kullanıcı bildirimleri kapattığında veya çıkış yaptığında çağrılır.
 *
 * Backend endpoint: DELETE /auth/push-token
 * Headers: Authorization: Bearer <token>
 */
export async function unregisterPushToken(): Promise<void> {
  try {
    await privateApiClient.delete('/auth/push-token');

    if (__DEV__) {
      console.log('[NotificationService] Push token backend\'den silindi.');
    }
  } catch (err) {
    if (__DEV__) {
      console.error('[NotificationService] Push token silinemedi:', err);
    }
  }
}
