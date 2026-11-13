import Link from 'next/link';
import { MapPin, Utensils, CalendarCheck, ShoppingBag, ChevronRight, Smartphone, Store } from 'lucide-react';
import { getBusinessUrl } from '@/lib/utils';
import { APP_STORE_URL, GOOGLE_PLAY_URL, KURUMSAL_URL } from '@/lib/site';
import type { SehirIsletmesi } from '@/lib/sehirSayfalari';

/** Sayfanın üstündeki gezinti izi: Ana Sayfa / Ordu / Kahvaltı */
export function GezintiIzi({ parcalar }: { parcalar: Array<{ ad: string; yol?: string }> }) {
  return (
    <nav aria-label="Gezinti izi" className="text-xs text-zinc-500">
      <ol className="flex flex-wrap items-center gap-1">
        {parcalar.map((p, i) => (
          <li key={`${p.ad}-${i}`} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-300" aria-hidden="true" />}
            {p.yol ? (
              <Link href={p.yol} className="hover:text-[#FF4D00] transition-colors">
                {p.ad}
              </Link>
            ) : (
              <span className="font-semibold text-zinc-700" aria-current="page">
                {p.ad}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** İşletme kartları. Fiyat ve puan gösterilmez; etiketler yalnızca işletmenin Menuland'de açtığı hizmetleri söyler. */
export function IsletmeIzgarasi({
  isletmeler,
  ilceAdlari,
  kategoriAdlari,
}: {
  isletmeler: SehirIsletmesi[];
  ilceAdlari: Record<number, string>;
  kategoriAdlari: Record<number, string>;
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {isletmeler.map((i) => {
        const ilce = i.ilceId ? ilceAdlari[i.ilceId] : '';
        const kategoriler = i.kategoriIdleri.map((k) => kategoriAdlari[k]).filter(Boolean).slice(0, 3);
        return (
          <li key={i.id}>
            <Link
              href={getBusinessUrl({ id: i.id, slug: i.slug, name: i.ad })}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-lg"
            >
              <div className="relative h-40 w-full overflow-hidden bg-zinc-100">
                {i.gorsel ? (
                  <img
                    src={i.gorsel}
                    alt={i.ad}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <Utensils className="h-9 w-9" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="line-clamp-1 text-base font-bold text-zinc-900 transition-colors group-hover:text-[#FF4D00]">
                  {i.ad}
                </h3>
                {ilce && (
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                    {ilce}
                  </span>
                )}
                {kategoriler.length > 0 && <p className="line-clamp-1 text-xs text-zinc-500">{kategoriler.join(' · ')}</p>}
                {i.aciklama && <p className="line-clamp-2 text-sm text-zinc-600">{i.aciklama}</p>}
                {(i.rezervasyon || i.gelAl) && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {i.rezervasyon && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]">
                        <CalendarCheck className="h-3 w-3" aria-hidden="true" /> Rezervasyon
                      </span>
                    )}
                    {i.gelAl && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]">
                        <ShoppingBag className="h-3 w-3" aria-hidden="true" /> Gel-Al
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Başka şehir sayfalarına bağlantı çipleri. */
export function BaglantiCipleri({ baslik, baglantilar }: { baslik: string; baglantilar: Array<{ ad: string; yol: string; sayi?: number }> }) {
  if (baglantilar.length === 0) return null;
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold text-zinc-900">{baslik}</h2>
      <ul className="flex flex-wrap gap-2">
        {baglantilar.map((b) => (
          <li key={b.yol}>
            <Link
              href={b.yol}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-zinc-700 transition-colors hover:border-[#FF4D00] hover:text-[#FF4D00]"
            >
              {b.ad}
              {typeof b.sayi === 'number' && <span className="text-xs text-zinc-400">{b.sayi}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Menuland'in iki yüzü: misafir için uygulama, işletme için panel. Yalnızca bugün gerçekten var olan özellikler yazılır.
 */
export function EkosistemBolumu({ utm }: { utm: string }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <Smartphone className="h-5 w-5 text-[#FF4D00]" aria-hidden="true" /> Menuland uygulamasıyla keşfedin
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600">
          {"Uygulamada bu mekânları haritada görebilir, kararsız kaldığınızda “Ne Yesem?” ile seçim yapabilir ve Lezzet Akışı'nda " +
            "fotoğraflı yorumları okuyabilirsiniz. Destekleyen mekânlarda rezervasyon yapabilir ya da Gel-Al siparişi verebilir, " +
            "PuanLand'de puan biriktirebilirsiniz."}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-[#FF4D00] hover:text-[#FF4D00]"
          >
            App Store
          </a>
          <a
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-[#FF4D00] hover:text-[#FF4D00]"
          >
            Google Play
          </a>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-orange-50/60 p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
          <Store className="h-5 w-5 text-[#FF4D00]" aria-hidden="true" /> İşletme sahibi misiniz?
        </h2>
        <p className="text-sm leading-relaxed text-zinc-700">
          {"Menünüzü biz giriyoruz, fiyatları siz panelden güncelliyorsunuz. Masadaki QR menü, Menuland uygulaması ve " +
            "menuland.net'teki sayfanız aynı menüyü gösterdiği için fiyatı bir kez değiştirmeniz yeterli."}
        </p>
        <a
          href={`${KURUMSAL_URL}/?utm_source=menuland.net&utm_medium=${utm}`}
          className="self-start rounded-xl bg-[#FF4D00] px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
        >
          İşletmeler için Menuland
        </a>
      </div>
    </section>
  );
}
