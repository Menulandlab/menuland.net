import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Landmark } from 'lucide-react';
import { tumSehirler, yerVerisi, bulunmaEki, EN_AZ_YER } from '@/lib/sehirSayfalari';
import { SITE_URL, DEFAULT_OG_IMAGE, jsonLd } from '@/lib/site';
import { GezintiIzi, YerIzgarasi, EkosistemBolumu } from '@/components/SehirSayfasi';

// İlin gezilecek yerleri (16.11.2026, Türkiye geneline açılış). Veri Menuland Keşfet'teki yerlerden gelir.
// Sayfa yalnızca en az EN_AZ_YER gösterilebilir yer varsa oluşur. Kültür Portalı'ndan alınmış metin ve fotoğraflar,
// sitenin kullanım koşulları kontrol edilene kadar gösterilmez (lib/sehirSayfalari.ts gosterilebilirYer).
export const revalidate = 3600;
// Eşiği sonradan geçen ilin sayfası ilk ziyarette üretilir; eşiğin altındaki ya da olmayan il 404 alır (18.11.2026).
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ sehir: string }>;
}

// API derleme sırasında hata verirse derleme durur.
export async function generateStaticParams() {
  const sehirler = (await tumSehirler()).filter((s) => s.yerSayisi >= EN_AZ_YER);
  const sonuc: Array<{ sehir: string }> = [];
  for (const s of sehirler) {
    if (await yerVerisi(s.slug)) sonuc.push({ sehir: s.slug });
  }
  return sonuc;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { sehir } = await params;
  const veri = await yerVerisi(sehir).catch(() => null);
  if (!veri) return {};
  const ad = veri.sehir.ad;
  const baslik = `${ad}${bulunmaEki(ad)} Gezilecek Yerler`;
  const kategoriler = veri.kategoriler.slice(0, 4).map((k) => k.ad.replace(/\?$/, '').toLocaleLowerCase('tr'));
  const aciklama = `${ad}${bulunmaEki(ad)} gezilecek ${veri.yerler.length} yer${kategoriler.length ? `: ${kategoriler.join(', ')}` : ''}. Menuland Keşfet'ten, kısa açıklamalarıyla.`;
  const yol = `/${veri.sehir.slug}/gezilecek-yerler`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: { title: `${baslik} | Menuland`, description: aciklama, url: yol, images: [DEFAULT_OG_IMAGE] },
  };
}

export default async function GezilecekYerler({ params }: PageProps) {
  const { sehir } = await params;
  const veri = await yerVerisi(sehir).catch(() => null);
  if (!veri) notFound();

  const ad = veri.sehir.ad;
  const sehirYolu = `/${veri.sehir.slug}`;
  const yol = `${sehirYolu}/gezilecek-yerler`;
  const yerlerById = new Map(veri.yerler.map((y) => [y.id, y]));
  const kategorideOlanlar = new Set(veri.kategoriler.flatMap((k) => k.yerIdleri));
  const digerleri = veri.yerler.filter((y) => !kategorideOlanlar.has(y.id));

  const sayfaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Şehirler', item: `${SITE_URL}/sehirler` },
          { '@type': 'ListItem', position: 3, name: ad, item: `${SITE_URL}${sehirYolu}` },
          { '@type': 'ListItem', position: 4, name: 'Gezilecek Yerler', item: `${SITE_URL}${yol}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: `${ad}${bulunmaEki(ad)} gezilecek yerler`,
        numberOfItems: veri.yerler.length,
        itemListElement: veri.yerler.map((y, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: y.ad,
          url: `${SITE_URL}/kesfet/place/${y.id}`,
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-10 py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(sayfaJsonLd) }} />
      <GezintiIzi
        parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad: 'Şehirler', yol: '/sehirler' }, { ad, yol: sehirYolu }, { ad: 'Gezilecek Yerler' }]}
      />

      <header className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-900">
          <Landmark className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" /> {`${ad}${bulunmaEki(ad)} Gezilecek Yerler`}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          {`Menuland Keşfet'te ${ad} için ${veri.yerler.length} yer var. Yerler aşağıda kategorilere göre listeleniyor; bir yer birden çok kategoride olabilir. Yerin adına basarak açıklamasını ve konumunu görebilirsiniz.`}
        </p>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          <Link href={sehirYolu} className="font-semibold text-[#FF4D00]">
            {`${ad} mekânları`}
          </Link>
          {' sayfasında il genelindeki restoran ve kafeleri bulabilirsiniz.'}
        </p>
      </header>

      {veri.kategoriler.map((k) => {
        const yerler = k.yerIdleri.map((id) => yerlerById.get(id)).filter((y): y is NonNullable<typeof y> => Boolean(y));
        return (
          <section key={k.slug} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-zinc-900">{k.ad}</h2>
              {k.aciklama && <p className="text-sm text-zinc-500">{k.aciklama}</p>}
            </div>
            <YerIzgarasi yerler={yerler} />
          </section>
        );
      })}

      {digerleri.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-zinc-900">Diğer yerler</h2>
          <YerIzgarasi yerler={digerleri} />
        </section>
      )}

      <EkosistemBolumu utm="gezilecek-yerler" />
    </div>
  );
}
