import { privateApiClient } from '../api/client';

/**
 * Kullanıcı davranışlarını backend'e iletmek için kullanılır.
 * @param event Olay adı (örn. 'search', 'favorite_add', 'menu_view')
 * @param data Ekstra veri (opsiyonel)
 */
export async function trackEvent(event: string, data?: object) {
  try {
    await privateApiClient.post('/track', {
      event,
      data: data || {},
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Sessizce yut, kullanıcıya hata gösterme
    console.warn('Track event failed:', error);
  }
} 