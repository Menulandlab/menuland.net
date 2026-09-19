import { MetadataRoute } from 'next';
import { getBusinesses, getBusinessListingCategories } from '@/src/api/businessService';
import { getBusinessUrl, getCategoryUrl } from '@/lib/utils';
import { blogPosts } from '@/src/data/blog-posts';
import { getAllDocsArticles } from '@/src/data/docs-data';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://menuland.net';

  // 1. Statik Sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/kesfet`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/all-businesses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/all-categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kullanim-kosullari`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kvkk`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // 2. Blog & Rehber Yazıları
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 3. Dokümantasyon & Bilgi Merkezi Sayfaları
  const docsArticles = getAllDocsArticles();
  const docsPages: MetadataRoute.Sitemap = docsArticles.map((doc) => ({
    url: `${baseUrl}/docs/${doc.categorySlug}/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // 3. Dinamik İşletmeler (Mekanlar)
  let businessPages: MetadataRoute.Sitemap = [];
  try {
    const businesses = await getBusinesses({ limit: 200 });
    businessPages = businesses.map((biz) => ({
      url: `${baseUrl}${getBusinessUrl(biz)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Sitemap businesses fetch error:', error);
  }

  // 4. Dinamik Kategoriler
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getBusinessListingCategories();
    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}${getCategoryUrl(cat)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap categories fetch error:', error);
  }

  return [...staticPages, ...docsPages, ...blogPages, ...categoryPages, ...businessPages];
}
