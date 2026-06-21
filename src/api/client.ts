import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.service.menuland.net';

/**
 * Token GEREKTİRMEYEN, halka açık API istekleri için kullanılır.
 * Örn: /api/public/cities, /api/public/businesses
 */
export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Token GEREKTİREN, korumalı API istekleri için kullanılır.
 * Örn: /api/favorites
 */
export const privateApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Public API için interceptor
publicApiClient.interceptors.request.use(
  async (config) => {
    if (__DEV__) {
      console.log(`[Public API] ${config.url}`);
      if (config.params) {
        console.log(`[Public API] Params: ${JSON.stringify(config.params)}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Public API retry interceptor
publicApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Retry sadece network hataları ve 5xx hataları için
    if (!config || !error.response || (error.response.status >= 500 && error.response.status < 600) || error.code === 'ECONNABORTED') {
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 2) {
        config._retryCount += 1;
        if (__DEV__) {
          console.log(`[Public API] Retry ${config._retryCount}/2 for ${config.url}`);
        }
        
        // Exponential backoff: 1s, 2s
        await new Promise(resolve => setTimeout(resolve, 1000 * config._retryCount));
        return publicApiClient(config);
      }
    }
    
    return Promise.reject(error);
  }
);

// Private API için interceptor - TOKEN EKLENİYOR
privateApiClient.interceptors.request.use(
  async (config) => {
    if (__DEV__) {
      console.log(`[Private API] ${config.url}`);
    }
    
    const token = await AsyncStorage.getItem('@authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (__DEV__) {
        console.log(`[Private API] ✅ Token eklendi: ${token.substring(0, 20)}...`);
      }
    } else {
      if (__DEV__) {
        console.warn('[Private API] ⚠️ Token bulunamadı!');
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Private API retry interceptor
privateApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // 401: Token süresi dolmuş veya geçersiz — storage'ı temizle
    if (error.response?.status === 401) {
      if (__DEV__) {
        console.warn('[Private API] 401 alındı, token temizleniyor:', config?.url);
      }
      await AsyncStorage.multiRemove(['@authToken', '@authUser']);
      return Promise.reject(error);
    }
    
    // Retry sadece network hataları ve 5xx hataları için (401/403 gibi auth hatalarında retry yok)
    if (!config || !error.response || (error.response.status >= 500 && error.response.status < 600) || error.code === 'ECONNABORTED') {
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 2) {
        config._retryCount += 1;
        if (__DEV__) {
          console.log(`[Private API] Retry ${config._retryCount}/2 for ${config.url}`);
        }
        
        // Exponential backoff: 1s, 2s
        await new Promise(resolve => setTimeout(resolve, 1000 * config._retryCount));
        return privateApiClient(config);
      }
    }
    
    return Promise.reject(error);
  }
);