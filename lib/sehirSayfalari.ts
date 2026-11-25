import { unstable_cache } from 'next/cache';
import { slugify } from './utils';
import { API_URL } from './site';

/**
 * Şehir, ilçe, şehir × kategori ve gezilecek yerler sayfalarının verisi.
 *
 * Kaynak, uygulamanın da kullandığı herkese açık API'dir. Sayfalardaki her sayı bu veriden o an hesaplanır; elle
 * yazılmış sayı yoktur. Sonuç bir saat önbellekte tutulur (sayfalar da saatte bir yenilenir).
 *
 * Türkiye geneline açılış (16.11.2026): 81 ilin hepsinin sayfası vardır. İlin durumu içerikten hesaplanır:
 * - En az EN_AZ_ISLETME onaylı ve aktif işletmesi olan il "açık"tır; sayfası dizine girer, ilçe ve kategori
 *   sayfaları oluşur.
 * - Diğer iller "yakında"dır; sayfaları ziyaretçiye açıktır ama noindex taşır ve site haritasına girmez. Eşiği geçen il
 *   bir sonraki yayında kendiliğinden açılır. (Önce yalnızca veritabanında elle "active" yapılan iller sayfa alıyordu.)
 *
 * İnce sayfa kuralı: bir ilçe ya da kategori sayfası en az EN_AZ_ISLETME işletme varsa oluşur. Daha azı için sayfa
 * yoktur (404) ve site haritasına girmez; o işletmeler il sayfasında ve kendi sayfalarında görünmeye devam eder.
 */

export const EN_AZ_ISLETME = 3;
/** Gezilecek yerler sayfası için en az yer sayısı. */
export const EN_AZ_YER = 5;
const YENILEME_SANIYE = 3600;

export interface Sehir {
  id: number;
  ad: string;
  slug: string;
  isletmeSayisi: number;
  yerSayisi: number;
  enlem: number | null;
  boylam: number | null;
  acik: boolean;
}

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
  /** Menüsü Menuland'de (API'deki menulu alanı) */
  menulu: boolean;
  enlem: number | null;
  boylam: number | null;
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
  sehir: Sehir;
  isletmeler: SehirIsletmesi[];
  /** Sayfası olan ilçeler (en az EN_AZ_ISLETME işletmeli), çoktan aza. */
  ilceler: SehirIlcesi[];
  /** Sayfası olan kategoriler (en az EN_AZ_ISLETME işletmeli), çoktan aza. */
  kategoriler: SehirKategorisi[];
  /** Bütün ilçe adları (kartlarda ilçe adını yazmak için); "Merkez" ilçeleri "Giresun Merkez" diye yazılır. */
  ilceAdlari: Record<number, string>;
}

export interface Yer {
  id: number;
  ad: string;
  aciklama: string | null;
  gorsel: string | null;
  tur: string | null;
  ilce: string | null;
}

export interface YerVerisi {
  sehir: Sehir;
  yerler: Yer[];
  /** Keşfet kategorileri (Nesi Meşhur?, Mesire Alanları…), yalnızca bu ilde yeri olanlar. */
  kategoriler: Array<{ ad: string; slug: string; aciklama: string | null; yerIdleri: number[] }>;
}

type Ham = Record<string, unknown>;

