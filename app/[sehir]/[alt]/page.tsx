import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { MapPin, Utensils } from 'lucide-react';
import {
  etkinSehirler,
  sehirVerisi,
  kategoriBasligi,
  bulunmaEki,
  listeHalinde,
  type SehirVerisi,
  type SehirIlcesi,
  type SehirKategorisi,
  type SehirIsletmesi,
} from '@/lib/sehirSayfalari';
import { SITE_URL, DEFAULT_OG_IMAGE, jsonLd } from '@/lib/site';
import { getBusinessUrl } from '@/lib/utils';
import { GezintiIzi, IsletmeIzgarasi, BaglantiCipleri, EkosistemBolumu } from '@/components/SehirSayfasi';

// Şehir × kategori (örneğin /ordu/kahvalti) ya da ilçe (örneğin /ordu/altinordu) sayfası. Veri saatte bir yenilenir.
export const revalidate = 3600;
// Yalnızca derlemede üretilen adresler vardır; bilinmeyen adresler gerçek 404 alır (sitenin kök loading.tsx'i
// yüzünden sayfa içinden çağrılan notFound() durum kodunu 200 bırakıyordu). Eşiği yeni geçen bir kategori ya da ilçe
// sayfası bir sonraki yayında oluşur.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ sehir: string; alt: string }>;
}

type Sayfa =
  | { tur: 'ilce'; veri: SehirVerisi; ilce: SehirIlcesi; isletmeler: SehirIsletmesi[] }
  | { tur: 'kategori'; veri: SehirVerisi; kategori: SehirKategorisi; isletmeler: SehirIsletmesi[] };

export async function generateStaticParams() {
  const sehirler = await etkinSehirler().catch(() => []);
  const sonuc: Array<{ sehir: string; alt: string }> = [];
  for (const s of sehirler) {
    const veri = await sehirVerisi(s.slug).catch(() => null);
    if (!veri) continue;
    for (const d of veri.ilceler) sonuc.push({ sehir: s.slug, alt: d.slug });
    for (const k of veri.kategoriler) sonuc.push({ sehir: s.slug, alt: k.slug });
  }
  return sonuc;
}

// generateMetadata ve sayfa aynı istekte aynı veriyi kullanır.
const sayfayiBul = cache(async (sehir: string, alt: string): Promise<Sayfa | null> => {
  const veri = await sehirVerisi(sehir).catch(() => null);
  if (!veri) return null;
  const ilce = veri.ilceler.find((d) => d.slug === alt);
  if (ilce) {
    return { tur: 'ilce', veri, ilce, isletmeler: veri.isletmeler.filter((i) => i.ilceId === ilce.id) };
  }
  const kategori = veri.kategoriler.find((k) => k.slug === alt);
  if (kategori) {
    return { tur: 'kategori', veri, kategori, isletmeler: veri.isletmeler.filter((i) => i.kategoriIdleri.includes(kategori.id)) };
  }
  return null;
});

function adlarIleOzet(isletmeler: SehirIsletmesi[]): string {
  const ilkUc = isletmeler.slice(0, 3).map((i) => i.ad);
  return isletmeler.length > 3 ? `${ilkUc.join(', ')} ve diğerleri` : listeHalinde(ilkUc);
}

