import { unstable_cache } from 'next/cache';
import { slugify } from './utils';

/**
 * Şehir, ilçe ve şehir × kategori sayfalarının verisi.
 *
 * Kaynak, uygulamanın da kullandığı herkese açık API'dir: etkin şehirler, etkin ilçeler, liste kategorileri ve bir
 * şehirdeki onaylı, etkin işletmeler (kategorileriyle birlikte). Sayfalardaki her sayı bu veriden o an hesaplanır;
 * elle yazılmış sayı yoktur. Sonuç bir saat önbellekte tutulur (sayfalar da saatte bir yenilenir).
 *
 * İnce sayfa kuralı: bir kategori ya da ilçe sayfası, en az EN_AZ_ISLETME işletme varsa oluşur. Daha azı için sayfa
 * yoktur (404) ve site haritasına girmez; o işletmeler şehir sayfasında ve kendi sayfalarında görünmeye devam eder.
 */

const API = 'https://api.service.menuland.net';
export const EN_AZ_ISLETME = 3;
const YENILEME_SANIYE = 3600;

export interface SehirIsletmesi {
  id: number;
  ad: string;
  slug: string | null;
  ilceId: number | null;
  kategoriIdleri: number[];
  gorsel: string | null;
  aciklama: string | null;
  adres: string | null;
  rezervasyon: boolean;
  gelAl: boolean;
  onecikan: boolean;
}

export interface SehirKategorisi {
  id: number;
  ad: string;
  slug: string;
  sayi: number;
}

export interface SehirIlcesi {
  id: number;
  ad: string;
  slug: string;
  sayi: number;
}

export interface SehirVerisi {
  sehir: { id: number; ad: string; slug: string };
  isletmeler: SehirIsletmesi[];
  /** Sayfası olan ilçeler (etkin ve en az EN_AZ_ISLETME işletmeli), çoktan aza. */
  ilceler: SehirIlcesi[];
  /** Sayfası olan kategoriler (en az EN_AZ_ISLETME işletmeli), çoktan aza. */
  kategoriler: SehirKategorisi[];
  /** Etkin olsun olmasın bütün ilçe adları (kartlarda ilçe adını yazmak için). */
  ilceAdlari: Record<number, string>;
}

type Ham = Record<string, unknown>;

async function getJson(yol: string): Promise<unknown> {
  const yanit = await fetch(`${API}${yol}`, { next: { revalidate: YENILEME_SANIYE } });
  if (!yanit.ok) {
    throw new Error(`${yol} isteği ${yanit.status} döndü`);
  }
  return yanit.json();
}

function dizi(veri: unknown): Ham[] {
  const liste = Array.isArray(veri) ? veri : Array.isArray((veri as Ham | null)?.data) ? ((veri as Ham).data as unknown[]) : [];
  return liste.filter((x): x is Ham => typeof x === 'object' && x !== null);
}

function evet(deger: unknown): boolean {
  return deger === 1 || deger === '1' || deger === true;
}

/** Etkin şehirler (adres parçasıyla). */
export const etkinSehirler = unstable_cache(
  async (): Promise<Array<{ id: number; ad: string; slug: string }>> => {
    const sehirler = dizi(await getJson('/cities?status=active'));
    return sehirler
      .filter((s) => s && s.id && s.name)
      .map((s) => ({ id: Number(s.id), ad: String(s.name), slug: slugify(String(s.name)) }));
  },
  ['sehir-sayfalari-sehirler-v1'],
  { revalidate: YENILEME_SANIYE }
);

