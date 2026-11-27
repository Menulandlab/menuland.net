import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/profil', '/rezervasyonlarim', '/actions/', '/sifre-yenile'],
      },
      // SEO araçlarının tarayıcıları (Ahrefs, Semrush, Majestic, Moz ve benzerleri) siteye ziyaretçi getirmiyor ama her
      // sayfayı tarayıp sunucu süresi harcıyor; bunlara site kapalı. Google, Bing, Yandex ve yapay zekâ arama botları
      // yukarıdaki genel kuralla açık kalır.
      {
        userAgent: [
          'AhrefsBot',
          'AhrefsSiteAudit',
          'SemrushBot',
          'SiteAuditBot',
          'MJ12bot',
          'DotBot',
          'rogerbot',
          'BLEXBot',
          'DataForSeoBot',
          'Barkrowler',
          'serpstatbot',
          'SEOkicks',
          'MegaIndex',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
