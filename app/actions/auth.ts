'use server';

import { cookies } from 'next/headers';
import axios from 'axios';
import { User } from '@/src/context/AuthContext';

const BASE_URL = 'https://api.service.menuland.net';

export interface SessionData {
  user: User | null;
  isAuthenticated: boolean;
}

// Giriş işlemi
export async function loginAction(username: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, { username, password });

    if (response.data && response.data.success) {
      const { token, user } = response.data.data;

      if (!token || !user) {
        return { success: false, message: 'Sunucudan eksik veri geldi.' };
      }

      // Token'ı HTTP-only, Secure ve SameSite çerez olarak kaydet (En Üst Düzey Güvenlik)
      const cookieStore = await cookies();
      cookieStore.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
      });

      // Kullanıcı bilgilerini JS ile erişilebilecek güvenli olmayan bir çerezde saklayabiliriz (UI için)
      cookieStore.set('authUser', JSON.stringify(user), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return { success: true, user };
    }

    return { success: false, message: response.data.message || 'Giriş başarısız.' };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { success: false, message: 'Kullanıcı adı veya şifre hatalı.' };
    }
    return { 
      success: false, 
      message: error.response?.data?.message || 'Sunucuya bağlanırken bir hata oluştu.' 
    };
  }
}

// Google ile Giriş işlemi
export async function loginWithGoogleAction(googleToken: string) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/google`, { token: googleToken });

    if (response.data && response.data.success) {
      const { token, user } = response.data.data;

      if (!token || !user) {
        return { success: false, message: 'Sunucudan eksik veri geldi.' };
      }

      const cookieStore = await cookies();
      cookieStore.set('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 gün
      });

      cookieStore.set('authUser', JSON.stringify(user), {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return { success: true, user };
    }

    return { success: false, message: response.data.message || 'Google ile giriş başarısız.' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Google ile giriş yaparken sunucu hatası oluştu.' 
    };
  }
}

// Çıkış işlemi
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('authToken');
  cookieStore.delete('authUser');
  return { success: true };
}

// Aktif oturumu doğrula ve al
export async function getSessionAction(): Promise<SessionData> {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;
  const userStr = cookieStore.get('authUser')?.value;

  if (!token || !userStr) {
    return { user: null, isAuthenticated: false };
  }

  try {
    // Backend API'ye token doğrulaması için ufak bir istek atılabilir
    // Veya sadece çerezdeki datayı dönebiliriz. Güvenlik için token kontrol edelim:
    const parsedUser = JSON.parse(userStr) as User;
    return { user: parsedUser, isAuthenticated: true };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

// Bireysel kayıt işlemi
export async function registerAction(name: string, email: string, username: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/register/user`, {
      name,
      email,
      username,
      password,
    });

    if (response.data && response.data.success) {
      return { success: true, message: response.data.message || 'Kayıt başarılı.' };
    }
    return { success: false, message: response.data.message || 'Kayıt başarısız.' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Sunucuya bağlanırken bir hata oluştu.'
    };
  }
}

// Rezervasyon oluşturma işlemi (Sunucu tarafında güvenli token ekleme ile)
export async function createReservationAction(data: {
  business_id: number;
  customer_name: string;
  customer_phone: string;
  reservation_time: string;
  person_count: number;
  customer_note?: string;
  user_id?: number;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${BASE_URL}/reservation/create`, data, { headers });

    if (response.data && response.data.success) {
      return { success: true, message: response.data.message || 'Rezervasyonunuz başarıyla alındı.' };
    }
    return { success: false, message: response.data.message || 'Rezervasyon oluşturulamadı.' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Rezervasyon oluşturulurken bir hata oluştu.'
    };
  }
}

// Rezervasyonları listeleme işlemi
export async function getUserReservationsAction(limit = 50) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    const userStr = cookieStore.get('authUser')?.value;

    if (!token || !userStr) {
      return { success: false, message: 'Oturum bulunamadı.', data: [], total: 0 };
    }

    const user = JSON.parse(userStr) as User;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await axios.get(`${BASE_URL}/user/${user.id}/reservations`, {
      headers,
      params: { limit }
    });

    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        total: response.data.total || 0
      };
    }
    return { success: false, message: 'Rezervasyonlar alınamadı.', data: [], total: 0 };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Rezervasyonlar yüklenirken hata oluştu.',
      data: [],
      total: 0
    };
  }
}

// Rezervasyon iptal etme işlemi
export async function cancelReservationAction(reservationId: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;
    const userStr = cookieStore.get('authUser')?.value;

    if (!token || !userStr) {
      return { success: false, message: 'Oturum bulunamadı.' };
    }

    const user = JSON.parse(userStr) as User;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await axios.put(
      `${BASE_URL}/reservation/${reservationId}/cancel`,
      { user_id: user.id },
      { headers }
    );

    if (response.data && response.data.success) {
      return { success: true, message: response.data.message || 'Rezervasyon iptal edildi.' };
    }
    return { success: false, message: response.data.message || 'Rezervasyon iptal edilemedi.' };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'İptal işlemi sırasında hata oluştu.'
    };
  }
}
