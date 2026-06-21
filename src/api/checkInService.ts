import { privateApiClient } from './client';

export interface CheckInResponse {
  success: boolean;
  puan_earned?: number;
  message?: string;
  already_checked_in?: boolean;
}

/**
 * İşletmede check-in yapar.
 * POST /businesses/check-in { business_id, latitude, longitude }
 */
export async function checkIn(
  businessId: number,
  latitude: number,
  longitude: number
): Promise<CheckInResponse> {
  try {
    const response = await privateApiClient.post<CheckInResponse>('/businesses/check-in', {
      business_id: businessId,
      latitude: latitude.toString(),
      longitude: longitude.toString(),
    });
    return response.data;
  } catch (error: any) {
    const serverMsg = error?.response?.data?.message;
    const status = error?.response?.status;
    
    if (status === 400 || serverMsg?.toLowerCase().includes('zaten') || serverMsg?.toLowerCase().includes('already')) {
      return {
        success: false,
        already_checked_in: true,
        message: serverMsg || 'Bugün bu işletmede zaten giriş yaptınız.',
      };
    }
    
    return {
      success: false,
      message: serverMsg || 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
}

/**
 * Kullanıcının bugün bu işletmede check-in yapıp yapmadığını sorgular.
 * GET /businesses/check-in/status?business_id=X
 */
export async function getCheckInStatus(businessId: number): Promise<{ isCheckedIn: boolean }> {
  try {
    const response = await privateApiClient.get<{ is_checked_in: boolean | number | string }>('/businesses/check-in/status', {
      params: { business_id: businessId }
    });
    return {
      isCheckedIn: response.data?.is_checked_in === true || response.data?.is_checked_in === 1 || response.data?.is_checked_in === '1'
    };
  } catch (error) {
    return { isCheckedIn: false };
  }
}
