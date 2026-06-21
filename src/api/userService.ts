import { privateApiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  gender?: string;
  city?: string;
  bio?: string;
}

/**
 * Updates user profile information
 * Currently saves to local storage until backend endpoint is implemented
 * When backend is ready, uncomment the API call and remove the local storage logic
 */
export const updateUserProfile = async (updateData: UserUpdateData) => {
  try {
    // Backend endpoint'i artık mevcut, API isteğini gönderiyoruz.
    const response = await privateApiClient.put('/user', updateData);

    if (response.data && response.data.success) {
      const updatedUserData = response.data.data;
      // Güncel kullanıcı verisini lokalde de sakla
      await AsyncStorage.setItem('@authUser', JSON.stringify(updatedUserData));
      return response.data; // Başarılı yanıtı sayfaya geri döndür
    } else {
      throw new Error(response.data.message || 'Profil güncellenemedi.');
    }

  } catch (error: any) {
    console.error('User profile update error:', error);

    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        throw new Error('Profil güncelleme özelliği henüz hazır değil.');
      } else if (status === 401) {
        throw new Error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      } else if (status >= 500) {
        throw new Error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }
    }

    throw new Error(error.message || 'Profil güncellenirken bir hata oluştu.');
  }
};

/**
 * This function will help sync local changes to backend once the endpoint is ready
 * Call this periodically or on app startup to sync any pending local changes
 */
export const syncLocalProfileChanges = async () => {
  try {
    const currentUserData = await AsyncStorage.getItem('@authUser');
    if (!currentUserData) return;
    
    const userData = JSON.parse(currentUserData);
    
    // Check if there are local updates that need syncing
    if (userData.last_local_update) {
      console.log('🔄 Local profile changes detected, attempting sync...');
      
      // TODO: When backend endpoint is ready, sync the data
      // const syncData = { ...userData };
      // delete syncData.last_local_update; // Remove local tracking field
      // await updateUserProfile(syncData);
      
      console.log('⏳ Backend sync will be implemented when profile update endpoint is ready');
    }
  } catch (error) {
    console.error('Failed to sync local profile changes:', error);
  }
};

export interface UpdatePasswordData {
  current_password: string;
  new_password: string;
}

/**
 * Updates the user's password.
 * This is a placeholder until the backend endpoint is implemented.
 */
export const updatePassword = async (data: UpdatePasswordData) => {
  try {
    // Backend endpoint'i artık mevcut.
    const response = await privateApiClient.post('/user/update-password', data);

    if (response.data && response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Şifre güncellenemedi.');
    }

  } catch (error: any) {
    console.error('Password update error:', error);
    if (error.response) {
      const errorData = error.response.data as { message?: string };
      if (error.response.status === 401) {
        throw new Error(errorData.message || 'Mevcut şifreniz yanlış.');
      }
    }
    throw new Error(error.message || 'Şifre güncellenirken bir hata oluştu.');
  }
};
