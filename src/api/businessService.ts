import { publicApiClient } from './client';

export interface BusinessResponse {
  id: number;
  name: string;
  image_url_1: string;
  image_url_medium?: string;
  image_url_thumb?: string;
  image_url_2?: string;
  category_text?: string;
  rating: string;
  description?: string;
  address?: string;
  phone?: string;
  instagram_url?: string;
  website?: string;
  latitude?: string;
  longitude?: string;
  menu_url?: string;
  slug?: string | null;
  isFeatured?: boolean;
  distance?: number;
  categories?: Array<{ id: number; name: string; }>;
  business_listing_categories?: Array<{ id: number; name: string; }>;
}

export interface CategoryResponse {
  id: number;
  name: string;
  image_url: string;
}

/**
 * İşletmeleri getirir
 */
export const getBusinesses = async (params: {
  city_id?: number | string;
  district_id?: number | string;
  category_id?: number;
  featured?: boolean;
  search?: string;
  lat?: number;
  lon?: number;
  limit?: number;
  ids?: number[];
}): Promise<BusinessResponse[]> => {
  try {
    const response = await publicApiClient.get('/businesses', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
};

/**
 * Kategorileri getirir
 */
export const getBusinessListingCategories = async (): Promise<CategoryResponse[]> => {
  try {
    const response = await publicApiClient.get('/businesslistingcategories');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Öne çıkan işletmeyi getirir
 */
export const getFeaturedBusiness = async (params: {
  district_id?: number | string;
  lat?: number;
  lon?: number;
}): Promise<BusinessResponse | null> => {
  try {
    const response = await getBusinesses({ ...params, featured: true, limit: 1 });
    return response.length > 0 ? response[0] : null;
  } catch (error) {
    console.error('Error fetching featured business:', error);
    return null;
  }
};

/**
 * Kategoriye göre işletmeleri getirir
 */
export const getBusinessesByCategory = async (categoryId: number, params: {
  city_id?: number | string;
  district_id?: number | string;
  lat?: number;
  lon?: number;
}): Promise<BusinessResponse[]> => {
  try {
    return await getBusinesses({ ...params, category_id: categoryId });
  } catch (error) {
    console.error('Error fetching businesses by category:', error);
    return [];
  }
};