async function getJson(yol: string, sure: number = YENILEME_SANIYE): Promise<unknown> {
  const yanit = await fetch(`${API_URL}${yol}`, { next: { revalidate: sure } });
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

function sayiVeyaNull(deger: unknown): number | null {
  const n = Number(deger);
  return deger !== null && deger !== undefined && deger !== '' && Number.isFinite(n) ? n : null;
}

/** "Merkez" adlı 51 ilçe, başlıklarda ve kartlarda il adıyla yazılır: "Giresun Merkez". */
export function ilceGorunenAdi(ilceAdi: string, sehirAdi: string): string {
  return ilceAdi.trim().toLocaleLowerCase('tr') === 'merkez' ? `${sehirAdi} Merkez` : ilceAdi;
}

/**
 * 81 il, içerikten hesaplanan durumla. API'nin eski sürümü özet döndürmezse (alanlar yoksa) yalnızca veritabanında
 * etkin olan iller açık sayılır; böylece API'den önce yayına çıkan site de bugünkü gibi çalışır.
 */
async function tumSehirleriGetir(sure: number): Promise<Sehir[]> {
  const ham = dizi(await getJson('/cities?ozet=1', sure)).filter((s) => s && s.id && s.name);
  if (ham.length === 0) {
    throw new Error('İl listesi boş geldi');
  }
  const ozetVar = ham.some((s) => 'isletme_sayisi' in s);
  return ham
    .map((s) => {
      const isletmeSayisi = ozetVar ? Number(s.isletme_sayisi) || 0 : s.status === 'active' ? EN_AZ_ISLETME : 0;
      return {
        id: Number(s.id),
        ad: String(s.name),
        slug: slugify(String(s.name)),
        isletmeSayisi,
        yerSayisi: ozetVar ? Number(s.yer_sayisi) || 0 : 0,
        enlem: sayiVeyaNull(s.latitude),
        boylam: sayiVeyaNull(s.longitude),
        acik: isletmeSayisi >= EN_AZ_ISLETME,
      };
    })
    .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
}

export const tumSehirler = unstable_cache(
  async (): Promise<Sehir[]> => tumSehirleriGetir(YENILEME_SANIYE),
  ['sehir-sayfalari-sehirler-v2'],
  { revalidate: YENILEME_SANIYE }
);

/** Açık iller (en az EN_AZ_ISLETME görünür işletmeli). */
export async function acikSehirler(): Promise<Sehir[]> {
  return (await tumSehirler()).filter((s) => s.acik);
}

/**
 * Bir ilin sayfa verisini API yanıtlarından kurar; kendisi istek atmaz. Tek il için (sehirVerisi) de bütün açık iller
 * için birden (acikSehirVerileri) aynı kurallar uygulanır; böylece site haritasındaki adresler sayfalarla aynı çıkar.
 */
function sehirVerisiniKur(sehir: Sehir, ilceHam: unknown, kategoriHam: unknown, isletmeHam: unknown): SehirVerisi {
  const ilceAdlari: Record<number, string> = {};
  const ilceListesi = dizi(ilceHam).filter((d) => d?.id && d?.name);
  for (const d of ilceListesi) {
    ilceAdlari[Number(d.id)] = ilceGorunenAdi(String(d.name), sehir.ad);
  }

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
      adres: b.adres ? String(b.adres) : b.address ? String(b.address) : null,
      rezervasyon: evet(b.accepts_reservations),
      gelAl: evet(b.has_takeaway),
      onecikan: evet(b.is_featured),
      menulu: evet(b.menulu),
      enlem: sayiVeyaNull(b.latitude),
      boylam: sayiVeyaNull(b.longitude),
    }));

  // Sıra: öne çıkanlar, sonra menüsü Menuland'de olanlar, sonra görseli olanlar, sonra ada göre (24.11.2026).
  // Uygulamadaki görüntülenme sayıları kullanılmadı: sitenin kodu herkese açık, o sayılar iç veri.
  isletmeler.sort(
    (a, b) =>
      Number(b.onecikan) - Number(a.onecikan) ||
      Number(b.menulu) - Number(a.menulu) ||
      Number(Boolean(b.gorsel)) - Number(Boolean(a.gorsel)) ||
      a.ad.localeCompare(b.ad, 'tr')
  );

  const ilceSayilari = new Map<number, number>();
  const kategoriSayilari = new Map<number, number>();
  for (const i of isletmeler) {
    if (i.ilceId) ilceSayilari.set(i.ilceId, (ilceSayilari.get(i.ilceId) || 0) + 1);
    for (const k of new Set(i.kategoriIdleri)) kategoriSayilari.set(k, (kategoriSayilari.get(k) || 0) + 1);
  }

  // İlçe sayfası için ilçenin veritabanında etkin olması gerekmez; yalnızca işletme sayısı eşiği geçerli.
  const ilceler: SehirIlcesi[] = ilceListesi
    .map((d) => ({
      id: Number(d.id),
      ad: ilceGorunenAdi(String(d.name), sehir.ad),
      slug: slugify(String(d.name)),
      sayi: ilceSayilari.get(Number(d.id)) || 0,
    }))
    .filter((d) => d.sayi >= EN_AZ_ISLETME)
    .sort((a, b) => b.sayi - a.sayi || a.ad.localeCompare(b.ad, 'tr'));

  // "gezilecek-yerler" adresi ilin gezilecek yerler sayfasına ayrılmıştır.
  const ilceSluglari = new Set([...ilceler.map((d) => d.slug), 'gezilecek-yerler']);
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
}

