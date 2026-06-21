import { publicApiClient } from './client';

export interface BusinessRegistrationData {
  business_name: string;
  owner_name: string;
  owner_surname: string;
  owner_phone: string;
  owner_email: string;
  business_address: string;
  city_id: number;
  district_id: number;
  business_category_id: number;
  business_description?: string;
  business_phone?: string;
  business_instagram?: string;
  business_website?: string;
  registration_status: 'pending' | 'approved' | 'rejected';
}

export interface BusinessRegistrationResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    registration_number: string;
    estimated_approval_time: string;
    admin_panel_info?: {
      panel_url: string;
      temp_password: string;
      login_instructions: string;
    };
  };
  error?: string;
}

export interface BusinessUpdateData {
  // Temel bilgiler - Veritabanı alan isimleriyle uyumlu
  name?: string; // business_name yerine name
  description?: string; // business_description yerine description
  phone?: string; // business_phone yerine phone
  email?: string;
  website?: string; // business_website yerine website
  instagram_url?: string; // business_instagram yerine instagram_url
  
  // Konum bilgileri
  latitude?: number;
  longitude?: number;
  city_id?: number;
  district_id?: number;
  address?: string;
  
  // Kategori
  category_text?: string;
  
  // Görsel yönetimi
  image_url_1?: string;
  image_url_2?: string;
  
  // Menü yönetimi
  menu_type?: 'link' | 'internal' | 'none';
  menu_url?: string;
  
  // Çalışma saatleri
  opening_hours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
}

export interface PendingUpdate {
  id: number;
  business_id: number;
  update_type: 'info' | 'images' | 'menu' | 'hours';
  old_data: any;
  new_data: any;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

class BusinessRegistrationService {
  
  /**
   * MOBİL UYGULAMA - İşletme Kaydı
   */
  async registerBusiness(data: BusinessRegistrationData): Promise<BusinessRegistrationResponse> {
    try {
      const response = await publicApiClient.post('/public/business-registration', {
        ...data,
        source: 'mobile_app',
        registration_timestamp: new Date().toISOString()
      });

      return response.data;
    } catch (error: any) {
      console.error('Business registration error:', error);
      return {
        success: false,
        message: 'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.',
        error: error.message
      };
    }
  }

  /**
   * İŞLETME PANELİ - Bilgi Güncelleme İsteği
   * Bu istek direkt service.menuland.net admin paneline onaya gider
   */
  async submitBusinessUpdate(businessId: number, updateData: BusinessUpdateData): Promise<{success: boolean, message: string}> {
    try {
      const response = await publicApiClient.post(`/business/${businessId}/update-request`, {
        ...updateData,
        request_timestamp: new Date().toISOString(),
        source: 'business_panel'
      });

      return {
        success: true,
        message: 'Güncelleme isteğiniz admin onayına gönderildi. 24-48 saat içinde değerlendirilecektir.'
      };
    } catch (error: any) {
      console.error('Business update error:', error);
      return {
        success: false,
        message: 'Güncelleme isteği gönderilemedi. Lütfen tekrar deneyin.'
      };
    }
  }

  /**
   * ADMİN PANELİ - Bekleyen Güncellemeleri Listele
   */
  async getPendingUpdates(): Promise<PendingUpdate[]> {
    try {
      const response = await publicApiClient.get('/admin/pending-updates');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching pending updates:', error);
      return [];
    }
  }

  /**
   * ADMİN PANELİ - Güncelleme Onayı/Reddi
   */
  async reviewUpdate(updateId: number, action: 'approve' | 'reject', notes?: string): Promise<{success: boolean, message: string}> {
    try {
      const response = await publicApiClient.post(`/admin/review-update/${updateId}`, {
        action,
        reviewer_notes: notes,
        reviewed_at: new Date().toISOString()
      });

      return {
        success: true,
        message: `Güncelleme ${action === 'approve' ? 'onaylandı' : 'reddedildi'}.`
      };
    } catch (error: any) {
      console.error('Review update error:', error);
      return {
        success: false,
        message: 'İşlem gerçekleştirilemedi.'
      };
    }
  }

  /**
   * İŞLETME PANELİ - Mevcut İşletme Bilgilerini Getir
   */
  async getBusinessInfo(businessId: number): Promise<any> {
    try {
      const response = await publicApiClient.get(`/business/${businessId}/info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching business info:', error);
      return null;
    }
  }

  /**
   * İŞLETME PANELİ - Güncelleme Geçmişi
   */
  async getUpdateHistory(businessId: number): Promise<PendingUpdate[]> {
    try {
      const response = await publicApiClient.get(`/business/${businessId}/update-history`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching update history:', error);
      return [];
    }
  }

  /**
   * Şehir listesini getir
   */
  async getCities(): Promise<{id: number, name: string}[]> {
    try {
      const response = await publicApiClient.get('/public/cities');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  }

  /**
   * İlçe listesini getir
   */
  async getDistricts(cityId: number): Promise<{id: number, name: string}[]> {
    try {
      const response = await publicApiClient.get(`/public/districts/${cityId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  /**
   * Kategori listesini getir
   */
  async getBusinessCategories(): Promise<{id: number, name: string}[]> {
    try {
      const response = await publicApiClient.get('/public/business-categories');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

}

export const businessRegistrationService = new BusinessRegistrationService();
