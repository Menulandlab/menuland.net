// PuanLand sadakat sistemi tip tanımlamaları

export interface PuanBalance {
  balance: number;
}

export type PuanTransactionType = 'earn' | 'spend';

export interface PuanTransaction {
  id: number;
  user_id: number;
  amount: number;         // earn → pozitif, spend → negatif
  type: PuanTransactionType;
  reference_id?: number | null;
  created_at: string;
  // Backend'in ek alanları (isteğe bağlı)
  description?: string;  // "Yorum yapıldı", "Kampanya satın alındı" vb.
}

export type PuanCodeStatus = 'pending' | 'used' | 'expired';

export interface PuanRedemptionCode {
  id: number;
  code: string;           // 6 haneli büyük harf + rakam
  campaign_id: number;
  business_id: number;
  user_id: number;
  puan_amount: number;    // Harcanan puan
  status: PuanCodeStatus;
  expires_at: string;     // ISO datetime
  used_at?: string | null;
  created_at: string;
  // Backend join alanları (isteğe bağlı)
  business_name?: string;
  campaign_name?: string;
}

export interface RedeemCampaignResponse {
  success: boolean;
  message?: string;
  data?: {
    code: string;
    expires_at: string;
    puan_spent: number;
    remaining_balance: number;
  };
}
