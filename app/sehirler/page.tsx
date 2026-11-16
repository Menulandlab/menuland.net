import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Clock } from 'lucide-react';
import { tumSehirler, bulunmaEki } from '@/lib/sehirSayfalari';
import { SITE_URL, DEFAULT_OG_IMAGE, jsonLd } from '@/lib/site';
import { GezintiIzi, EkosistemBolumu } from '@/components/SehirSayfasi';

// Bütün illerin listesi (16.11.2026, Türkiye geneline açılış). Açık illerin sayfaları buradan iç bağlantı alır.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Şehirler: Menuland Hangi İllerde Açık?',
  description:
    "Menuland'in açık olduğu iller ve her ilde listelenen mekân sayısı. Henüz açılmayan illerin listesi de bu sayfada.",
  alternates: { canonical: '/sehirler' },
  openGraph: { title: 'Şehirler | Menuland', url: '/sehirler', images: [DEFAULT_OG_IMAGE] },
};

export default async function Sehirler() {
  const sehirler = await tumSehirler().catch(() => []);
  const aciklar = sehirler.filter((s) => s.acik).sort((a, b) => b.isletmeSayisi - a.isletmeSayisi || a.ad.localeCompare(b.ad, 'tr'));
  const yakindakiler = sehirler.filter((s) => !s.acik);

  const sayfaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Şehirler', item: `${SITE_URL}/sehirler` },
        ],
      },
      {
        '@type': 'ItemList',
        name: "Menuland'in açık olduğu iller",
        numberOfItems: aciklar.length,
        itemListElement: aciklar.map((s, sira) => ({
          '@type': 'ListItem',
          position: sira + 1,
          name: `${s.ad} Mekanları`,
          url: `${SITE_URL}/${s.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-10 py-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(sayfaJsonLd) }} />
      <GezintiIzi parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad: 'Şehirler' }]} />

      <header className="flex flex-col gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-900">
          <MapPin className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" /> Şehirler
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          {`Menuland şu an ${aciklar.length} ilde açık. Bir il, en az 3 mekânla açılır ve ilçe ile kategori sayfaları o zaman oluşur. Sayılar Menuland'deki güncel listeden gelir ve saatte bir yenilenir.`}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-zinc-900">Açık iller</h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {aciklar.map((s) => (
            <li key={s.id}>
              <Link
                href={`/${s.slug}`}
                className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 transition-colors hover:border-[#FF4D00]"
              >
                <span className="font-bold text-zinc-900">{`${s.ad} Mekanları`}</span>
                <span className="text-sm text-zinc-500">{`${s.isletmeSayisi} mekân`}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <Clock className="h-5 w-5 text-zinc-400" aria-hidden="true" /> Yakında açılacak iller
        </h2>
        <p className="max-w-3xl text-sm text-zinc-600">
          {`Bu illerin sayfaları hazır; mekânlar eklendikçe açılacaklar. İşletmeniz bu illerden birindeyse il sayfasındaki WhatsApp bağlantısından bize yazabilirsiniz.`}
        </p>
        <ul className="flex flex-wrap gap-2">
          {yakindakiler.map((s) => (
            <li key={s.id}>
              <Link
                href={`/${s.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
                title={`${s.ad}${bulunmaEki(s.ad)} Menuland yakında`}
              >
                {s.ad}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <EkosistemBolumu utm="sehirler-sayfasi" />
    </div>
  );
}
