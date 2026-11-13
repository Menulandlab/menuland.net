import { MetadataRoute } from 'next';
import { getBusinesses, getBusinessListingCategories } from '@/src/api/businessService';
import { getBusinessUrl, getCategoryUrl } from '@/lib/utils';
import { getBlogPosts } from '@/src/api/blogService';
import { getAllDocsArticles } from '@/src/data/docs-data';
import { SITE_URL } from '@/lib/site';
import { etkinSehirler, sehirVerisi } from '@/lib/sehirSayfalari';

type Siklik = MetadataRoute.Sitemap[number]['changeFrequency'];

/**
 * Site haritası. Adresler kanonik (www) alan adıyla yazılır; menuland.net adresi yönlendirme yaptığı için kullanılmaz.
 * "Son güncelleme" yalnızca gerçek bir tarih biliniyorsa yazılır (blog yazılarının yayın tarihi). Her derlemede o anın
 * saatini yazmak, Google'ın bu alana güvenini düşürür.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // 1. Statik sayfalar
  const statik: Array<[string, Siklik, number]> = [
    ['', 'daily', 1.0],
    ['/blog', 'daily', 0.9],
    ['/kesfet', 'daily', 0.9],
    ['/all-businesses', 'daily', 0.9],
    ['/all-categories', 'weekly', 0.8],
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

  // 4. İşletmeler (menüsü olsun olmasın hepsi; marka görünürlüğü için dizinde kalırlar)
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    const businesses = await getBusinesses({ limit: 1000 });
    businessPages = businesses.map((biz) => ({
      url: `${baseUrl}${getBusinessUrl(biz)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap businesses fetch error:', error);
  }

  // 5. Kategoriler
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getBusinessListingCategories();
    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}${getCategoryUrl(cat)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap categories fetch error:', error);
  }

  // 6. Şehir, ilçe ve şehir × kategori sayfaları. Yalnızca sayfası oluşan (en az 3 işletmeli) ilçe ve kategoriler girer.
  const sehirPages: MetadataRoute.Sitemap = [];
  try {
    const sehirler = await etkinSehirler();
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
  } catch (error) {
    console.error('Sitemap city pages error:', error);
  }

  return [...staticPages, ...docsPages, ...blogPages, ...sehirPages, ...categoryPages, ...businessPages];
}
