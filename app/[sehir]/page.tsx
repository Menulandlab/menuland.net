import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Landmark } from 'lucide-react';
import {
  tumSehirler,
  acikSehirler,
  sehirVerisi,
  enYakinAcikSehir,
  kategoriBasligi,
  bulunmaEki,
  ayrilmaEki,
  listeHalinde,
  EN_AZ_YER,
} from '@/lib/sehirSayfalari';
import { SITE_URL, DEFAULT_OG_IMAGE, jsonLd } from '@/lib/site';
import { getBusinessUrl } from '@/lib/utils';
import { GezintiIzi, IsletmeIzgarasi, BaglantiCipleri, EkosistemBolumu, SehirYakinda } from '@/components/SehirSayfasi';
import ReklamAlani from '@/components/ReklamAlani';

// İl sayfası: açık illerde ilçe ve kategori sayfalarına giden ana sayfa, diğer illerde "yakında" sayfası.
// Veri saatte bir yenilenir.
export const revalidate = 3600;
// 81 ilin hepsi derlemede üretilir; il listesi sabit olduğu için başka adres il sayfası olamaz ve doğrudan 404 alır.
// İlin içeriği (açık ya da yakında) saatte bir yenilenir.
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ sehir: string }>;
}

// API derleme sırasında hata verirse derleme durur: sayfaları boşaltarak yayına çıkmaktansa önceki yayın kalır.
export async function generateStaticParams() {
  const sehirler = await tumSehirler();
  return sehirler.map((s) => ({ sehir: s.slug }));
}

async function sehriBul(slug: string) {
  return (await tumSehirler().catch(() => [])).find((s) => s.slug === slug) || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir: slug } = await params;
  const sehir = await sehriBul(slug);
  if (!sehir) return {};
  const ad = sehir.ad;
  const yol = `/${sehir.slug}`;
  if (!sehir.acik) {
    // Yakında sayfası: ziyaretçiye açık, Google dizinine kapalı (16.11.2026 kararı).
    return {
      title: `${ad} Mekanları · Yakında`,
      description: `Menuland ${ad}${bulunmaEki(ad)} henüz açılmadı. Açık illerdeki mekânlar ve işletme sahipleri için bilgi.`,
      alternates: { canonical: yol },
      robots: { index: false, follow: true },
    };
  }
  const veri = await sehirVerisi(slug).catch(() => null);
  if (!veri) return {};
  const baslik = `${ad} Mekanları: ${veri.isletmeler.length} Mekân, İlçeler ve Kategoriler (${new Date().getFullYear()})`;
  const aciklama = `${ad}${bulunmaEki(ad)} Menuland'de listelenen ${veri.isletmeler.length} mekânı ilçelere ve kategorilere göre keşfedin. Mekân sayfalarında adres ve varsa güncel menü yer alır.`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: { title: `${baslik} | Menuland`, description: aciklama, url: yol, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function SehirSayfasi({ params }: PageProps) {
  const { sehir: slug } = await params;
  const sehir = await sehriBul(slug);
  if (!sehir) notFound();

  if (!sehir.acik) {
    const [enYakin, aciklar] = await Promise.all([enYakinAcikSehir(sehir).catch(() => null), acikSehirler().catch(() => [])]);
    return <SehirYakinda sehir={sehir} enYakin={enYakin} acikSehirler={aciklar} />;
  }

  const veri = await sehirVerisi(slug).catch(() => null);
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
  const gezilecekYerVar = veri.sehir.yerSayisi >= EN_AZ_YER;

  const sayfaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Şehirler', item: `${SITE_URL}/sehirler` },
          { '@type': 'ListItem', position: 3, name: ad, item: `${SITE_URL}${yol}` },
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
      <GezintiIzi parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad: 'Şehirler', yol: '/sehirler' }, { ad }]} />

      <header className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-900">
          <MapPin className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" /> {ad} Mekanları
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">{giris}</p>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          {"Aşağıda ilçe ve kategori sayfalarını bulabilirsiniz. Her sayfa Menuland'deki güncel listeden oluşturulur ve saatte bir yenilenir. Listeler önce öne çıkan mekânlarla, sonra menüsü Menuland'de olanlarla başlar."}
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

      {/* Yandex reklamı (26.11.2026); "yakında" il sayfası bu bölüme gelmez, orada reklam yoktur. */}
      <ReklamAlani yer="sehir-sayfasi" />

      {gezilecekYerVar && (
        <Link
          href={`${yol}/gezilecek-yerler`}
          className="flex items-center gap-3 rounded-3xl border border-gray-100 bg-white p-6 transition-colors hover:border-[#FF4D00]"
        >
          <Landmark className="h-6 w-6 text-[#FF4D00]" aria-hidden="true" />
          <span className="flex flex-col">
            <span className="text-base font-bold text-zinc-900">{`${ad}${bulunmaEki(ad)} Gezilecek Yerler`}</span>
            <span className="text-sm text-zinc-600">Menuland Keşfet'teki yerler, kategorilere göre.</span>
          </span>
        </Link>
      )}

      <EkosistemBolumu utm="sehir-sayfasi" />
    </div>
  );
}
