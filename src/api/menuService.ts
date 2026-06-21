import axios from 'axios';
import { publicApiClient } from './client';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DailyMenuItem {
  name: string;
  price: number | string;
  description?: string | null;
  calories?: number | null;
  allergens?: string | null;
  ingredients?: string | null;
  contains_alcohol?: boolean;
  contains_pork?: boolean;
}

export interface DailyMenuResponse {
  success: boolean;
  menu_mode: 'daily' | 'fixed';
  business_name: string;
  business_id: number;
  today_dow: number; // 1=Pazartesi … 7=Pazar
  today_date: string;
  today_items: DailyMenuItem[];
}

export interface FixedMenuItem {
  id: number;
  category_id: number;
  name: string;
  name_en?: string | null;
  description?: string | null;
  price: number | string;
  image_url?: string | null;
  is_available: boolean;
  sort_order: number;
  calories?: number | null;
  allergens?: string | null;
  ingredients?: string | null;
  contains_alcohol?: boolean;
  contains_pork?: boolean;
}

export interface MenuCategory {
  id: number;
  menu_id: number;
  name: string;
  name_en?: string | null;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  items: FixedMenuItem[];
}

export interface FixedMenuInfo {
  id: number;
  business_id: number;
  title: string;
  logo_url?: string | null;
  primary_color?: string | null;
  is_active: boolean;
}

export interface FixedMenuResponse {
  data: {
    menu: FixedMenuInfo;
    categories: MenuCategory[];
  };
}

// ─── API calls ───────────────────────────────────────────────────────────────

/**
 * QR menü modunu ve günlük menü verilerini çeker.
 * Token gerektirmez.
 * slug yoksa business_id ile fallback yapılır.
 */
export const fetchMenuMode = async (
  businessId: number,
  slug?: string | null
): Promise<DailyMenuResponse> => {
  const params = slug ? { slug } : { business_id: businessId };
  const response = await axios.get<DailyMenuResponse>(
    'https://isletme.menuland.net/api/daily-menu/public.php',
    { params, timeout: 10000 }
  );
  if (!response.data?.success) {
    throw new Error('QR menü kaydı bulunamadı');
  }
  return response.data;
};

/**
 * Sabit menü kategorilerini ve ürünlerini çeker.
 * Token gerektirmez.
 */
export const fetchFixedMenu = async (
  businessId: number,
  slug?: string | null
): Promise<FixedMenuResponse> => {
  const path = slug
    ? `/business/menu/slug/${encodeURIComponent(slug)}`
    : `/business/menu/${businessId}`;
  const response = await publicApiClient.get<FixedMenuResponse>(path);
  return response.data;
};
