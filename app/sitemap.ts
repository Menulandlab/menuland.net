import { MetadataRoute } from 'next';
import { getBusinesses, getBusinessListingCategories } from '@/src/api/businessService';
import { getBusinessUrl, getCategoryUrl } from '@/lib/utils';
import { getBlogPosts } from '@/src/api/blogService';
import { getAllDocsArticles } from '@/src/data/docs-data';
import { SITE_URL } from '@/lib/site';
import { acikSehirler, sehirVerisi, tumSehirler, yerVerisi, EN_AZ_YER } from '@/lib/sehirSayfalari';

type Siklik = MetadataRoute.Sitemap[number]['changeFrequency'];

/**
 * Site haritası. Adresler kanonik (www) alan adıyla yazılır; menuland.net adresi yönlendirme yaptığı için kullanılmaz.
 * "Son güncelleme" yalnızca gerçek bir tarih biliniyorsa yazılır (blog yazılarının yayın tarihi). Her derlemede o anın
 * saatini yazmak, Google'ın bu alana güvenini düşürür.
 */
// Site haritası saatte bir yenilenir (önce yalnızca yayında üretiliyordu); gece yayını da yeniler.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 1. Statik sayfalar
  const statik: Array<[string, Siklik, number]> = [
    ['', 'daily', 1.0],
    ['/blog', 'daily', 0.9],
    ['/kesfet', 'daily', 0.9],
    ['/all-businesses', 'daily', 0.9],
    ['/all-categories', 'weekly', 0.8],
    ['/sehirler', 'weekly', 0.85],
    ['/docs', 'weekly', 0.9],
    ['/hakkimizda', 'monthly', 0.5],
    ['/iletisim', 'monthly', 0.5],
    ['/gizlilik-politikasi', 'monthly', 0.5],
    ['/kullanim-kosullari', 'monthly', 0.5],
    ['/kvkk', 'monthly', 0.5],
  ];
  const staticPages: MetadataRoute.Sitemap = statik.map(([yol, changeFrequency, priority]) => ({
    url: `${baseUrl}${yol}`,
    changeFrequency,
    priority,
  }));

  // 2. Blog ve rehber yazıları
  const dynamicBlogPosts = await getBlogPosts();
  const blogPages: MetadataRoute.Sitemap = dynamicBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    ...(post.published_at ? { lastModified: new Date(post.published_at) } : {}),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 3. Kılavuz sayfaları
  const docsPages: MetadataRoute.Sitemap = getAllDocsArticles().map((doc) => ({
    url: `${baseUrl}/docs/${doc.categorySlug}/${doc.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // 4. İşletmeler (menüsü olsun olmasın hepsi; marka görünürlüğü için dizinde kalırlar). Yalnızca onaylı ve aktif
  //    olanlar girer; pasif işletmenin sayfası noindex taşır (16.11.2026).
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    // alanlar=liste: yalnızca kimlik, ad, slug ve durum gibi hafif alanlar gelir (bütün sütunlar yerine). Sayfa
    // gönderilmediği için API bütün işletmeleri döndürür; limit verilmez.
    const businesses = (await getBusinesses({ alanlar: 'liste' })).filter((biz: any) => {
      const durum = biz.status;
      const aktif = biz.is_active;
      return (durum === undefined || durum === 'approved') && (aktif === undefined || aktif === null || Number(aktif) === 1);
    });
    businessPages = businesses.map((biz) => ({
      url: `${baseUrl}${getBusinessUrl(biz)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap businesses fetch error:', error);
  }

  // 5. Kategoriler: yalnızca en az bir açık ilde işletmesi olanlar (boş kategori sayfası haritaya girmez).
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const doluKategoriler = new Set<number>();
    for (const s of await acikSehirler()) {
      const veri = await sehirVerisi(s.slug);
      for (const i of veri?.isletmeler || []) for (const k of i.kategoriIdleri) doluKategoriler.add(k);
    }
    const categories = (await getBusinessListingCategories()).filter((cat) => doluKategoriler.has(Number(cat.id)));
    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}${getCategoryUrl(cat)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap categories fetch error:', error);
  }

  // 6. Şehir, ilçe, şehir × kategori ve gezilecek yerler sayfaları. Yalnızca açık iller (en az 3 işletmeli) ve sayfası
  //    oluşan ilçe ve kategoriler girer; "yakında" il sayfaları noindex taşıdığı için haritaya girmez.
  //    Bu bölüm hata verirse derleme durur: şehir sayfaları olmadan yayına çıkılmaz.
  const sehirPages: MetadataRoute.Sitemap = [];
  {
    const sehirler = await acikSehirler();
    for (const s of sehirler) {
      const veri = await sehirVerisi(s.slug);
      if (!veri) continue;
      sehirPages.push({ url: `${baseUrl}/${s.slug}`, changeFrequency: 'weekly', priority: 0.85 });
      for (const d of veri.ilceler) {
        sehirPages.push({ url: `${baseUrl}/${s.slug}/${d.slug}`, changeFrequency: 'weekly', priority: 0.8 });
      }
      for (const k of veri.kategoriler) {
        sehirPages.push({ url: `${baseUrl}/${s.slug}/${k.slug}`, changeFrequency: 'weekly', priority: 0.75 });
      }
    }
    for (const s of (await tumSehirler()).filter((x) => x.yerSayisi >= EN_AZ_YER)) {
      if (await yerVerisi(s.slug)) {
        sehirPages.push({ url: `${baseUrl}/${s.slug}/gezilecek-yerler`, changeFrequency: 'weekly', priority: 0.75 });
      }
    }
  }

  return [...staticPages, ...docsPages, ...blogPages, ...sehirPages, ...categoryPages, ...businessPages];
}