async function sehirVerisiniGetir(sehirSlug: string, sehirler: Sehir[], sure: number): Promise<SehirVerisi | null> {
  const sehir = sehirler.find((s) => s.slug === sehirSlug);
  if (!sehir || !sehir.acik) return null;

  const [ilceHam, kategoriHam, isletmeHam] = await Promise.all([
    getJson(`/districts?city_id=${sehir.id}`, sure),
    getJson('/businesslistingcategories', sure),
    // alanlar=liste: açıklama, yasal metinler ve 10 görsel alanı gelmez (Ordu'da 576 KB yerine yaklaşık 170 KB).
    getJson(`/businesses?city_id=${sehir.id}&status=approved&alanlar=liste`, sure),
  ]);
  return sehirVerisiniKur(sehir, ilceHam, kategoriHam, isletmeHam);
}

/** Bir ilin sayfa verisi; il yoksa ya da açık değilse null. */
export const sehirVerisi = unstable_cache(
  async (sehirSlug: string): Promise<SehirVerisi | null> =>
    sehirVerisiniGetir(sehirSlug, await tumSehirler(), YENILEME_SANIYE),
  ['sehir-sayfalari-veri-v3'],
  { revalidate: YENILEME_SANIYE }
);

/**
 * İşletme sayfası bir gün önbellekte kalır (app/business/[id]). Next.js bir sayfanın önbellek süresini, sayfada okunan en
 * kısa süreli önbelleğe indirdiği için işletme sayfası il ve benzer işletme verisini aynı kaynaktan ama günlük önbellekle
 * okur. Şehir sayfaları saatlik sürümü kullanmaya devam eder.
 */
const GUNLUK_SANIYE = 86400;

const tumSehirlerGunluk = unstable_cache(
  async (): Promise<Sehir[]> => tumSehirleriGetir(GUNLUK_SANIYE),
  ['isletme-sayfasi-sehirler-v1'],
  { revalidate: GUNLUK_SANIYE }
);

const sehirVerisiGunluk = unstable_cache(
  async (sehirSlug: string): Promise<SehirVerisi | null> =>
    sehirVerisiniGetir(sehirSlug, await tumSehirlerGunluk(), GUNLUK_SANIYE),
  ['isletme-sayfasi-sehir-veri-v1'],
  { revalidate: GUNLUK_SANIYE }
);

/** Aynı anda en fazla bu kadar il için istek atılır; barındırma sunucusu bir anda yüzlerce istek almaz. */
const ESZAMANLI_ISTEK = 8;