function sayfaBasligi(s: Sayfa): string {
  const sehirAdi = s.veri.sehir.ad;
  return s.tur === 'ilce' ? `${s.ilce.ad} Mekanları` : kategoriBasligi(sehirAdi, s.kategori.ad);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir, alt } = await params;
  const s = await sayfayiBul(sehir, alt);
  if (!s) return {};
  const sehirAdi = s.veri.sehir.ad;
  const n = s.isletmeler.length;
  const baslik = s.tur === 'ilce' ? `${s.ilce.ad} Mekanları · ${sehirAdi}` : sayfaBasligi(s);
  const aciklama =
    s.tur === 'ilce'
      ? `${s.ilce.ad}${bulunmaEki(s.ilce.ad)} Menuland'de listelenen ${n} mekân: ${adlarIleOzet(s.isletmeler)}. Adresler ve varsa güncel menüler mekân sayfalarında.`
      : `${sehirAdi}${bulunmaEki(sehirAdi)} “${s.kategori.ad}” kategorisinde Menuland'de listelenen ${n} mekân: ${adlarIleOzet(s.isletmeler)}. Adresler ve varsa güncel menüler mekân sayfalarında.`;
  const yol = `/${s.veri.sehir.slug}/${alt}`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: { title: `${baslik} | Menuland`, description: aciklama, url: yol, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function SehirAltSayfasi({ params }: PageProps) {
  const { sehir, alt } = await params;
  const s = await sayfayiBul(sehir, alt);
  if (!s) notFound();

  const { veri, isletmeler } = s;
  const sehirAdi = veri.sehir.ad;
  const sehirYolu = `/${veri.sehir.slug}`;
  const yol = `${sehirYolu}/${alt}`;
  const baslik = sayfaBasligi(s);
  const kategoriAdlari: Record<number, string> = Object.fromEntries(veri.kategoriler.map((k) => [k.id, k.ad]));
  const bolumAdi = s.tur === 'ilce' ? s.ilce.ad : s.kategori.ad;

  // Giriş metni yalnızca bu sayfanın verisinden hesaplanır.
  let giris: string;
  if (s.tur === 'ilce') {
    const sayilar = new Map<number, number>();
    for (const i of isletmeler) for (const k of new Set(i.kategoriIdleri)) sayilar.set(k, (sayilar.get(k) || 0) + 1);
    const enCok = [...sayilar.entries()]
      .filter(([k]) => kategoriAdlari[k])
      .sort((a, b) => b[1] - a[1] || kategoriAdlari[a[0]].localeCompare(kategoriAdlari[b[0]], 'tr'))
      .slice(0, 5)
      .map(([k, n]) => `${kategoriAdlari[k]} (${n})`);
    giris = `Menuland'de ${s.ilce.ad}${bulunmaEki(s.ilce.ad)} ${isletmeler.length} mekân listeleniyor.${
      enCok.length > 0 ? ` Bu ilçede en çok listelenen kategoriler: ${listeHalinde(enCok)}.` : ''
    }`;
  } else {
    const sayilar = new Map<number, number>();
    for (const i of isletmeler) if (i.ilceId) sayilar.set(i.ilceId, (sayilar.get(i.ilceId) || 0) + 1);
    const dagilim = [...sayilar.entries()]
      .filter(([d]) => veri.ilceAdlari[d])
      .sort((a, b) => b[1] - a[1] || veri.ilceAdlari[a[0]].localeCompare(veri.ilceAdlari[b[0]], 'tr'))
      .map(([d, n]) => `${veri.ilceAdlari[d]} (${n})`);
    giris = `Menuland'de ${sehirAdi}${bulunmaEki(sehirAdi)} “${s.kategori.ad}” kategorisinde ${isletmeler.length} mekân listeleniyor.${
      dagilim.length > 0 ? ` İlçelere göre: ${listeHalinde(dagilim)}.` : ''
    }`;
  }
  const etiketVar = isletmeler.some((i) => i.rezervasyon || i.gelAl);

  const sayfaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: sehirAdi, item: `${SITE_URL}${sehirYolu}` },
          { '@type': 'ListItem', position: 3, name: bolumAdi, item: `${SITE_URL}${yol}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: baslik,
        numberOfItems: isletmeler.length,
        itemListElement: isletmeler.map((i, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: i.ad,
          url: `${SITE_URL}${getBusinessUrl({ id: i.id, slug: i.slug, name: i.ad })}`,
        })),
      },
    ],
  };

  const digerIlceler = veri.ilceler
    .filter((d) => !(s.tur === 'ilce' && d.id === s.ilce.id))
    .map((d) => ({ ad: `${d.ad} Mekanları`, yol: `${sehirYolu}/${d.slug}`, sayi: d.sayi }));
  const kategoriBaglantilari = veri.kategoriler
    .filter((k) => !(s.tur === 'kategori' && k.id === s.kategori.id))
    .slice(0, 24)
    .map((k) => ({ ad: kategoriBasligi(sehirAdi, k.ad), yol: `${sehirYolu}/${k.slug}`, sayi: k.sayi }));

  return (
    <div className="flex flex-col gap-10 py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(sayfaJsonLd) }} />
      <GezintiIzi parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad: sehirAdi, yol: sehirYolu }, { ad: bolumAdi }]} />

      <header className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-900">
          {s.tur === 'ilce' ? (
            <MapPin className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" />
          ) : (
            <Utensils className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" />
          )}
          {baslik}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">{giris}</p>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          {"Mekânın adına basarak adresini ve varsa Menuland'deki güncel menüsünü görebilirsiniz."}
          {etiketVar && ' Kartlardaki “Rezervasyon” ve “Gel-Al” etiketleri, mekânın bu hizmeti Menuland üzerinden sunduğunu gösterir.'}
        </p>
      </header>

      <IsletmeIzgarasi isletmeler={isletmeler} ilceAdlari={veri.ilceAdlari} kategoriAdlari={kategoriAdlari} />

      {s.tur === 'kategori' ? (
        <>
          <BaglantiCipleri baslik={`${sehirAdi} ilçeleri`} baglantilar={digerIlceler} />
          <BaglantiCipleri baslik={`${sehirAdi}${bulunmaEki(sehirAdi)} diğer kategoriler`} baglantilar={kategoriBaglantilari} />
        </>
      ) : (
        <>
          <BaglantiCipleri baslik={`${sehirAdi} için kategoriler`} baglantilar={kategoriBaglantilari} />
          <BaglantiCipleri baslik="Diğer ilçeler" baglantilar={digerIlceler} />
        </>
      )}

      <EkosistemBolumu utm={s.tur === 'ilce' ? 'ilce-sayfasi' : 'kategori-sayfasi'} />
    </div>
  );
}
