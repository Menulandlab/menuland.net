import { privateApiClient, publicApiClient } from './client';
import {
  PuanBalance,
  PuanTransaction,
  PuanRedemptionCode,
  RedeemCampaignResponse,
} from '../types/puan';

/**
 * Kullanıcının güncel puan bakiyesini getirir.
 * GET /puan/balance → { balance: number }
 */
export async function getPuanBalance(): Promise<number> {
  try {
    const response = await privateApiClient.get<PuanBalance>('/puan/balance');
    return response.data?.balance ?? 0;
  } catch (error) {
    if (__DEV__) {
      console.warn('[PuanService] Bakiye alınamadı:', error);
    }
    return 0;
  }
}

/**
 * Kullanıcının puan işlem geçmişini getirir.
 * GET /puan/history → PuanTransaction[]
 */
export async function getPuanHistory(): Promise<PuanTransaction[]> {
  try {
    const response = await privateApiClient.get<PuanTransaction[]>('/puan/history');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (__DEV__) {
      console.warn('[PuanService] Geçmiş alınamadı:', error);
    }
    return [];
  }
}

/**
 * Kampanya için puan harcar ve 6 haneli kod üretir.
 * POST /puan/redeem { campaign_id } → RedeemCampaignResponse
 */
export async function redeemCampaign(
  campaignId: number
): Promise<RedeemCampaignResponse> {
  try {
    const response = await privateApiClient.post<RedeemCampaignResponse>(
      '/puan/redeem',
      { campaign_id: campaignId }
    );
    return response.data;
  } catch (error: any) {
    const serverMsg = error?.response?.data?.message;
    return {
      success: false,
      message: serverMsg || 'Kod oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
    };
  }
}

/**
 * Kullanıcının tüm puan kodlarını getirir (pending / used / expired).
 * GET /puan/codes → PuanRedemptionCode[]
 */
export async function getMyPuanCodes(): Promise<PuanRedemptionCode[]> {
  try {
    const response = await privateApiClient.get<PuanRedemptionCode[]>('/puan/codes');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (__DEV__) {
      console.warn('[PuanService] Kodlar alınamadı:', error);
    }
    return [];
  }
}

/**
 * Seçili şehirde aktif kampanyası olan işletmeleri getirir (normal + PuanLand).
 * GET /businesses?city_id=X&has_campaign=1
 */
export interface PuanBusiness {
  id: number;
  name: string;
  image_url_1: string;
  image_url_thumb?: string;
  category_text?: string;
  rating: string;
  has_puan_campaign?: boolean | number;
}

export async function getCampaignBusinesses(cityId: string | number): Promise<PuanBusiness[]> {
  try {
    const response = await publicApiClient.get('/businesses', {
      params: { city_id: cityId, has_campaign: 1, limit: 20 },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (__DEV__) {
      console.warn('[PuanService] Kampanyalı işletmeler alınamadı:', error);
    }
    return [];
  }
}
