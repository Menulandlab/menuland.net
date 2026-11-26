'use server';

import { cookies } from 'next/headers';
import { publicApiClient } from '@/src/api/client';
import { createReservation, getUserReservations, cancelReservation } from '@/src/api/reservationService';
import { User } from '@/src/context/AuthContext';

const BASE_URL = 'https://api.service.menuland.net';

export interface SessionData {
  user: User | null;
  isAuthenticated: boolean;
}

// Giriş işlemi
export async function loginAction(username: string, password: string) {
  try {
    const response = await publicApiClient.post('/auth/login', { username, password });

    if (response.data && response.data.success) {
      const { token, user } = response.data.data;

      if (!token || !user) {
        return { success: false, message: 'Sunucudan eksik veri geldi.' };
      }

      // Sitede yalnızca bireysel (uygulama) hesabıyla oturum açılır. /auth/login işletme sahibi ve yönetici
      // hesaplarını da kabul ediyor; onların jetonu sitede işe yaramaz ve çereze yazılmaz (26.11.2026).
      if (user.user_type !== 'mobile') {
        return {
          success: false,
          message:
            'Bu bilgiler bir işletme ya da yönetim hesabına ait. Sitede Menuland bireysel hesabınızla giriş yapın; işletme paneli isletme.menuland.net adresinde.',
        };
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
    const response = await publicApiClient.post('/auth/google', { token: googleToken });

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
    const parsedUser = JSON.parse(userStr) as User;
    return { user: parsedUser, isAuthenticated: true };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

/** Kayıt bilgilerini API'ye göndermeden önce denetler; sorun varsa kullanıcıya gösterilecek mesajı döndürür. */
function kayitHatasi(ad: string, eposta: string, kullaniciAdi: string, sifre: string): string | null {
  if (ad.length < 2 || ad.length > 80) return 'Lütfen adınızı ve soyadınızı yazın.';
  if (eposta.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) return 'Lütfen geçerli bir e-posta adresi yazın.';
  if (!/^[A-Za-z0-9._]{3,30}$/.test(kullaniciAdi)) {
    return 'Kullanıcı adı 3–30 karakter olmalı; yalnızca harf, rakam, nokta ve alt çizgi kullanılabilir.';
  }
  if (sifre.length < 8 || sifre.length > 128) return 'Şifreniz en az 8 karakter olmalı.';
  return null;
}

// Bireysel kayıt işlemi
// epostaIzni: kayıt formundaki isteğe bağlı "kampanya ve duyuruları e-postayla almak istiyorum" kutusu; API bunu
// explicit_consent_given olarak saklar. tuzak: botlar için gizli alan; insan görmez ve doldurmaz.
export async function registerAction(
  name: string,
  email: string,
  username: string,
  password: string,
  epostaIzni = false,
  tuzak = '',
) {
  if (tuzak) {
    return { success: false, message: 'Kayıt sırasında bir hata oluştu.' };
  }
  const ad = String(name ?? '').trim();
  const eposta = String(email ?? '').trim().toLowerCase();
  const kullaniciAdi = String(username ?? '').trim();
  const sifre = String(password ?? '');
  const hata = kayitHatasi(ad, eposta, kullaniciAdi, sifre);
  if (hata) {
    return { success: false, message: hata };
  }

  try {
    const response = await publicApiClient.post('/register/user', {
      name: ad,
      email: eposta,
      username: kullaniciAdi,
      password: sifre,
      explicit_consent_given: epostaIzni === true,
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
    const res = await createReservation(data);
    if (res.success) {
      return { success: true, message: res.message || 'Rezervasyonunuz başarıyla alındı.' };
    }
    return { success: false, message: res.message || 'Rezervasyon oluşturulamadı.' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Rezervasyon oluşturulurken bir hata oluştu.'
    };
  }
}

// Rezervasyonları listeleme işlemi
export async function getUserReservationsAction(limit = 50) {
  try {
    const cookieStore = await cookies();
    const userStr = cookieStore.get('authUser')?.value;

    if (!userStr) {
      return { success: false, message: 'Oturum bulunamadı.', data: [], total: 0 };
    }

    const user = JSON.parse(userStr) as User;
    const res = await getUserReservations(user.id, limit);

    if (res.success) {
      return {
        success: true,
        data: res.data || [],
        total: res.total || 0
      };
    }
    return { success: false, message: 'Rezervasyonlar alınamadı.', data: [], total: 0 };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Rezervasyonlar yüklenirken hata oluştu.',
      data: [],
      total: 0
    };
  }
}

// Rezervasyon iptal etme işlemi
export async function cancelReservationAction(reservationId: number) {
  try {
    const cookieStore = await cookies();
    const userStr = cookieStore.get('authUser')?.value;

    if (!userStr) {
      return { success: false, message: 'Oturum bulunamadı.' };
    }

    const user = JSON.parse(userStr) as User;
    const res = await cancelReservation(reservationId, user.id);

    if (res.success) {
      return { success: true, message: res.message || 'Rezervasyon iptal edildi.' };
    }
    return { success: false, message: res.message || 'Rezervasyon iptal edilemedi.' };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'İptal işlemi sırasında hata oluştu.'
    };
  }
}
