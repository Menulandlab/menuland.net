import { MetadataRoute } from 'next';
import { getBusinessListingCategories } from '@/src/api/businessService';
import { publicApiClient } from '@/src/api/client';
import { getBusinessUrl, getCategoryUrl } from '@/lib/utils';
import { getBlogPosts } from '@/src/api/blogService';
import { getAllDocsArticles } from '@/src/data/docs-data';
import { SITE_URL } from '@/lib/site';
import { acikSehirVerileri, tumSehirler, yerVerisi, EN_AZ_YER } from '@/lib/sehirSayfalari';

type Siklik = MetadataRoute.Sitemap[number]['changeFrequency'];

/**
 * Site haritası. Adresler kanonik (www) alan adıyla yazılır; menuland.net adresi yönlendirme yaptığı için kullanılmaz.
 * "Son güncelleme" yalnızca gerçek bir tarih biliniyorsa yazılır (blog yazılarının yayın tarihi). Her derlemede o anın
 * saatini yazmak, Google'ın bu alana güvenini düşürür.
 */
// Site haritası saatte bir yenilenir (önce yalnızca yayında üretiliyordu); gece yayını da yeniler.
export const revalidate = 3600;

/**
 * Bütün işletmeler tek istekte. alanlar=liste: kimlik, ad, slug, il, ilçe, kategori ve durum gibi hafif alanlar gelir;
 * sayfa gönderilmediği için API hepsini döndürür. İşletme, il, ilçe ve kategori adreslerinin hepsi bu listeden çıkar.
 *
 * Liste gelmezse hata fırlatılır: yayında derleme durur, saatlik yenilemede önceki harita yerinde kalır. Böylece
 * işletmesiz ya da şehirsiz bir harita yayınlanmaz.
 */
async function tumIsletmeler(): Promise<Array<Record<string, any>>> {
  // 23.11.2026'da 3.978 işletmede yanıt yaklaşık 3,5 MB; istemcinin 15 saniyelik varsayılan süresi yerine 60 saniye.
  const yanit = await publicApiClient.get('/businesses', { params: { alanlar: 'liste' }, timeout: 60000 });
  const liste = Array.isArray(yanit.data) ? yanit.data : [];
  if (liste.length === 0) {
    throw new Error('Site haritası: işletme listesi boş geldi');
  }
  return liste;
}

/** Gezilecek yerler sayfası olan illerin adresleri (en az EN_AZ_YER gösterilebilir yeri olanlar). */
async function gezilecekYerSehirleri(): Promise<string[]> {
  const adaylar = (await tumSehirler()).filter((s) => s.yerSayisi >= EN_AZ_YER);
  const veriler = await Promise.all(adaylar.map((s) => yerVerisi(s.slug)));
  return adaylar.filter((_, i) => veriler[i] !== null).map((s) => s.slug);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;

  // Uzun süren istekler birlikte başlar (önce sırayla bekleniyordu).
  const [dynamicBlogPosts, isletmeler, yerSehirleri] = await Promise.all([
    getBlogPosts(),
    tumIsletmeler(),
    gezilecekYerSehirleri(),
  ]);

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
  const businessPages: MetadataRoute.Sitemap = isletmeler
    .filter((biz) => {
      const durum = biz.status;
      const aktif = biz.is_active;
      return (durum === undefined || durum === 'approved') && (aktif === undefined || aktif === null || Number(aktif) === 1);
    })
    .map((biz) => ({
      url: `${baseUrl}${getBusinessUrl(biz as { id: number; slug?: string | null; name?: string })}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  // 5. Şehir, ilçe, şehir × kategori ve gezilecek yerler sayfaları. Yalnızca açık iller (en az 3 işletmeli) ve sayfası
  //    oluşan ilçe ve kategoriler girer; "yakında" il sayfaları noindex taşıdığı için haritaya girmez.
  //    Bu bölüm hata verirse derleme durur: şehir sayfaları olmadan yayına çıkılmaz.
  const sehirVerileri = await acikSehirVerileri(isletmeler);
  const sehirPages: MetadataRoute.Sitemap = [];
  for (const veri of sehirVerileri) {
    const slug = veri.sehir.slug;
    sehirPages.push({ url: `${baseUrl}/${slug}`, changeFrequency: 'weekly', priority: 0.85 });
    for (const d of veri.ilceler) {
      sehirPages.push({ url: `${baseUrl}/${slug}/${d.slug}`, changeFrequency: 'weekly', priority: 0.8 });
    }
    for (const k of veri.kategoriler) {
      sehirPages.push({ url: `${baseUrl}/${slug}/${k.slug}`, changeFrequency: 'weekly', priority: 0.75 });
    }
  }
  for (const slug of yerSehirleri) {
    sehirPages.push({ url: `${baseUrl}/${slug}/gezilecek-yerler`, changeFrequency: 'weekly', priority: 0.75 });
  }

  // 6. Kategoriler: yalnızca en az bir açık ilde işletmesi olanlar (boş kategori sayfası haritaya girmez).
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const doluKategoriler = new Set<number>();
    for (const veri of sehirVerileri) {
      for (const i of veri.isletmeler) for (const k of i.kategoriIdleri) doluKategoriler.add(k);
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

  return [...staticPages, ...docsPages, ...blogPages, ...sehirPages, ...categoryPages, ...businessPages];
}
