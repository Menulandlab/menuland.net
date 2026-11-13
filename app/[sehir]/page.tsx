import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { etkinSehirler, sehirVerisi, kategoriBasligi, bulunmaEki, ayrilmaEki, listeHalinde } from '@/lib/sehirSayfalari';
import { SITE_URL, DEFAULT_OG_IMAGE, jsonLd } from '@/lib/site';
import { getBusinessUrl } from '@/lib/utils';
import { GezintiIzi, IsletmeIzgarasi, BaglantiCipleri, EkosistemBolumu } from '@/components/SehirSayfasi';

// Şehir sayfası: ilçe ve kategori sayfalarına giden ana sayfa. Veri saatte bir yenilenir.
export const revalidate = 3600;
// Yalnızca derlemede üretilen adresler vardır; bilinmeyen adresler gerçek 404 alır (sitenin kök loading.tsx'i
// yüzünden sayfa içinden çağrılan notFound() durum kodunu 200 bırakıyordu). Eşiği yeni geçen bir kategori ya da ilçe
// sayfası bir sonraki yayında oluşur.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ sehir: string }>;
}

export async function generateStaticParams() {
  const sehirler = await etkinSehirler().catch(() => []);
  return sehirler.map((s) => ({ sehir: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir } = await params;
  const veri = await sehirVerisi(sehir).catch(() => null);
  if (!veri) return {};
  const ad = veri.sehir.ad;
  const baslik = `${ad} Mekanları: İlçeler ve Kategoriler`;
  const aciklama = `${ad}${bulunmaEki(ad)} Menuland'de listelenen ${veri.isletmeler.length} mekânı ilçelere ve kategorilere göre keşfedin. Mekân sayfalarında adres ve varsa güncel menü yer alır.`;
  const yol = `/${veri.sehir.slug}`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: { title: `${baslik} | Menuland`, description: aciklama, url: yol, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function SehirSayfasi({ params }: PageProps) {
  const { sehir } = await params;
  const veri = await sehirVerisi(sehir).catch(() => null);
  if (!veri) notFound();

  const ad = veri.sehir.ad;
  const yol = `/${veri.sehir.slug}`;
  const kategoriAdlari: Record<number, string> = Object.fromEntries(veri.kategoriler.map((k) => [k.id, k.ad]));
  const ilceToplami = veri.ilceler.reduce((t, d) => t + d.sayi, 0);
  const digerIlceler = veri.isletmeler.length - ilceToplami;
  const secki = veri.isletmeler.slice(0, 12);
  const ilceCumlesi =
    veri.ilceler.length > 0
      ? ` İlçelere göre: ${listeHalinde(veri.ilceler.map((d) => `${d.ad} (${d.sayi})`))}${
          digerIlceler > 0 ? `; diğer ilçelerde ${digerIlceler} mekân var.` : '.'
        }`
      : '';
  const giris = `Menuland'de ${ad}${bulunmaEki(ad)} ${veri.isletmeler.length} mekân listeleniyor.${ilceCumlesi}`;

  const sayfaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: ad, item: `${SITE_URL}${yol}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${ad} mekânları`,
        numberOfItems: secki.length,
        itemListElement: secki.map((i, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: i.ad,
          url: `${SITE_URL}${getBusinessUrl({ id: i.id, slug: i.slug, name: i.ad })}`,
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-10 py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(sayfaJsonLd) }} />
      <GezintiIzi parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad }]} />

      <header className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-900">
          <MapPin className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" /> {ad} Mekanları
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">{giris}</p>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          {"Aşağıda ilçe ve kategori sayfalarını bulabilirsiniz. Her sayfa Menuland'deki güncel listeden oluşturulur ve saatte bir yenilenir."}
        </p>
      </header>

      <BaglantiCipleri
        baslik={`${ad} ilçeleri`}
        baglantilar={veri.ilceler.map((d) => ({ ad: `${d.ad} Mekanları`, yol: `${yol}/${d.slug}`, sayi: d.sayi }))}
      />

      <BaglantiCipleri
        baslik={`${ad} için kategoriler`}
        baglantilar={veri.kategoriler.map((k) => ({ ad: kategoriBasligi(ad, k.ad), yol: `${yol}/${k.slug}`, sayi: k.sayi }))}
      />

      {secki.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-zinc-900">{`${ad}${ayrilmaEki(ad)} mekânlar`}</h2>
            <Link href="/all-businesses" className="text-sm font-semibold text-[#FF4D00]">
              Tüm mekânları gör
            </Link>
          </div>
          <IsletmeIzgarasi isletmeler={secki} ilceAdlari={veri.ilceAdlari} kategoriAdlari={kategoriAdlari} />
        </section>
      )}

      <EkosistemBolumu utm="sehir-sayfasi" />
    </div>
  );
}
