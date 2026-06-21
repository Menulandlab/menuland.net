import analytics from '@react-native-firebase/analytics';
import { publicApiClient, privateApiClient } from '../api/client';
import { getDeviceId } from '../utils/deviceId';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Session bazlı görüntülenme takibi.
 * 
 * Kurallar:
 * 1. Kullanıcı sayfada 3 saniye kalırsa görüntülenme sayılır
 * 2. Aynı session'da (uygulama açıkken) aynı işletme için sadece 1 kez sayılır
 * 3. İstek tamamen sessizdir (hata gösterilmez)
 */

// Memory cache: Bu session'da görüntülenen işletmeler
const viewedBusinessesInSession = new Set<string>();

interface TrackBusinessViewParams {
  businessId: string | number;
  userId?: string | number | null;
}

/**
 * İşletme görüntülenmesini hem backend'e hem de Firebase Analytics'e bildirir.
 * 
 * @param businessId - İşletme ID'si
 * @param userId - Kullanıcı ID'si (giriş yapmışsa)
 */
export async function trackBusinessView({
  businessId,
  userId
}: TrackBusinessViewParams): Promise<void> {
  try {
    const businessIdStr = String(businessId);

    // Session kontrolü: Bu session'da zaten görüntülendiyse işlem yapma
    if (viewedBusinessesInSession.has(businessIdStr)) {
      console.log(`[Analytics] İşletme ${businessIdStr} bu session'da zaten görüntülendi, tekrar sayılmayacak.`);
      return;
    }

    // Firebase Analytics Tracking
    try {
      await analytics().logEvent('view_business', {
        business_id: businessIdStr,
        user_id: userId ? String(userId) : 'guest',
        timestamp: new Date().toISOString()
      });
      console.log(`[Firebase] ✅ view_business event logged for: ${businessIdStr}`);
    } catch (fbError) {
      console.warn('[Firebase] Analytics event log failed:', fbError);
    }

    // Device ID'yi al
    const deviceId = await getDeviceId();

    // privateApiClient kullan: token varsa otomatik ekler, yoksa token'sız gönderir
    // Misafir kullanıcılar için backend 401 dönebilir — sessizce handle ediliyor
    const res = await privateApiClient.post('/analytics/view', {
      business_id: Number(businessId),
      user_id: userId || null,
      device_id: deviceId,
    });

    // Session cache'e ekle
    viewedBusinessesInSession.add(businessIdStr);

    console.log(`[Analytics] ✅ İşletme görüntülenmesi kaydedildi: ${businessIdStr}`, res.status);
  } catch (error: any) {
    // Sessiz başarısızlık - kullanıcıya gösterme
    console.warn('[Analytics] ❌ Görüntülenme kaydedilemedi:', {
      status: error?.response?.status,
      data: error?.response?.data,
      message: error?.message,
    });
  }
}

/**
 * 3 saniye kuralını uygulayan hook yardımcısı.
 * Component unmount olursa veya süre dolmadan çıkılırsa tracking yapılmaz.
 * 
 * @returns Cleanup fonksiyonu
 */
export function scheduleBusinessViewTracking(
  params: TrackBusinessViewParams,
  delayMs: number = 3000
): () => void {
  const timeoutId = setTimeout(() => {
    trackBusinessView(params);
  }, delayMs);

  // Cleanup fonksiyonu: Component unmount olursa timeout'u iptal et
  return () => clearTimeout(timeoutId);
}

/**
 * Uygulama tamamen kapanıp açıldığında session cache'i temizle.
 * (Opsiyonel: App.tsx veya _layout.tsx'te çağrılabilir)
 */
export function clearViewSession(): void {
  viewedBusinessesInSession.clear();
  console.log('[Analytics] Session cache temizlendi.');
}
