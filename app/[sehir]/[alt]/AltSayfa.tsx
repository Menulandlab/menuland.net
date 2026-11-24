import type { Metadata } from 'next';
import { cache } from 'react';
import type React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Utensils } from 'lucide-react';
import {
  sehirVerisi,
  kategoriBasligi,
  bulunmaEki,
  listeHalinde,
  type SehirVerisi,
  type SehirIlcesi,
  type SehirKategorisi,
  type SehirIsletmesi,
} from '@/lib/sehirSayfalari';
import { SITE_URL, DEFAULT_OG_IMAGE, jsonLd, kisalt } from '@/lib/site';
import { getBusinessUrl } from '@/lib/utils';
import { GezintiIzi, IsletmeIzgarasi, BaglantiCipleri, EkosistemBolumu, SikSorulanlar, IsletmeAdlari } from '@/components/SehirSayfasi';

/**
 * Şehir × kategori (örneğin /ordu/kahvalti) ya da ilçe (örneğin /ordu/altinordu) sayfasının içeriği ve başlıkları.
 * 1. sayfa ana adreste (app/[sehir]/[alt]/page.tsx), sonraki sayfalar /istanbul/fast-food/2 gibi adreslerde
 * (app/[sehir]/[alt]/[sayfa]/page.tsx) çizilir.
 *
 * Sayfa başına SAYFA_BOYU işletme (23.11.2026). Önce bütün işletmeler tek sayfadaydı; zincir şubeleri yüklenince
 * /istanbul/fast-food 595 işletmeyle 2,4 MB'a çıktı. Sayfa numarası adreste yol olarak durur (?sayfa= değil); böylece
 * sayfalar saatlik önbellekten sunulmaya devam eder.
 */
export const SAYFA_BOYU = 48;

type Sayfa =
  | { tur: 'ilce'; veri: SehirVerisi; ilce: SehirIlcesi; isletmeler: SehirIsletmesi[] }
  | { tur: 'kategori'; veri: SehirVerisi; kategori: SehirKategorisi; isletmeler: SehirIsletmesi[] };

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

function sayfaSayisi(s: Sayfa): number {
  return Math.max(1, Math.ceil(s.isletmeler.length / SAYFA_BOYU));
}

/** Sayfanın adresi: 1. sayfa ana adres, sonrakiler sonuna sayfa numarası eklenmiş adres. */
function sayfaYolu(yol: string, no: number): string {
  return no > 1 ? `${yol}/${no}` : yol;
}

export async function altSayfaMetadata(sehir: string, alt: string, no: number): Promise<Metadata> {
  const s = await sayfayiBul(sehir, alt);
  if (!s || no > sayfaSayisi(s)) return {};
  const sehirAdi = s.veri.sehir.ad;
  const n = s.isletmeler.length;
  // "Giresun Merkez" gibi il adını zaten taşıyan ilçede il adı tekrar yazılmaz.
  const anaBaslik =
    s.tur === 'ilce'
      ? s.ilce.ad.startsWith(sehirAdi)
        ? `${s.ilce.ad} Mekanları`
        : `${s.ilce.ad} Mekanları · ${sehirAdi}`
      : sayfaBasligi(s);
  // Gerçek sayı ve yıl başlıkta (24.11.2026, Search Console: bu sayfalar 9,5. sırada, tıklanma %0,69).
  const sayili = `${anaBaslik}: ${n} Mekân (${new Date().getFullYear()})`;
  const baslik = no > 1 ? `${anaBaslik} · Sayfa ${no}` : sayili;
  // Google açıklamayı yaklaşık 158 karakterde keser; sayı ve ilk adlar önde (24.11.2026).
  const anaAciklama = kisalt(
    s.tur === 'ilce'
      ? `${s.ilce.ad}${bulunmaEki(s.ilce.ad)} ${n} mekân: ${adlarIleOzet(s.isletmeler)}. Varsa menü, adres ve yol tarifi Menuland'de.`
      : `${sehirAdi}${bulunmaEki(sehirAdi)} “${s.kategori.ad}” kategorisinde ${n} mekân: ${adlarIleOzet(s.isletmeler)}. Varsa menü, adres ve yol tarifi Menuland'de.`,
    158
  );
  const aciklama = no > 1 ? `${anaAciklama} Sayfa ${no} / ${sayfaSayisi(s)}.` : anaAciklama;
  const yol = sayfaYolu(`/${s.veri.sehir.slug}/${alt}`, no);
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
    openGraph: { title: `${baslik} | Menuland`, description: aciklama, url: yol, images: [DEFAULT_OG_IMAGE] },
  };
}

