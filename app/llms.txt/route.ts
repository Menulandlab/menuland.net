import { NextResponse } from 'next/server';
import { docsCategories } from '@/src/data/docs-data';
import { tumSehirler, yerVerisi, EN_AZ_YER, bulunmaEki } from '@/lib/sehirSayfalari';

// Bir saat önbellekten sunulur; şehir listesi saatte bir tazelenir.
export const revalidate = 3600;

export async function GET() {
  let text = `# Menuland - Dijital Menü, Keşif ve Sadakat Platformu

> Menuland; kullanıcıların şehirdeki popüler restoran ve kafeleri keşfettiği, masada temassız QR menü incelediği, Gel Al (Al-Götür) ile sıra beklemeden sipariş verdiği ve her harcamasında PuanLand sadakat puanı kazandığı çift taraflı gastronomi ve işletme ekosistemidir.

## Temel Özellikler
- **Gel Al (Al-Götür) Sipariş:** Sıra beklemeden uygulama üzerinden sipariş verme, mutfak hazırlığını anlık izleme ve restorandan teslim alma.
- **PuanLand Sadakat Programı:** Her sipariş ve mekan ziyaretinde puan kazanma, indirim kuponuna dönüştürme.
- **Yeni Yönetmeliğe Uygun QR Menü:** T.C. Ticaret Bakanlığı mevzuatına uygun gramaj, kalori, porsiyon ve 14 zorunlu alerjen bilgisi.
- **Mekan Keşfi ve Ne Yesem?:** İl ve ilçe bazında mekanları listeleme; "Ne Yesem?" ile kaydırarak seçim yapma ya da "Şaşırt Beni" ile rastgele öneri alma.
- **İşletme Yönetim Portalı:** Restoranlar için canlı Gel Al sipariş karşılama, masa QR kodları üretme, tek tıkla fiyat güncelleme.

## Dokümantasyon ve Kullanım Kılavuzları
`;

  docsCategories.forEach((cat) => {
    text += `\n### ${cat.title}\n`;
    cat.articles.forEach((art) => {
      text += `- [${art.title}](https://www.menuland.net/docs/${art.categorySlug}/${art.slug}): ${art.summary}\n`;
    });
  });

  // Açık iller ve gezilecek yerler sayfaları (16.11.2026). API'ye ulaşılamazsa bu bölüm boş kalır.
  const satirlar: string[] = [];
  for (const s of (await tumSehirler().catch(() => [])).filter((x) => x.acik)) {
    satirlar.push(`- [${s.ad} Mekanları](https://www.menuland.net/${s.slug}): ${s.ad}${bulunmaEki(s.ad)} Menuland'de listelenen ${s.isletmeSayisi} mekân, ilçe ve kategori sayfaları.`);
    if (s.yerSayisi >= EN_AZ_YER && (await yerVerisi(s.slug).catch(() => null))) {
      satirlar.push(`- [${s.ad}${bulunmaEki(s.ad)} Gezilecek Yerler](https://www.menuland.net/${s.slug}/gezilecek-yerler): Menuland Keşfet'teki yerler, kategorilere göre.`);
    }
  }
  const sehirSatirlari = satirlar.join('\n');

  text += `\n## Mekân Keşfi ve Rehberler
- [Şehirler](https://www.menuland.net/sehirler): Menuland'in açık olduğu iller ve yakında açılacak iller.
${sehirSatirlari ? `${sehirSatirlari}\n` : ''}- [Şehrini Keşfet](https://www.menuland.net/kesfet): İl ve ilçeye göre restoran, kafe ve etkinlikler.
- [Tüm Mekanlar](https://www.menuland.net/all-businesses): Menuland'de listelenen restoran, kafe ve mekânlar; işletme sayfalarında adres, iletişim ve varsa güncel menü.
- [Kategoriler](https://www.menuland.net/all-categories): Kahvaltı, akşam yemeği, kahve gibi kategorilere göre mekânlar.
- [Lezzet Rehberi ve Blog](https://www.menuland.net/blog): Şehir rehberleri ve yeme-içme yazıları.
`;

  text += `\n## Resmi Bağlantılar
- Ana Web Sitesi: https://www.menuland.net
- Dokümantasyon Merkezi: https://www.menuland.net/docs
- İşletmeler için: https://kurumsal.menuland.net
- İşletme Portalı: https://isletme.menuland.net
- iOS uygulaması: https://apps.apple.com/tr/app/menuland/id6618147785?l=tr
- Android uygulaması: https://play.google.com/store/apps/details?id=com.mycompany.menuland
- İletişim & Destek: destek@menuland.net
`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
