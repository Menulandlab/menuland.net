/**
 * Türkçe karakterleri İngilizce karşılıklarına dönüştürür ve URL dostu hale getirir.
 */
export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i',
    'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  let slug = text.toString().toLowerCase().trim();
  
  // Türkçe karakter çevirisi
  Object.keys(trMap).forEach(key => {
    slug = slug.replaceAll(key, trMap[key]);
  });

  return slug
    .replace(/[^a-z0-9 -]/g, '') // Alfasayısal olmayan karakterleri kaldır (boşluk ve tire hariç)
    .replace(/\s+/g, '-')       // Boşlukları tireye dönüştür
    .replace(/-+/g, '-');       // Çoklu tireleri teke indir
}

/**
 * İşletme için SEO dostu URL üretir.
 */
export function getBusinessUrl(biz: { id: number; slug?: string | null; name?: string }) {
  if (biz.slug && biz.slug.trim() !== '') {
    return `/business/${biz.slug}-${biz.id}`;
  }
  const nameSlug = slugify(biz.name || 'isletme');
  return `/business/${nameSlug}-${biz.id}`;
}

/**
 * SEO dostu URL'den işletme ID'sini çıkarır.
 */
export function extractIdFromSlug(slugOrId: string): string {
  if (!slugOrId) return '';
  const parts = slugOrId.split('-');
  return parts[parts.length - 1]; // Son parça ID'dir
}

/**
 * Kategori için SEO dostu URL üretir.
 */
export function getCategoryUrl(cat: { id: number; name: string }) {
  const nameSlug = slugify(cat.name || 'kategori');
  return `/kategori/${nameSlug}-${cat.id}`;
}
