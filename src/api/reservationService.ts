import { publicApiClient, privateApiClient } from './client';
import {
  CreateReservationRequest,
  CreateReservationResponse,
  GetReservationsResponse,
  CancelReservationRequest,
  CancelReservationResponse,
} from '../types/reservation';

/**
 * Rezervasyon API Service
 * Backend endpoint'leri: /reservation/*
 */

/**
 * Yeni rezervasyon oluştur
 * 
 * @param data - Rezervasyon bilgileri
 * @returns Oluşturulan rezervasyon bilgisi
 */
export async function createReservation(
  data: CreateReservationRequest
): Promise<CreateReservationResponse> {
  try {
    const response = await publicApiClient.post<CreateReservationResponse>(
      '/reservation/create',
      data
    );
    return response.data;
  } catch (error: any) {
    // Backend'den gelen hata mesajını kullan
    if (error.response?.data) {
      return error.response.data;
    }
    // Genel hata
    return {
      success: false,
      message: 'Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
}

/**
 * Kullanıcının rezervasyonlarını getir
 * 
 * @param userId - Kullanıcı ID'si
 * @param limit - Maksimum kayıt sayısı (varsayılan: 20, max: 50)
 * @returns Rezervasyon listesi
 */
export async function getUserReservations(
  userId: number,
  limit: number = 20
): Promise<GetReservationsResponse> {
  try {
    console.log(`[Reservation API] Fetching reservations for user ${userId}, limit: ${limit}`);
    const response = await privateApiClient.get<GetReservationsResponse>(
      `/user/${userId}/reservations`,
      {
        params: { limit },
      }
    );
    console.log('[Reservation API] Response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Reservation API] getUserReservations error:', error);
    console.error('[Reservation API] Error response:', error.response?.data);
    console.error('[Reservation API] Error status:', error.response?.status);
    return {
      success: false,
      data: [],
      total: 0,
    };
  }
}

/**
 * Rezervasyonu iptal et
 * 
 * @param reservationId - Rezervasyon ID'si
 * @param userId - Kullanıcı ID'si
 * @returns İptal sonucu
 */
export async function cancelReservation(
  reservationId: number,
  userId: number
): Promise<CancelReservationResponse> {
  try {
    const response = await privateApiClient.put<CancelReservationResponse>(
      `/reservation/${reservationId}/cancel`,
      { user_id: userId }
    );
    return response.data;
  } catch (error: any) {
    // Backend'den gelen hata mesajını kullan
    if (error.response?.data) {
      return error.response.data;
    }
    // Genel hata
    return {
      success: false,
      message: 'Rezervasyon iptal edilirken bir hata oluştu.',
    };
  }
}
