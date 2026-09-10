import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/profil', '/rezervasyonlarim', '/actions/'],
      },
    ],
    sitemap: 'https://menuland.net/sitemap.xml',
  };
}
