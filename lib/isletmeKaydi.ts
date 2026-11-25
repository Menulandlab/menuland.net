import { API_URL } from './site';

/**
 * Bir işletmenin sitedeki sayfalarının önbellek etiketi.
 *
 * İşletme sayfası (/business/<ad>-<no>) ve menü yönlendirmesi (/business/<ad>-<no>/menu) bir gün önbellekte kalır.
 * İşletme kaydını getiren istek bu etiketi taşıdığı için sayfalar da etiketi taşır. Panelde ya da yönetim panelinde
 * işletme kaydedilince API /api/isletme-yenile ucunu çağırır; uç bu etiketi yeniler ve işletmenin bütün sayfaları
 * (eski adresli kopyalar dahil) bir sonraki ziyarette güncel bilgiyle yeniden hazırlanır.
 */
export function isletmeEtiketi(no: number): string {
  return `isletme-${no}`;
}

/** Adresin sonundaki işletme numarasını doğrular; geçersizse null döner. */
export function isletmeNumarasi(deger: string | number | null | undefined): number | null {
  const metin = String(deger ?? '').trim();
  if (!/^\d{1,10}$/.test(metin)) return null;
  const no = Number(metin);
  return Number.isSafeInteger(no) && no > 0 ? no : null;
}

/**
 * İşletme kaydını API'den getirir.
 *
 * - API, bilinmeyen ya da kaldırılmış işletmede 200 ile {success: false} döndürüyor. Bu durumda null döner, sayfa
 *   "bulunamadı" gösterir.
 * - API'ye ulaşılamazsa ya da sunucu hatası dönerse hata fırlatır. Böylece geçici bir kesinti, sayfayı bir gün boyunca
 *   "bulunamadı" olarak önbelleğe yazmaz: Next.js son sağlam kopyayı sunmaya devam eder ve sonraki ziyarette yeniden
 *   dener.
 * - İstek bilerek önbelleğe alınmaz (yalnızca etiket verilir). İşletme bilgisi her sayfa hazırlanışında API'den taze
 *   gelir; önbellekte tutulan şey sayfanın kendisidir.
 */
// Sayfalar kaydın birçok alanını doğrudan okuyor (görseller, saatler, menü ayarları); tip bilerek açık bırakıldı.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function isletmeKaydiniGetir(deger: string | number): Promise<any | null> {
  const no = isletmeNumarasi(deger);
  if (no === null) return null;

  const yanit = await fetch(`${API_URL}/businesses/${no}`, {
    headers: { Accept: 'application/json' },
    next: { tags: [isletmeEtiketi(no)] },
    signal: AbortSignal.timeout(15000),
  });

  if (yanit.status === 404) return null;
  if (!yanit.ok) {
    throw new Error(`İşletme ${no} alınamadı: API ${yanit.status} döndürdü.`);
  }

  const veri = await yanit.json();
  return veri && veri.success !== false && veri.name ? veri : null;
}
