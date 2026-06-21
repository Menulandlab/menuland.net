// src/api/businessOwnerService.ts
// İşletme sahipleri için admin panel servisleri

import { publicApiClient, privateApiClient } from './client';

// Business Owner Admin Panel Types
export interface BusinessOwnerLoginData {
  email: string;
  password: string;
}

export interface BusinessOwnerLoginResponse {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    business: {
      id: number;
      name: string;
      email: string;
    };
    admin_panel_url: string;
  };
  error?: string;
}

export interface BusinessOwnerProfile {
  id: number;
  email: string;
  business_id?: number;
  first_name: string;
  last_name: string;
  phone: string;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  business?: {
    id: number;
    business_name: string;
    status: string;
    is_premium: boolean;
  };
}

export interface AdminPanelAccess {
  has_access: boolean;
  panel_url: string;
  business_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  message: string;
}

// Business Owner Admin Panel API Services
export const businessOwnerService = {
  
  /**
   * İşletme sahibi girişi (Admin panel için)
   */
  async loginBusinessOwner(credentials: BusinessOwnerLoginData): Promise<BusinessOwnerLoginResponse> {
    try {
      const response = await publicApiClient.post('/business-owner/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Business owner login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Giriş başarısız',
        error: error.message
      };
    }
  },

  /**
   * İşletme sahibi profil bilgilerini getir
   */
  async getBusinessOwnerProfile(): Promise<BusinessOwnerProfile | null> {
    try {
      const response = await privateApiClient.get('/business-owner/profile');
      return response.data.data;
    } catch (error: any) {
      console.error('Get business owner profile error:', error);
      return null;
    }
  },

  /**
   * Admin panel erişim durumunu kontrol et
   */
  async checkAdminPanelAccess(): Promise<AdminPanelAccess> {
    try {
      const response = await privateApiClient.get('/business-owner/admin-access');
      return response.data;
    } catch (error: any) {
      console.error('Check admin panel access error:', error);
      return {
        has_access: false,
        panel_url: '',
        business_status: 'pending',
        message: 'Erişim kontrolü başarısız'
      };
    }
  },

  /**
   * Admin panel URL'ini al
   */
  getAdminPanelUrl(): string {
    return 'https://isletme.menuland.net';
  },

  /**
   * İşletme sahibi kaydı oluştur (kayıt sırasında otomatik)
   */
  async createBusinessOwnerAccount(data: {
    email: string;
    business_id: number;
    first_name: string;
    last_name: string;
    phone: string;
    temp_password: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await publicApiClient.post('/business-owner/create', data);
      return response.data;
    } catch (error: any) {
      console.error('Create business owner account error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Hesap oluşturma başarısız'
      };
    }
  },

  /**
   * Şifre sıfırlama isteği
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await publicApiClient.post('/business-owner/password-reset', { email });
      return response.data;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Şifre sıfırlama başarısız'
      };
    }
  },

  /**
   * JWT Token Debug Testi
   * "Signature verification failed" hatası için debug
   */
  async testJWTToken(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🧪 Starting JWT Token Test...');
      
      // Backend token verification endpoint'ini test et
      const response = await privateApiClient.get('/auth/verify');
      
      console.log('✅ Token verification successful:', response.data);
      return {
        success: true,
        message: 'JWT token is valid',
        details: response.data
      };

    } catch (error: any) {
      console.error('❌ JWT Token Test Failed:', {
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data
      });

      return {
        success: false,
        message: `Token verification failed: ${error.response?.data?.message || error.message}`,
        details: {
          status: error.response?.status,
          error: error.response?.data
        }
      };
    }
  }
};