async function sinirliEszamanli<T, R>(liste: T[], sinir: number, is: (x: T) => Promise<R>): Promise<R[]> {
  const sonuc = new Array<R>(liste.length);
  let sira = 0;
  const isci = async () => {
    while (sira < liste.length) {
      const i = sira++;
      sonuc[i] = await is(liste[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(sinir, liste.length) }, isci));
  return sonuc;
}

/**
 * Bütün açık illerin sayfa verisi, bütün işletmelerin tek listesinden (GET /businesses?alanlar=liste) hesaplanır.
 * Site haritası bunu kullanır.
 *
 * 22.11.2026 gecesi zincir şubeleri yüklenince açık il sayısı 18'den 69'a çıktı. Site haritası her il için sırayla üç
 * istek atıyordu ve saatlik yenilemeyi yetiştiremedi; harita 22.11'deki hâlinde kaldı (829 işletme, 18 il). Artık il
 * başına yalnızca küçük ilçe listesi istenir, en fazla ESZAMANLI_ISTEK il birden. İlin açık olup olmadığı da
 * önbellekteki il özetinden değil, verilen güncel listeden sayılır.
 */
export async function acikSehirVerileri(tumIsletmeler: unknown[]): Promise<SehirVerisi[]> {
  const ilGore = new Map<number, Ham[]>();
  for (const b of dizi(tumIsletmeler)) {
    if (b.status !== 'approved' || (b.is_active !== undefined && !evet(b.is_active))) continue;
    const il = Number(b.city_id);
    if (!il) continue;
    const liste = ilGore.get(il);
    if (liste) liste.push(b);
    else ilGore.set(il, [b]);
  }

  const acik = (await tumSehirler())
    .map((s) => {
      const isletmeSayisi = ilGore.get(s.id)?.length || 0;
      return { ...s, isletmeSayisi, acik: isletmeSayisi >= EN_AZ_ISLETME };
    })
    .filter((s) => s.acik);
  if (acik.length === 0) return [];

  const kategoriHam = await getJson('/businesslistingcategories');
  const ilceHamlari = await sinirliEszamanli(acik, ESZAMANLI_ISTEK, (s) => getJson(`/districts?city_id=${s.id}`));
  return acik.map((s, i) => sehirVerisiniKur(s, ilceHamlari[i], kategoriHam, ilGore.get(s.id) || []));
}

/**
 * Bir yerin metni ya da fotoğrafı Kültür Portalı'ndan (kulturportali.gov.tr) alınmışsa, sitenin kullanım koşulları
 * kontrol edilene kadar gösterilmez (16.11.2026 kararı). İstanbul'daki 72 yerin 71'i böyle.
 */
function gosterilebilirYer(p: Ham): boolean {
  return !/kulturportali\.gov\.tr/i.test(`${p.source_url || ''} ${p.image_source_url || ''}`);
}

/** Bir ilin gezilecek yerleri; en az EN_AZ_YER gösterilebilir yer yoksa null. */
export const yerVerisi = unstable_cache(
  async (sehirSlug: string): Promise<YerVerisi | null> => {
    const sehir = (await tumSehirler()).find((s) => s.slug === sehirSlug);
    if (!sehir || sehir.yerSayisi < EN_AZ_YER) return null;

    const [yerHam, kategoriHam] = await Promise.all([
      getJson(`/places?city_id=${sehir.id}`),
      getJson('/discovery-categories?active=1'),
    ]);
    const yerler: Yer[] = dizi(yerHam)
      .filter((p) => p && p.id && p.name && gosterilebilirYer(p))
      .map((p) => ({
        id: Number(p.id),
        ad: String(p.name),
        aciklama: p.description ? String(p.description).replace(/\s+/g, ' ').trim() : null,
        gorsel: p.image_url ? String(p.image_url) : null,
        tur: p.type ? String(p.type) : null,
        ilce: p.district_name ? ilceGorunenAdi(String(p.district_name), sehir.ad) : null,
      }))
      .sort((a, b) => a.ad.localeCompare(b.ad, 'tr'));
    if (yerler.length < EN_AZ_YER) return null;

    const yerIdleri = new Set(yerler.map((y) => y.id));
    const kategoriler: YerVerisi['kategoriler'] = [];
    const etkinKategoriler = dizi(kategoriHam)
      .filter((k) => k?.slug && k?.name && (k.is_active === undefined || evet(k.is_active)))
      .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    // Kategori listeleri sırayla değil birlikte istenir; sıra korunur.
    const listeler = await Promise.all(
      etkinKategoriler.map((k) => getJson(`/places?city_id=${sehir.id}&category_slug=${encodeURIComponent(String(k.slug))}`))
    );
    etkinKategoriler.forEach((k, i) => {
      const idler = dizi(listeler[i]).map((p) => Number(p.id)).filter((id) => yerIdleri.has(id));
      if (idler.length > 0) {
        kategoriler.push({ ad: String(k.name), slug: String(k.slug), aciklama: k.description ? String(k.description) : null, yerIdleri: idler });
      }
    });
    return { sehir, yerler, kategoriler };
  },
  ['sehir-sayfalari-yerler-v1'],
  { revalidate: YENILEME_SANIYE }
);

/** İki il merkezi arasındaki kuş uçuşu mesafe (km). */
function mesafeKm(a: Sehir, b: Sehir): number {
  if (a.enlem === null || a.boylam === null || b.enlem === null || b.boylam === null) return Number.POSITIVE_INFINITY;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dEnlem = rad(b.enlem - a.enlem);
  const dBoylam = rad(b.boylam - a.boylam);
  const h = Math.sin(dEnlem / 2) ** 2 + Math.cos(rad(a.enlem)) * Math.cos(rad(b.enlem)) * Math.sin(dBoylam / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Bir ile en yakın açık il ve aradaki yaklaşık mesafe. */
export async function enYakinAcikSehir(sehir: Sehir): Promise<{ sehir: Sehir; km: number } | null> {
  const adaylar = (await acikSehirler()).filter((s) => s.id !== sehir.id);
  let enIyi: { sehir: Sehir; km: number } | null = null;
  for (const s of adaylar) {
    const km = mesafeKm(sehir, s);
    if (Number.isFinite(km) && (!enIyi || km < enIyi.km)) enIyi = { sehir: s, km };
  }
  return enIyi;
}

/** İki nokta arasındaki kuş uçuşu mesafe (km). */
function noktaMesafesiKm(a1: number, b1: number, a2: number, b2: number): number {
  const rad = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(rad(a2 - a1) / 2) ** 2 + Math.cos(rad(a1)) * Math.cos(rad(a2)) * Math.sin(rad(b2 - b1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export interface BenzerIsletme {
  id: number;
  ad: string;
  slug: string | null;
  ilce: string;
  km: number | null;
  menulu: boolean;
}

/** Bir işletmenin ait olduğu şehir, ilçe ve kategori sayfaları ve aynı ildeki benzer işletmeler (işletme sayfası için). */
export async function isletmeninSayfalari(isletme: {
  id?: number | string | null;
  city_id?: number | string | null;
  district_id?: number | string | null;
  categories?: Array<{ id: number | string }>;
  latitude?: number | string | null;
  longitude?: number | string | null;
}): Promise<{
  sehir: { ad: string; yol: string } | null;
  ilce: { ad: string; yol: string } | null;
  kategoriler: Array<{ ad: string; yol: string; baslik: string }>;
  /** Aynı ilde, en az bir kategorisi ortak işletmeler; konum varsa en yakından (24.11.2026). */
  benzerler: BenzerIsletme[];
}> {
  const bos = { sehir: null, ilce: null, kategoriler: [], benzerler: [] };
  if (!isletme.city_id) return bos;
  try {
    const sehir = (await tumSehirlerGunluk()).find((s) => s.acik && s.id === Number(isletme.city_id));
    if (!sehir) return bos;
    const veri = await sehirVerisiGunluk(sehir.slug);
    if (!veri) return bos;
    const ilce = veri.ilceler.find((d) => d.id === Number(isletme.district_id));
    const idler = new Set((isletme.categories || []).map((c) => Number(c.id)));
    const enlem = Number(isletme.latitude);
    const boylam = Number(isletme.longitude);
    const konum = Number.isFinite(enlem) && Number.isFinite(boylam) && enlem !== 0 && boylam !== 0;
    const benimId = Number(isletme.id);
    const benzerler: BenzerIsletme[] = veri.isletmeler
      .filter((i) => i.id !== benimId && i.kategoriIdleri.some((k) => idler.has(k)))
      .map((i) => ({
        id: i.id,
        ad: i.ad,
        slug: i.slug,
        ilce: i.ilceId ? veri.ilceAdlari[i.ilceId] || '' : '',
        km:
          konum && i.enlem !== null && i.boylam !== null && i.enlem !== 0 && i.boylam !== 0
            ? noktaMesafesiKm(enlem, boylam, i.enlem, i.boylam)
            : null,
        menulu: i.menulu,
      }))
      .sort(
        (a, b) =>
          (a.km ?? Number.POSITIVE_INFINITY) - (b.km ?? Number.POSITIVE_INFINITY) ||
          Number(b.menulu) - Number(a.menulu) ||
          a.ad.localeCompare(b.ad, 'tr')
      )
      .slice(0, 6);
    return {
      sehir: { ad: sehir.ad, yol: `/${sehir.slug}` },
      ilce: ilce ? { ad: ilce.ad, yol: `/${sehir.slug}/${ilce.slug}` } : null,
      kategoriler: veri.kategoriler
        .filter((k) => idler.has(k.id))
        .map((k) => ({ ad: k.ad, yol: `/${sehir.slug}/${k.slug}`, baslik: kategoriBasligi(sehir.ad, k.ad) })),
      benzerler,
    };
  } catch {
    return bos;
  }
}

/** Bir liste kategorisinin şehir sayfaları (kategori sayfasındaki bağlantı için). Yalnızca açık iller gezilir. */
export async function kategorininSehirSayfalari(kategoriId: number): Promise<Array<{ yol: string; baslik: string; sayi: number }>> {
  try {
    const sonuc: Array<{ yol: string; baslik: string; sayi: number }> = [];
    for (const s of await acikSehirler()) {
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