export async function AltSayfa({ sehir, alt, no }: { sehir: string; alt: string; no: number }) {
  const s = await sayfayiBul(sehir, alt);
  if (!s) notFound();
  const toplamSayfa = sayfaSayisi(s);
  // Var olmayan sayfa numarası gerçek 404 olur (boş sayfa dizine girmesin).
  if (no < 1 || no > toplamSayfa) notFound();

  const { veri, isletmeler } = s;
  const bastan = (no - 1) * SAYFA_BOYU;
  const gosterilen = isletmeler.slice(bastan, bastan + SAYFA_BOYU);
  const sehirAdi = veri.sehir.ad;
  const sehirYolu = `/${veri.sehir.slug}`;
  const yol = `${sehirYolu}/${alt}`;
  const baslik = sayfaBasligi(s);
  const kategoriAdlari: Record<number, string> = Object.fromEntries(veri.kategoriler.map((k) => [k.id, k.ad]));
  const bolumAdi = s.tur === 'ilce' ? s.ilce.ad : s.kategori.ad;

  // Giriş metni yalnızca bu sayfanın verisinden hesaplanır (bütün sayfalardaki işletmeler sayılır).
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
  const etiketVar = gosterilen.some((i) => i.menulu || i.rezervasyon || i.gelAl);

  // Sayfanın verisinden sorular ve cevaplar (24.11.2026); verisi olmayan soru gösterilmez.
  const menulular = isletmeler.filter((i) => i.menulu);
  const rezervasyonlular = isletmeler.filter((i) => i.rezervasyon);
  const gelAllilar = isletmeler.filter((i) => i.gelAl);
  const kimler = s.tur === 'ilce' ? `${s.ilce.ad} mekânları` : baslik;
  const sorular: Array<{ soru: string; cevap: React.ReactNode }> = [];
  if (s.tur === 'kategori') {
    const ilceSayilari = new Map<number, number>();
    for (const i of isletmeler) if (i.ilceId) ilceSayilari.set(i.ilceId, (ilceSayilari.get(i.ilceId) || 0) + 1);
    const ilceler = [...ilceSayilari.entries()]
      .filter(([d]) => veri.ilceAdlari[d])
      .sort((a, b) => b[1] - a[1] || veri.ilceAdlari[a[0]].localeCompare(veri.ilceAdlari[b[0]], 'tr'))
      .slice(0, 6);
    if (ilceler.length > 1) {
      sorular.push({
        soru: `${baslik} en çok hangi ilçelerde?`,
        cevap: (
          <>
            {ilceler.map(([d, n], sira) => {
              const sayfa = veri.ilceler.find((x) => x.id === d);
              const ad = `${veri.ilceAdlari[d]} (${n})`;
              return (
                <span key={d}>
                  {sira > 0 && (sira === ilceler.length - 1 ? ' ve ' : ', ')}
                  {sayfa ? (
                    <Link href={`${sehirYolu}/${sayfa.slug}`} className="font-semibold text-[#D63F00] hover:underline">
                      {ad}
                    </Link>
                  ) : (
                    ad
                  )}
                </span>
              );
            })}
            .
          </>
        ),
      });
    }
  } else {
    const sayilar = new Map<number, number>();
    for (const i of isletmeler) for (const k of new Set(i.kategoriIdleri)) sayilar.set(k, (sayilar.get(k) || 0) + 1);
    const turler = veri.kategoriler
      .filter((k) => (sayilar.get(k.id) || 0) > 0)
      .sort((a, b) => (sayilar.get(b.id) || 0) - (sayilar.get(a.id) || 0) || a.ad.localeCompare(b.ad, 'tr'))
      .slice(0, 6);
    if (turler.length > 1) {
      sorular.push({
        soru: `${s.ilce.ad}${bulunmaEki(s.ilce.ad)} en çok hangi tür mekânlar var?`,
        cevap: (
          <>
            {turler.map((k, sira) => (
              <span key={k.id}>
                {sira > 0 && (sira === turler.length - 1 ? ' ve ' : ', ')}
                {`${k.ad} (${sayilar.get(k.id)})`}
              </span>
            ))}
            {`. ${sehirAdi} genelindeki kategori sayfaları aşağıda.`}
          </>
        ),
      });
    }
  }
  if (menulular.length > 0) {
    sorular.push({ soru: `Menüsü Menuland'de olan ${kimler} hangileri?`, cevap: <IsletmeAdlari isletmeler={menulular} /> });
  }
  if (rezervasyonlular.length > 0) {
    sorular.push({
      soru: `Menuland'den rezervasyon yapılabilen ${kimler} hangileri?`,
      cevap: <IsletmeAdlari isletmeler={rezervasyonlular} />,
    });
  }
  if (gelAllilar.length > 0) {
    sorular.push({ soru: `Menuland'den Gel-Al siparişi verilebilen ${kimler} hangileri?`, cevap: <IsletmeAdlari isletmeler={gelAllilar} /> });
  }

  const sayfaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Şehirler', item: `${SITE_URL}/sehirler` },
          { '@type': 'ListItem', position: 3, name: sehirAdi, item: `${SITE_URL}${sehirYolu}` },
          { '@type': 'ListItem', position: 4, name: bolumAdi, item: `${SITE_URL}${yol}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: baslik,
        numberOfItems: isletmeler.length,
        // Yalnızca bu sayfadaki işletmeler; sıra numarası bütün listedeki yeridir.
        itemListElement: gosterilen.map((i, sira) => ({
          '@type': 'ListItem',
          position: bastan + sira + 1,
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
      <GezintiIzi parcalar={[{ ad: 'Ana Sayfa', yol: '/' }, { ad: 'Şehirler', yol: '/sehirler' }, { ad: sehirAdi, yol: sehirYolu }, { ad: bolumAdi }]} />

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
          {"Liste önce öne çıkan mekânlarla, sonra menüsü Menuland'de olanlarla başlar. Mekânın adına basarak adresini ve varsa güncel menüsünü görebilirsiniz."}
          {etiketVar && ' Kartlardaki “Menü”, “Rezervasyon” ve “Gel-Al” etiketleri, mekânın menüsünün ya da bu hizmetin Menuland üzerinden sunulduğunu gösterir.'}
        </p>
      </header>

      <IsletmeIzgarasi isletmeler={gosterilen} ilceAdlari={veri.ilceAdlari} kategoriAdlari={kategoriAdlari} />

      {toplamSayfa > 1 && (
        <nav aria-label="Sayfalar" className="flex items-center justify-center gap-4 text-sm">
          {no > 1 && (
            <Link href={sayfaYolu(yol, no - 1)} rel="prev" className="font-semibold text-[#FF4D00]">
              ← Önceki
            </Link>
          )}
          <span className="text-zinc-500">{`Sayfa ${no} / ${toplamSayfa} (${isletmeler.length} mekân)`}</span>
          {no < toplamSayfa && (
            <Link href={sayfaYolu(yol, no + 1)} rel="next" className="font-semibold text-[#FF4D00]">
              Sonraki →
            </Link>
          )}
        </nav>
      )}

      {no === 1 && <SikSorulanlar baslik="Kısaca" sorular={sorular} />}

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