/** Bir şehrin sayfa verisi; şehir etkin değilse null. */
export const sehirVerisi = unstable_cache(
  async (sehirSlug: string): Promise<SehirVerisi | null> => {
    const sehirler = await etkinSehirler();
    const sehir = sehirler.find((s) => s.slug === sehirSlug);
    if (!sehir) return null;

    const [ilceHam, etkinIlceHam, kategoriHam, isletmeHam] = await Promise.all([
      getJson(`/districts?city_id=${sehir.id}`),
      getJson(`/districts?city_id=${sehir.id}&status=active`),
      getJson('/businesslistingcategories'),
      getJson(`/businesses?city_id=${sehir.id}&status=approved`),
    ]);

    const ilceAdlari: Record<number, string> = {};
    for (const d of dizi(ilceHam)) {
      if (d?.id && d?.name) ilceAdlari[Number(d.id)] = String(d.name);
    }
    const etkinIlceler = dizi(etkinIlceHam).filter((d) => d?.id && d?.name);

    const isletmeler: SehirIsletmesi[] = dizi(isletmeHam)
      .filter((b) => b && b.id && b.name && b.status === 'approved' && (b.is_active === undefined || evet(b.is_active)))
      .map((b) => ({
        id: Number(b.id),
        ad: String(b.name),
        slug: b.slug ? String(b.slug) : null,
        ilceId: b.district_id ? Number(b.district_id) : null,
        kategoriIdleri: dizi(b.categories).map((c) => Number(c.id)).filter(Boolean),
        gorsel: String(b.image_url_medium || b.image_url_thumb || b.image_url_1 || '') || null,
        aciklama: b.description ? String(b.description).replace(/\s+/g, ' ').trim().slice(0, 220) : null,
        adres: b.address ? String(b.address) : null,
        rezervasyon: evet(b.accepts_reservations),
        gelAl: evet(b.has_takeaway),
        onecikan: evet(b.is_featured),
      }));

    // Sıra: öne çıkanlar, sonra görseli olanlar, sonra ada göre.
    isletmeler.sort(
      (a, b) =>
        Number(b.onecikan) - Number(a.onecikan) ||
        Number(Boolean(b.gorsel)) - Number(Boolean(a.gorsel)) ||
        a.ad.localeCompare(b.ad, 'tr')
    );

    const ilceSayilari = new Map<number, number>();
    const kategoriSayilari = new Map<number, number>();
    for (const i of isletmeler) {
      if (i.ilceId) ilceSayilari.set(i.ilceId, (ilceSayilari.get(i.ilceId) || 0) + 1);
      for (const k of new Set(i.kategoriIdleri)) kategoriSayilari.set(k, (kategoriSayilari.get(k) || 0) + 1);
    }

    const ilceler: SehirIlcesi[] = etkinIlceler
      .map((d) => ({ id: Number(d.id), ad: String(d.name), slug: slugify(String(d.name)), sayi: ilceSayilari.get(Number(d.id)) || 0 }))
      .filter((d) => d.sayi >= EN_AZ_ISLETME)
      .sort((a, b) => b.sayi - a.sayi || a.ad.localeCompare(b.ad, 'tr'));

    const ilceSluglari = new Set(ilceler.map((d) => d.slug));
    const kullanilanSluglar = new Set<string>();
    const kategoriler: SehirKategorisi[] = [];
    for (const k of dizi(kategoriHam)) {
      if (!k?.id || !k?.name) continue;
      const sayi = kategoriSayilari.get(Number(k.id)) || 0;
      if (sayi < EN_AZ_ISLETME) continue;
      let slug = slugify(String(k.name));
      // İlçe adıyla ya da başka bir kategoriyle aynı adres çıkarsa kategoriye numarası eklenir.
      if (!slug || ilceSluglari.has(slug) || kullanilanSluglar.has(slug)) slug = `${slug || 'kategori'}-${k.id}`;
      kullanilanSluglar.add(slug);
      kategoriler.push({ id: Number(k.id), ad: String(k.name), slug, sayi });
    }
    kategoriler.sort((a, b) => b.sayi - a.sayi || a.ad.localeCompare(b.ad, 'tr'));

    return { sehir, isletmeler, ilceler, kategoriler, ilceAdlari };
  },
  ['sehir-sayfalari-veri-v1'],
  { revalidate: YENILEME_SANIYE }
);

