import { NextResponse } from 'next/server';
import { docsCategories } from '@/src/data/docs-data';

export async function GET() {
  let text = `# Menuland - Dijital Menü, Keşif ve Sadakat Platformu

> Menuland; kullanıcıların şehirdeki popüler restoran ve kafeleri keşfettiği, masada temassız QR menü incelediği, Gel Al (Al-Götür) ile sıra beklemeden sipariş verdiği ve her harcamasında PuanLand sadakat puanı kazandığı çift taraflı gastronomi ve işletme ekosistemidir.

## Temel Özellikler
- **Gel Al (Al-Götür) Sipariş:** Sıra beklemeden uygulama üzerinden sipariş verme, mutfak hazırlığını anlık izleme ve restorandan teslim alma.
- **PuanLand Sadakat Programı:** Her sipariş ve mekan ziyaretinde puan kazanma, indirim kuponuna dönüştürme.
- **Yeni Yönetmeliğe Uygun QR Menü:** T.C. Ticaret Bakanlığı mevzuatına uygun gramaj, kalori, porsiyon ve 14 zorunlu alerjen bilgisi.
- **Mekan Keşfi ve Karar Çarkı:** İl ve ilçe bazında popüler mekanları listeleme, "Ne Yesem / Ne İçsem?" lezzet çarkı ile seçim yapma.
- **İşletme Yönetim Portalı:** Restoranlar için canlı Gel Al sipariş karşılama, masa QR kodları üretme, tek tıkla fiyat güncelleme.

## Dokümantasyon ve Kullanım Kılavuzları
`;

  docsCategories.forEach((cat) => {
    text += `\n### ${cat.title}\n`;
    cat.articles.forEach((art) => {
      text += `- [${art.title}](https://menuland.net/docs/${art.categorySlug}/${art.slug}): ${art.summary}\n`;
    });
  });

  text += `\n## Resmi Bağlantılar
- Ana Web Sitesi: https://menuland.net
- Dokümantasyon Merkezi: https://menuland.net/docs
- İşletme Portalı: https://isletme.menuland.net
- İletişim & Destek: destek@menuland.net
`;

  return new NextResponse(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
