// Sabit metin: derlemede bir kez üretilir, her istekte sunucu çalışmaz.
export const dynamic = 'force-static';

/**
 * Reklam satmaya yetkili satıcılar (ads.txt). Yandex satırları Yandex Reklam Ağı panelinden (Ayarlar > Genel >
 * ads.txt) indirilen dosyadan aynen alındı (26.11.2026); Yandex satırları değişirse panelden yeniden indirilip
 * buraya yazılır. Google satırı, ileride AdSense'e yeniden başvurulursa diye duruyor.
 *
 * public/ads.txt aynı içeriği taşır ve bu listeyle birebir aynı tutulmalıdır. Vercel'de bu uç sunulur
 * (26.11.2026 canlıda x-matched-path /ads.txt); yerel `next dev` iki kopya için uyarı verir.
 */
const SATIRLAR = [
  'google.com, pub-3776725197972523, DIRECT, f08c47fec0942fa0',
  // Yandex Reklam Ağı
  'yandex.com, 10257922, DIRECT',
  'google.com, pub-5533854580432370, RESELLER, f08c47fec0942fa0',
  'improvedigital.com, 2031, RESELLER',
  'uis.mobfox.com, 165, RESELLER',
  'hyperad.tech, 215, RESELLER',
  'betweendigital.com, 43554, RESELLER',
  'Contextweb.com, 562899, RESELLER, 89ff185a4c4e857c',
  'hyperad.tech, 150, RESELLER',
];

export async function GET() {
  return new Response(`${SATIRLAR.join('\n')}\n`, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