/** Bir işletmenin ait olduğu şehir, ilçe ve kategori sayfaları (işletme sayfasındaki bağlantılar için). */
export async function isletmeninSayfalari(isletme: {
  city_id?: number | string | null;
  district_id?: number | string | null;
  categories?: Array<{ id: number | string }>;
}): Promise<{
  sehir: { ad: string; yol: string } | null;
  ilce: { ad: string; yol: string } | null;
  kategoriler: Array<{ ad: string; yol: string; baslik: string }>;
}> {
  const bos = { sehir: null, ilce: null, kategoriler: [] };
  if (!isletme.city_id) return bos;
  try {
    const sehirler = await etkinSehirler();
    const sehir = sehirler.find((s) => s.id === Number(isletme.city_id));
    if (!sehir) return bos;
    const veri = await sehirVerisi(sehir.slug);
    if (!veri) return bos;
    const ilce = veri.ilceler.find((d) => d.id === Number(isletme.district_id));
    const idler = new Set((isletme.categories || []).map((c) => Number(c.id)));
    return {
      sehir: { ad: sehir.ad, yol: `/${sehir.slug}` },
      ilce: ilce ? { ad: ilce.ad, yol: `/${sehir.slug}/${ilce.slug}` } : null,
      kategoriler: veri.kategoriler
        .filter((k) => idler.has(k.id))
        .map((k) => ({ ad: k.ad, yol: `/${sehir.slug}/${k.slug}`, baslik: kategoriBasligi(sehir.ad, k.ad) })),
    };
  } catch {
    return bos;
  }
}

/** Bir liste kategorisinin şehir sayfası (kategori sayfasındaki bağlantı için). */
export async function kategorininSehirSayfalari(kategoriId: number): Promise<Array<{ yol: string; baslik: string; sayi: number }>> {
  try {
    const sehirler = await etkinSehirler();
    const sonuc: Array<{ yol: string; baslik: string; sayi: number }> = [];
    for (const s of sehirler) {
      const veri = await sehirVerisi(s.slug);
      const k = veri?.kategoriler.find((x) => x.id === kategoriId);
      if (veri && k) sonuc.push({ yol: `/${s.slug}/${k.slug}`, baslik: kategoriBasligi(s.ad, k.ad), sayi: k.sayi });
    }
    return sonuc;
  } catch {
    return [];
  }
}

const KENDI_ISMI_YETEN = [
  'mekanlar', 'mekanları', 'işletmeler', 'noktaları', 'lezzetleri', 'lezzetler', 'dükkanları',
  'ürünler', 'ürünleri', 'menüsü', 'öğünleri', 'yemekleri', 'mekânlar', 'mekânları',
];

/** "Ordu Kahvaltı Mekanları", "Ordu Bahçeli Mekanlar", "Ordu Ev Yemekleri" gibi başlıklar. */
export function kategoriBasligi(sehirAdi: string, kategoriAdi: string): string {
  const son = kategoriAdi.trim().split(/\s+/).pop()?.toLocaleLowerCase('tr') || '';
  return KENDI_ISMI_YETEN.includes(son) ? `${sehirAdi} ${kategoriAdi}` : `${sehirAdi} ${kategoriAdi} Mekanları`;
}

/** Türkçe bulunma eki: Ordu'da, Perşembe'de, Kars'ta. */
export function bulunmaEki(ad: string): string {
  const kucuk = ad.toLocaleLowerCase('tr');
  const unluler = kucuk.match(/[aeıioöuü]/g);
  const sonUnlu = unluler ? unluler[unluler.length - 1] : 'a';
  const kalin = ['a', 'ı', 'o', 'u'].includes(sonUnlu);
  const sonHarf = kucuk.slice(-1);
  const sert = 'çfhkpsşt'.includes(sonHarf);
  return `'${sert ? 't' : 'd'}${kalin ? 'a' : 'e'}`;
}

/** Türkçe ayrılma eki: Ordu'dan, Perşembe'den, Kars'tan. */
export function ayrilmaEki(ad: string): string {
  return `${bulunmaEki(ad)}n`;
}

/** "Altınordu, Fatsa ve Ünye" */
export function listeHalinde(parcalar: string[]): string {
  if (parcalar.length <= 1) return parcalar.join('');
  return `${parcalar.slice(0, -1).join(', ')} ve ${parcalar[parcalar.length - 1]}`;
}
