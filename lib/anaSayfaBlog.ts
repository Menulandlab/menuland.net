import { unstable_cache } from 'next/cache';
import { getBlogPosts } from '@/src/api/blogService';
import { blogPosts as sabitYazilar } from '@/src/data/blog-posts';

/**
 * Ana sayfadaki "Blog" bölümü için en yeni yazılar (27.11.2026).
 *
 * Ana sayfa önceden src/data/blog-posts.ts içindeki sabit yazıların ilk üçünü gösteriyordu; blogda yayınlanan yeni
 * yazılar ana sayfada hiç görünmüyordu. Artık yazılar /blog sayfasıyla aynı API'den gelir. Ana sayfa her istekte
 * çizildiği için (konum çerezleri) liste ayrıca önbelleğe alınır ve saatte bir yenilenir. API yanıt vermezse
 * getBlogPosts sabit yazılara düşer; önbellek de hata verirse yine sabit yazılar gösterilir.
 */
export type AnaSayfaBlogYazisi = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
};

const YENILEME_SANIYE = 3600;

function kisalt(yazi: {
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  category?: string;
  readTime?: string;
}): AnaSayfaBlogYazisi {
  return {
    slug: yazi.slug,
    title: yazi.title,
    excerpt: yazi.excerpt || '',
    image: yazi.image || '/img/blog/default.jpg',
    category: yazi.category || 'Gastronomi',
    readTime: yazi.readTime || '5 dk',
  };
}

const sonYazilariGetir = unstable_cache(
  async (adet: number): Promise<AnaSayfaBlogYazisi[]> =>
    (await getBlogPosts({ limit: adet })).slice(0, adet).map(kisalt),
  ['ana-sayfa-son-blog-yazilari-v1'],
  { revalidate: YENILEME_SANIYE }
);

export async function sonBlogYazilari(adet = 3): Promise<AnaSayfaBlogYazisi[]> {
  try {
    const yazilar = await sonYazilariGetir(adet);
    if (yazilar.length > 0) return yazilar;
  } catch {
    // Önbellek ya da API hatasında aşağıdaki sabit yazılar gösterilir.
  }
  return sabitYazilar.slice(0, adet).map(kisalt);
}
