import Link from 'next/link';
import type { ReactNode } from 'react';
import { MapPin, Utensils, CalendarCheck, ShoppingBag, ChevronRight, Smartphone, Store, Clock, Landmark } from 'lucide-react';
import { getBusinessUrl } from '@/lib/utils';
import { APP_STORE_URL, GOOGLE_PLAY_URL, KURUMSAL_URL, whatsappBaglantisi } from '@/lib/site';
import { bulunmaEki, listeHalinde, type Sehir, type SehirIsletmesi, type Yer } from '@/lib/sehirSayfalari';

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
                {(i.menulu || i.rezervasyon || i.gelAl) && (
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                    {i.menulu && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-[#C2410C]">
                        <Utensils className="h-3 w-3" aria-hidden="true" /> Menü
                      </span>
                    )}
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
/**
 * Sayfanın verisinden kurulan kısa sorular ve cevaplar (24.11.2026). Yalnızca verisi olan soru gösterilir;
 * cevaplardaki mekân adları mekân sayfalarına bağlanır.
 */
export function SikSorulanlar({ baslik, sorular }: { baslik: string; sorular: Array<{ soru: string; cevap: ReactNode }> }) {
  if (sorular.length === 0) return null;
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6">
      <h2 className="text-lg font-bold text-zinc-900">{baslik}</h2>
      <div className="flex flex-col divide-y divide-gray-100">
        {sorular.map((s) => (
          <div key={s.soru} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
            <h3 className="text-sm font-bold text-zinc-900">{s.soru}</h3>
            <div className="text-sm leading-relaxed text-zinc-600">{s.cevap}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Mekân adlarını mekân sayfalarına bağlanmış, virgülle ayrılmış liste olarak yazar; fazlası "ve N mekân daha" olur. */
export function IsletmeAdlari({ isletmeler, enCok = 8 }: { isletmeler: Array<{ id: number; ad: string; slug: string | null }>; enCok?: number }) {
  const gosterilen = isletmeler.slice(0, enCok);
  const kalan = isletmeler.length - gosterilen.length;
  return (
    <>
      {gosterilen.map((i, sira) => (
        <span key={i.id}>
          {sira > 0 && (sira === gosterilen.length - 1 && kalan === 0 ? ' ve ' : ', ')}
          <Link href={getBusinessUrl({ id: i.id, slug: i.slug, name: i.ad })} className="font-semibold text-[#D63F00] hover:underline">
            {i.ad}
          </Link>
        </span>
      ))}
      {kalan > 0 && ` ve ${kalan} mekân daha`}
      .
    </>
  );
}

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

/**
 * Henüz açılmamış ilin sayfası (16.11.2026, Türkiye geneline açılış). Sayfa ziyaretçiye açıktır ama noindex taşır ve
 * site haritasına girmez; il en az 3 mekânla açılınca kendiliğinden tam sayfaya döner. Yalnızca bugün doğru olan
 * bilgiler yazılır: kaç mekân olduğu, en yakın açık il ve işletme sahibine çağrı.
 */
export function SehirYakinda({
  sehir,
  enYakin,
  acikSehirler,
}: {
  sehir: Sehir;
  enYakin: { sehir: Sehir; km: number } | null;
  acikSehirler: Sehir[];
}) {
  const ad = sehir.ad;
  const isletmeMesaji = `Merhaba, ${ad}${bulunmaEki(ad)} işletmem var. Menuland'e katılmak istiyorum.`;
  return (
    <div className="flex flex-col gap-10 py-4">
      <GezintiIzi parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad: 'Şehirler', yol: '/sehirler' }, { ad }]} />

      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-[#C2410C]">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Yakında
        </span>
        <h1 className="flex items-center gap-2 text-3xl font-black tracking-tight text-zinc-900">
          <MapPin className="h-7 w-7 text-[#FF4D00]" aria-hidden="true" /> {ad} Mekanları
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
          {`Menuland ${ad}${bulunmaEki(ad)} henüz açılmadı. ${
            sehir.isletmeSayisi > 0
              ? `Şu an ${sehir.isletmeSayisi} mekân listeleniyor; il, en az 3 mekânla açılır.`
              : 'Bu ildeki mekânları eklemeye hazırlanıyoruz.'
          }`}
        </p>
        {acikSehirler.length > 0 && (
          <p className="max-w-3xl text-sm leading-relaxed text-zinc-600">
            {`Şu an açık olan iller: ${listeHalinde(acikSehirler.map((s) => s.ad))}.`}
          </p>
        )}
      </header>

      {enYakin && (
        <section className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6">
          <h2 className="text-lg font-bold text-zinc-900">En yakın açık il</h2>
          <p className="text-sm text-zinc-600">
            {`${enYakin.sehir.ad}, ${ad} il merkezine kuş uçuşu yaklaşık ${Math.round(enYakin.km)} km uzaklıkta.`}
          </p>
          <Link
            href={`/${enYakin.sehir.slug}`}
            className="self-start rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-[#FF4D00] hover:text-[#FF4D00]"
          >
            {`${enYakin.sehir.ad} Mekanları`}
          </Link>
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-3xl border border-orange-100 bg-orange-50/60 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <Store className="h-5 w-5 text-[#FF4D00]" aria-hidden="true" /> {`${ad}${bulunmaEki(ad)} işletmeniz mi var?`}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-700">
            {"Menünüzü biz giriyoruz; menü girişi şu an ücretsiz. Masadaki QR menü, Menuland uygulaması ve menuland.net'teki " +
              'sayfanız aynı menüyü gösterir. Bize WhatsApp\'tan yazın.'}
          </p>
          <a
            href={whatsappBaglantisi(isletmeMesaji, 'WEB-YAKINDA')}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start rounded-xl bg-[#FF4D00] px-4 py-2 text-sm font-semibold text-white hover:brightness-105"
          >
            {"WhatsApp'tan yazın"}
          </a>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <Smartphone className="h-5 w-5 text-[#FF4D00]" aria-hidden="true" /> Menuland uygulaması
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">
            Açık illerdeki mekânların menülerine, haritaya ve Ne Yesem?&apos;e uygulamadan ulaşabilirsiniz.
          </p>
          <div className="flex flex-wrap gap-2">
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-[#FF4D00] hover:text-[#FF4D00]">
              App Store
            </a>
            <a href={GOOGLE_PLAY_URL} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 hover:border-[#FF4D00] hover:text-[#FF4D00]">
              Google Play
            </a>
          </div>
        </div>
      </section>

      <Link href="/sehirler" className="self-start text-sm font-semibold text-[#FF4D00]">
        Bütün illeri gör
      </Link>
    </div>
  );
}

/** Gezilecek yer kartları; her kart Keşfet'teki yer sayfasına gider. */
export function YerIzgarasi({ yerler }: { yerler: Yer[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {yerler.map((y) => (
        <li key={y.id}>
          <Link
            href={`/kesfet/place/${y.id}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-lg"
          >
            <div className="relative h-40 w-full overflow-hidden bg-zinc-100">
              {y.gorsel ? (
                <img src={y.gorsel} alt={y.ad} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-zinc-300">
                  <Landmark className="h-9 w-9" aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="line-clamp-1 text-base font-bold text-zinc-900 transition-colors group-hover:text-[#FF4D00]">{y.ad}</h3>
              {y.ilce && (
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
                  {y.ilce}
                </span>
              )}
              {y.aciklama && <p className="line-clamp-3 text-sm text-zinc-600">{y.aciklama}</p>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
