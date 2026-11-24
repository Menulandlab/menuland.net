import { cache } from 'react';
import { webPublicClient } from './api';

/**
 * İl ve ilçe adları (başlık, açıklama ve yapılandırılmış veri için); bulunamazsa boş döner.
 * Keşfet'teki yer kayıtlarında il ve ilçe adı gelmeyebiliyor, yalnızca numaraları geliyor (24.11.2026).
 */
export const yerAdlari = cache(async (cityId?: number | string | null, districtId?: number | string | null) => {
  let il = '';
  let ilce = '';
  try {
    if (cityId) {
      const sehirler = await webPublicClient.get('/cities');
      const liste = Array.isArray(sehirler.data) ? sehirler.data : sehirler.data?.data || [];
      il = liste.find((s: { id?: unknown; name?: string }) => Number(s.id) === Number(cityId))?.name || '';
      if (districtId) {
        const ilceler = await webPublicClient.get('/districts', { params: { city_id: cityId } });
        const ilceListesi = Array.isArray(ilceler.data) ? ilceler.data : ilceler.data?.data || [];
        ilce = ilceListesi.find((d: { id?: unknown; name?: string }) => Number(d.id) === Number(districtId))?.name || '';
      }
    }
  } catch {
    // Ad bulunamazsa başlık yalnızca yerin adıyla kurulur.
  }
  return { il, ilce };
});
