import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { isletmeEtiketi, isletmeNumarasi } from '@/lib/isletmeKaydi';

/**
 * İşletme sayfası yenileme ucu.
 *
 * İşletme sayfaları bir gün önbellekte kalır. Panelde ya da yönetim panelinde bir işletme kaydedilince API bu uca
 * işletme numarasını gönderir; uç o işletmenin önbellek etiketinin süresini hemen doldurur. Sayfa bir sonraki ziyarette
 * güncel bilgiyle yeniden hazırlanır, diğer sayfalar önbellekten sunulmaya devam eder.
 *
 * İstek:  POST /api/isletme-yenile
 *         X-Yenileme-Anahtari: <ISLETME_YENILEME_ANAHTARI ortam değişkeninin değeri>
 *         {"idler": [12, 34]}  ya da  {"id": 12}
 * Yanıt:  {"basarili": true, "yenilenen": [12, 34]}
 *
 * Anahtar yalnızca ortam değişkeninde durur, kodda yoktur. Değişken tanımlı değilse uç kapalıdır (503).
 */

const EN_COK_ISLETME = 100;

function ozet(deger: string): Buffer {
  return createHash('sha256').update(deger).digest();
}

/** Anahtarları sabit sürede karşılaştırır; uzunluk farkı da sızmaz. */
function anahtarDogruMu(gelen: string | null, beklenen: string): boolean {
  if (!gelen) return false;
  return timingSafeEqual(ozet(gelen), ozet(beklenen));
}

function yanit(govde: Record<string, unknown>, durum: number): Response {
  return Response.json(govde, { status: durum, headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(istek: Request): Promise<Response> {
  const beklenen = process.env.ISLETME_YENILEME_ANAHTARI;
  if (!beklenen) {
    return yanit({ basarili: false, hata: 'Yenileme kapalı.' }, 503);
  }
  if (!anahtarDogruMu(istek.headers.get('x-yenileme-anahtari'), beklenen)) {
    return yanit({ basarili: false, hata: 'Yetkisiz istek.' }, 401);
  }

  let govde: unknown;
  try {
    govde = await istek.json();
  } catch {
    return yanit({ basarili: false, hata: 'Gövde JSON değil.' }, 400);
  }

  const kayit = (govde ?? {}) as { id?: unknown; idler?: unknown };
  const hamListe: unknown[] = Array.isArray(kayit.idler) ? kayit.idler : kayit.id !== undefined ? [kayit.id] : [];
  const numaralar = [
    ...new Set(
      hamListe
        .map((deger) => isletmeNumarasi(typeof deger === 'number' || typeof deger === 'string' ? deger : null))
        .filter((no): no is number => no !== null),
    ),
  ];

  if (numaralar.length === 0) {
    return yanit({ basarili: false, hata: 'Geçerli işletme numarası yok.' }, 400);
  }
  if (numaralar.length > EN_COK_ISLETME) {
    return yanit({ basarili: false, hata: `Bir istekte en çok ${EN_COK_ISLETME} işletme yenilenir.` }, 400);
  }

  // Dışarıdan çağrılan uçta süre hemen dolmalı: sonraki ziyaretçi eski kopyayı değil güncel sayfayı görür.
  for (const no of numaralar) {
    revalidateTag(isletmeEtiketi(no), { expire: 0 });
  }
  console.log(`[isletme-yenile] ${numaralar.join(',')}`);

  return yanit({ basarili: true, yenilenen: numaralar }, 200);
}
